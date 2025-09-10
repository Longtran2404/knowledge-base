import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Eye,
  MousePointer,
} from "lucide-react";

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "scroll" | "wait";
  actionText?: string;
  nextButtonText?: string;
  skipButtonText?: string;
  highlight?: boolean;
  pulse?: boolean;
  delay?: number;
}

export interface TourGuideProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
  storageKey?: string;
  autoStart?: boolean;
  showProgress?: boolean;
  showSkip?: boolean;
  theme?: "light" | "dark" | "blue" | "purple";
}

const TourGuide: React.FC<TourGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  onStepChange,
  storageKey = "nlc_tour_completed",
  autoStart = false,
  showProgress = true,
  showSkip = true,
  theme = "blue",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 text-white border-gray-700";
      case "blue":
        return "bg-blue-600 text-white border-blue-500";
      case "purple":
        return "bg-purple-600 text-white border-purple-500";
      default:
        return "bg-white text-gray-900 border-gray-200";
    }
  };

  const getThemeButtonClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-800 hover:bg-gray-700 text-white";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "purple":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      default:
        return "bg-gray-900 hover:bg-gray-800 text-white";
    }
  };

  const findTargetElement = (selector: string): HTMLElement | null => {
    try {
      return document.querySelector(selector) as HTMLElement;
    } catch {
      return null;
    }
  };

  const calculateOverlayStyle = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    return {
      position: "absolute" as const,
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
      zIndex: 1000,
    };
  };

  const calculateTooltipPosition = (
    element: HTMLElement,
    position: string = "bottom"
  ) => {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipWidth = tooltipRect?.width || 300;
    const tooltipHeight = tooltipRect?.height || 200;

    const spacing = 20;
    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - tooltipHeight - spacing;
        left = rect.left + (rect.width - tooltipWidth) / 2;
        break;
      case "bottom":
        top = rect.bottom + spacing;
        left = rect.left + (rect.width - tooltipWidth) / 2;
        break;
      case "left":
        top = rect.top + (rect.height - tooltipHeight) / 2;
        left = rect.left - tooltipWidth - spacing;
        break;
      case "right":
        top = rect.top + (rect.height - tooltipHeight) / 2;
        left = rect.right + spacing;
        break;
      case "center":
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = window.innerHeight - tooltipHeight - 10;
    }

    return {
      position: "fixed" as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1001,
    };
  };

  const updateTargetElement = useCallback(() => {
    if (!currentStepData) return;

    const element = findTargetElement(currentStepData.target);
    setTargetElement(element);

    if (element) {
      setOverlayStyle(calculateOverlayStyle(element));
      setTooltipStyle(
        calculateTooltipPosition(element, currentStepData.position)
      );
      setIsVisible(true);
    }
  }, [currentStepData]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    setCurrentStep(0);
    setIsPlaying(false);
    if (storageKey) {
      localStorage.setItem(storageKey, "1");
    }
    onComplete?.();
  };

  const skipTour = () => {
    setIsVisible(false);
    setCurrentStep(0);
    setIsPlaying(false);
    if (storageKey) {
      localStorage.setItem(storageKey, "1");
    }
    onSkip?.();
  };

  const startTour = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setIsVisible(true);
  };

  const resetTour = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setCurrentStep(0);
    setIsPlaying(false);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isActive && autoStart) {
      startTour();
    }
  }, [isActive, autoStart]);

  useEffect(() => {
    if (isVisible && currentStepData) {
      updateTargetElement();
    }
  }, [currentStep, isVisible, currentStepData, updateTargetElement]);

  useEffect(() => {
    const handleResize = () => {
      if (targetElement && isVisible) {
        updateTargetElement();
      }
    };

    const handleScroll = () => {
      if (targetElement && isVisible) {
        updateTargetElement();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [targetElement, isVisible, updateTargetElement]);

  if (!isVisible || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[999]" />

      {/* Highlighted element overlay */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute border-2 border-blue-500 rounded-lg pointer-events-none"
          style={overlayStyle}
        >
          {currentStepData.pulse && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 border-2 border-blue-400 rounded-lg"
            />
          )}
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="fixed z-[1001]"
        style={tooltipStyle}
      >
        <Card className={`shadow-2xl border-2 max-w-sm ${getThemeClasses()}`}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">
                  Bước {currentStep + 1} / {steps.length}
                </span>
              </div>
              {showSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm opacity-90">
                {currentStepData.description}
              </p>

              {currentStepData.action && (
                <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                  <MousePointer className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentStepData.actionText ||
                      `Hãy ${currentStepData.action} vào phần được highlight`}
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Tiến độ</span>
                  <span>
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={nextStep}
                    size="sm"
                    className={getThemeButtonClasses()}
                  >
                    {currentStepData.nextButtonText || "Tiếp theo"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={completeTour}
                    size="sm"
                    className={getThemeButtonClasses()}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Hoàn thành
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default TourGuide;
