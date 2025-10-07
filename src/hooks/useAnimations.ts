/**
 * Custom hooks for smooth animations and transitions
 */

import { useState, useEffect, useRef } from "react";

// Fade in animation hook
export function useFadeIn(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return {
    ref: elementRef,
    className: `transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`,
  };
}

// Slide up animation hook
export function useSlideUp(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return {
    ref: elementRef,
    className: `transition-all duration-500 ease-out ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`,
  };
}

// Scale animation hook
export function useScale(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return {
    ref: elementRef,
    className: `transition-all duration-300 ease-out ${
      isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
    }`,
  };
}

// Pulse animation for loading states
export function usePulse() {
  return "animate-pulse";
}

// Bounce animation for success states
export function useBounce() {
  return "animate-bounce";
}

// Shake animation for error states
export function useShake() {
  return "animate-pulse";
}

// Progress bar animation
export function useProgressBar(duration: number = 3000) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  return progress;
}

// Typewriter effect
export function useTypewriter(text: string, speed: number = 100) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return displayText;
}
