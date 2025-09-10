// Tour guide hook and step definitions
import { useState, useEffect } from 'react';

export interface TourStep {
  target: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  title?: string;
}

export const useTourGuide = () => {
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
  };

  return {
    isActive,
    currentStep,
    steps,
    startTour,
    nextStep,
    prevStep,
    endTour
  };
};

// Tour step definitions for different pages
export const getHomePageTourSteps = (): TourStep[] => [
  {
    target: '.hero-section',
    title: 'Chào mừng đến với Nam Long Center',
    content: 'Đây là trang chủ của chúng tôi. Bạn có thể khám phá các khóa học và dịch vụ tại đây.',
    placement: 'bottom'
  },
  {
    target: '.course-section',
    title: 'Khóa học nổi bật',
    content: 'Xem các khóa học được nhiều học viên yêu thích nhất.',
    placement: 'top'
  },
  {
    target: '.search-bar',
    title: 'Tìm kiếm',
    content: 'Sử dụng thanh tìm kiếm để tìm khóa học hoặc tài liệu bạn quan tâm.',
    placement: 'bottom'
  }
];

export const getCoursePageTourSteps = (): TourStep[] => [
  {
    target: '.course-filters',
    title: 'Bộ lọc khóa học',
    content: 'Sử dụng các bộ lọc để tìm khóa học phù hợp với trình độ và sở thích của bạn.',
    placement: 'bottom'
  },
  {
    target: '.course-grid',
    title: 'Danh sách khóa học',
    content: 'Xem tất cả các khóa học có sẵn. Click vào khóa học để xem chi tiết.',
    placement: 'top'
  }
];

export const getResourcePageTourSteps = (): TourStep[] => [
  {
    target: '.resource-categories',
    title: 'Danh mục tài nguyên',
    content: 'Chọn danh mục tài nguyên bạn muốn khám phá.',
    placement: 'bottom'
  },
  {
    target: '.resource-grid',
    title: 'Thư viện tài nguyên',
    content: 'Tìm và tải xuống các tài liệu, template và công cụ hữu ích.',
    placement: 'top'
  }
];

export const getPricingPageTourSteps = (): TourStep[] => [
  {
    target: '.pricing-cards',
    title: 'Gói dịch vụ',
    content: 'Chọn gói dịch vụ phù hợp với nhu cầu học tập của bạn.',
    placement: 'top'
  },
  {
    target: '.feature-comparison',
    title: 'So sánh tính năng',
    content: 'Xem bảng so sánh chi tiết các tính năng của từng gói.',
    placement: 'bottom'
  }
];
