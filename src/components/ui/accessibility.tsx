import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

// Focus trap for modals and dropdowns
interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}

export function FocusTrap({ children, active, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Skip to content link
interface SkipToContentProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipToContent({
  targetId = "main-content",
  children = "Bỏ qua đến nội dung chính",
  className,
}: SkipToContentProps) {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "bg-blue-600 text-white px-4 py-2 rounded-lg font-medium",
        "transition-all duration-200 z-50",
        className
      )}
    >
      {children}
    </a>
  );
}

// Screen reader only text
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderOnly({
  children,
  className,
}: ScreenReaderOnlyProps) {
  return <span className={cn("sr-only", className)}>{children}</span>;
}

// High contrast mode support
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion support
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// Announce changes to screen readers
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute("aria-live", priority);
      announcerRef.current.textContent = message;
    }
  };

  return { announce, announcerRef };
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleKeyDown = (e: KeyboardEvent, items: any[]) => {
    if (!isNavigating) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case "Escape":
        setIsNavigating(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return {
    focusedIndex,
    isNavigating,
    setIsNavigating,
    handleKeyDown,
  };
}

// ARIA live region component
interface AriaLiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
  className?: string;
}

export function AriaLiveRegion({
  message,
  priority = "polite",
  className,
}: AriaLiveRegionProps) {
  return (
    <div
      className={cn("sr-only", className)}
      aria-live={priority}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export function AccessibleButton({
  children,
  loading = false,
  loadingText = "Đang tải...",
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="sr-only">{loadingText}</span>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Accessible form field
interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleFormField({
  label,
  error,
  hint,
  required = false,
  children,
  className,
}: AccessibleFormFieldProps) {
  const fieldId = React.useId();
  const errorId = React.useId();
  const hintId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="bắt buộc">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}

      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          "aria-describedby":
            [hintId, errorId].filter(Boolean).join(" ") || undefined,
          "aria-invalid": !!error,
          "aria-required": required,
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible table
interface AccessibleTableProps {
  caption?: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTable({
  caption,
  children,
  className,
}: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn("min-w-full divide-y divide-gray-200", className)}
        role="table"
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

// Accessible modal
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className={cn(
            "relative bg-white rounded-2xl shadow-strong max-w-lg w-full",
            className
          )}
        >
          <div className="p-6">
            <h2 id="modal-title" className="text-xl font-semibold mb-4">
              {title}
            </h2>
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

// Color contrast checker
export function useColorContrast() {
  const checkContrast = (foreground: string, background: string) => {
    // Simple contrast ratio calculation
    // In a real implementation, you'd want to use a proper color contrast library
    const getLuminance = (color: string) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;

      const [r, g, b] = rgb.map((c) => {
        const val = parseInt(c) / 255;
        return val <= 0.03928
          ? val / 12.92
          : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fgLuminance = getLuminance(foreground);
    const bgLuminance = getLuminance(background);

    const contrast =
      (Math.max(fgLuminance, bgLuminance) + 0.05) /
      (Math.min(fgLuminance, bgLuminance) + 0.05);

    return {
      ratio: contrast,
      meetsAA: contrast >= 4.5,
      meetsAAA: contrast >= 7,
    };
  };

  return { checkContrast };
}
