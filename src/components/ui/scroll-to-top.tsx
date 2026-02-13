import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  showOnScroll?: boolean;
}

export function ScrollToTop({
  threshold = 300,
  className,
  showOnScroll = true,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible && showOnScroll) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-32 right-8 z-40 p-3 bg-card border border-border rounded-full shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-110 active:scale-95",
        "hover:bg-primary/5 hover:border-primary/30 group",
        className
      )}
      aria-label="Cuộn lên đầu trang"
    >
      <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}

// Enhanced version with progress indicator
export function ScrollToTopWithProgress({
  threshold = 300,
  className,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed bottom-32 right-8 z-40", className)}>
      {/* Progress circle */}
      <div className="relative w-12 h-12 mb-2">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-primary transition-all duration-300"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${scrollProgress}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-card border border-border rounded-full shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-110 active:scale-95 hover:bg-primary/5 hover:border-primary/30 group flex items-center justify-center"
        aria-label="Cuộn lên đầu trang"
      >
        <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>
    </div>
  );
}

// Floating action button version
export function FloatingScrollToTop({
  threshold = 300,
  className,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > threshold);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "fixed bottom-32 right-8 z-40 transition-all duration-500 transform",
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none",
        className
      )}
    >
      <button
        onClick={scrollToTop}
        className="w-14 h-14 gradient-bg-primary text-primary-foreground rounded-full shadow-strong hover:shadow-glow transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group"
        aria-label="Cuộn lên đầu trang"
      >
        <ChevronUp className="h-6 w-6 group-hover:animate-bounce" />
      </button>
    </div>
  );
}
