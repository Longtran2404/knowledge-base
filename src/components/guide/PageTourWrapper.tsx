import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TourGuide from "./TourGuide";
import { useTourGuide } from "../../lib/hooks/useTourGuide";
import {
  getHomePageTourSteps,
  getCoursePageTourSteps,
  getProductPageTourSteps,
  getResourcePageTourSteps,
  getPricingPageTourSteps,
} from "../../lib/hooks/useTourGuide";

interface PageTourWrapperProps {
  children: React.ReactNode;
  autoStart?: boolean;
  delay?: number;
}

const PageTourWrapper: React.FC<PageTourWrapperProps> = ({
  children,
  autoStart = false,
  delay = 2000,
}) => {
  const location = useLocation();
  const { isActive, startTour, completeTour, skipTour } = useTourGuide({
    autoStart,
    delay,
    onComplete: () => {
      console.log("Tour completed!");
    },
    onSkip: () => {
      console.log("Tour skipped!");
    },
  });

  const getTourSteps = () => {
    switch (location.pathname) {
      case "/":
      case "/trang-chu":
        return getHomePageTourSteps();
      case "/khoa-hoc":
        return getCoursePageTourSteps();
      case "/san-pham":
        return getProductPageTourSteps();
      case "/tai-nguyen":
        return getResourcePageTourSteps();
      case "/goi-dich-vu":
        return getPricingPageTourSteps();
      default:
        return [];
    }
  };

  const tourSteps = getTourSteps();

  // Auto start tour for specific pages
  useEffect(() => {
    if (autoStart && tourSteps.length > 0) {
      const timer = setTimeout(() => {
        startTour();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, startTour, tourSteps.length]);

  return (
    <>
      {children}
      {isActive && tourSteps.length > 0 && (
        <TourGuide
          steps={tourSteps}
          isActive={isActive}
          onComplete={completeTour}
          onSkip={skipTour}
          storageKey={`nlc_tour_${location.pathname.replace(/\//g, "_")}`}
          showProgress={true}
          showSkip={true}
          theme="blue"
        />
      )}
    </>
  );
};

export default PageTourWrapper;
