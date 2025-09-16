// Tour guide hook and step definitions
import { useState, useEffect } from "react";

export interface TourStep {
  id: string;
  target: string;
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

interface UseTourGuideOptions {
  autoStart?: boolean;
  delay?: number;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const useTourGuide = (options?: UseTourGuideOptions) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = (tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    options?.onComplete?.();
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    options?.onSkip?.();
  };

  return {
    isActive,
    currentStep,
    steps,
    startTour,
    nextStep,
    prevStep,
    endTour,
    completeTour: endTour,
    skipTour,
  };
};

// Tour step definitions for different pages
export const getHomePageTourSteps = (): TourStep[] => [
  {
    id: "home-hero",
    target: ".hero-section",
    title: "Chào mừng đến với Nam Long Center",
    description:
      "Đây là trang chủ của chúng tôi. Bạn có thể khám phá các khóa học và dịch vụ tại đây.",
    position: "bottom",
  },
  {
    id: "home-courses",
    target: ".course-section",
    title: "Khóa học nổi bật",
    description: "Xem các khóa học được nhiều học viên yêu thích nhất.",
    position: "top",
  },
  {
    id: "home-search",
    target: ".search-bar",
    title: "Tìm kiếm",
    description:
      "Sử dụng thanh tìm kiếm để tìm khóa học hoặc tài liệu bạn quan tâm.",
    position: "bottom",
  },
];

export const getCoursePageTourSteps = (): TourStep[] => [
  {
    id: "course-filters",
    target: ".course-filters",
    title: "Bộ lọc khóa học",
    description:
      "Sử dụng các bộ lọc để tìm khóa học phù hợp với trình độ và sở thích của bạn.",
    position: "bottom",
  },
  {
    id: "course-grid",
    target: ".course-grid",
    title: "Danh sách khóa học",
    description:
      "Xem tất cả các khóa học có sẵn. Click vào khóa học để xem chi tiết.",
    position: "top",
  },
];

export const getResourcePageTourSteps = (): TourStep[] => [
  {
    id: "resource-categories",
    target: ".resource-categories",
    title: "Danh mục tài nguyên",
    description: "Chọn danh mục tài nguyên bạn muốn khám phá.",
    position: "bottom",
  },
  {
    id: "resource-grid",
    target: ".resource-grid",
    title: "Thư viện tài nguyên",
    description: "Tìm và tải xuống các tài liệu, template và công cụ hữu ích.",
    position: "top",
  },
];

export const getPricingPageTourSteps = (): TourStep[] => [
  {
    id: "pricing-cards",
    target: ".pricing-cards",
    title: "Gói dịch vụ",
    description: "Chọn gói dịch vụ phù hợp với nhu cầu học tập của bạn.",
    position: "top",
  },
  {
    id: "feature-comparison",
    target: ".feature-comparison",
    title: "So sánh tính năng",
    description: "Xem bảng so sánh chi tiết các tính năng của từng gói.",
    position: "bottom",
  },
];

export const getProductPageTourSteps = (): TourStep[] => [
  {
    id: "product-filters",
    target: ".product-filters",
    title: "Bộ lọc sản phẩm",
    description:
      "Sử dụng các bộ lọc để tìm sản phẩm phù hợp với nhu cầu của bạn.",
    position: "bottom",
  },
  {
    id: "product-grid",
    target: ".product-grid",
    title: "Danh sách sản phẩm",
    description:
      "Xem tất cả các sản phẩm có sẵn. Click vào sản phẩm để xem chi tiết.",
    position: "top",
  },
  {
    id: "cart-button",
    target: ".cart-button",
    title: "Giỏ hàng",
    description: "Thêm sản phẩm vào giỏ hàng để mua sau.",
    position: "left",
  },
];
