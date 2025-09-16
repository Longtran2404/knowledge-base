import React from "react";
import { cn } from "../../lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bounce";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function Loading({
  size = "md",
  variant = "spinner",
  className,
  text,
}: LoadingProps) {
  const baseClasses = sizeClasses[size];

  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            baseClasses
          )}
        />
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-blue-600 rounded-full animate-bounce",
                size === "sm"
                  ? "w-2 h-2"
                  : size === "md"
                  ? "w-3 h-3"
                  : size === "lg"
                  ? "w-4 h-4"
                  : "w-5 h-5"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div
          className={cn("bg-blue-600 rounded-full animate-pulse", baseClasses)}
        />
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  }

  if (variant === "bounce") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce",
                size === "sm"
                  ? "w-2 h-2"
                  : size === "md"
                  ? "w-3 h-3"
                  : size === "lg"
                  ? "w-4 h-4"
                  : "w-5 h-5"
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  }

  return null;
}

// Full page loading component
export function FullPageLoading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-strong p-8 flex flex-col items-center gap-4">
        <Loading size="lg" variant="spinner" />
        <p className="text-lg font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
}

// Skeleton loading components
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Button loading state
interface ButtonLoadingProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLoading({
  loading = false,
  loadingText = "Đang tải...",
  children,
  className,
}: ButtonLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        </div>
      )}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}

// Form loading state
interface FormLoadingProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormLoading({
  loading = false,
  loadingText = "Đang xử lý...",
  children,
  className,
}: FormLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 rounded-lg z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        </div>
      )}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}
