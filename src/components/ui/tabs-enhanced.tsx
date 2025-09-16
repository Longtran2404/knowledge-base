import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline" | "cards";
  size?: "sm" | "md" | "lg";
  className?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  disabledTabClassName?: string;
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  scrollable?: boolean;
  tabListRef?: React.RefObject<HTMLDivElement>;
}

export function Tabs({
  items,
  defaultActiveTab,
  onTabChange,
  variant = "default",
  size = "md",
  className,
  tabListClassName,
  tabContentClassName,
  tabClassName,
  activeTabClassName,
  disabledTabClassName,
  orientation = "horizontal",
  fullWidth = false,
  scrollable = false,
  tabListRef,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || items.find((item) => !item.disabled)?.id || items[0]?.id
  );
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
    top: 0,
    height: 0,
  });
  const localTabListRef = useRef<HTMLDivElement>(null);
  const tabListRefToUse = tabListRef || localTabListRef;
  const tabRefs = useRef<Record<string, HTMLButtonElement>>({});

  const activeItem = items.find((item) => item.id === activeTab);

  useEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, variant, orientation]);

  const updateIndicator = () => {
    const activeTabElement = tabRefs.current[activeTab];
    const tabListElement = tabListRefToUse.current;

    if (!activeTabElement || !tabListElement) return;

    const tabListRect = tabListElement.getBoundingClientRect();
    const activeTabRect = activeTabElement.getBoundingClientRect();

    if (orientation === "horizontal") {
      setIndicatorStyle({
        width: activeTabRect.width,
        left: activeTabRect.left - tabListRect.left,
        top: 0,
        height: 0,
      });
    } else {
      setIndicatorStyle({
        width: 0,
        left: 0,
        top: activeTabRect.top - tabListRect.top,
        height: activeTabRect.height,
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    const tab = items.find((item) => item.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm px-3 py-2";
      case "lg":
        return "text-lg px-6 py-4";
      default:
        return "text-base px-4 py-3";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "pills":
        return "rounded-full";
      case "underline":
        return "border-b-2 border-transparent rounded-none";
      case "cards":
        return "border border-gray-200 rounded-lg shadow-soft";
      default:
        return "rounded-lg";
    }
  };

  const getActiveClasses = () => {
    switch (variant) {
      case "pills":
        return "bg-blue-600 text-white shadow-medium";
      case "underline":
        return "border-blue-600 text-blue-600 bg-transparent";
      case "cards":
        return "bg-blue-50 border-blue-200 text-blue-700 shadow-medium";
      default:
        return "bg-blue-600 text-white shadow-medium";
    }
  };

  const getDisabledClasses = () => {
    return "opacity-50 cursor-not-allowed text-gray-400";
  };

  const getTabListClasses = () => {
    const baseClasses = "flex";
    const orientationClasses =
      orientation === "vertical" ? "flex-col" : "flex-row";
    const scrollableClasses = scrollable
      ? "overflow-x-auto scrollbar-thin"
      : "";
    const fullWidthClasses = fullWidth ? "w-full" : "";

    return cn(
      baseClasses,
      orientationClasses,
      scrollableClasses,
      fullWidthClasses,
      tabListClassName
    );
  };

  const getTabClasses = (tab: TabItem) => {
    const baseClasses =
      "flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer";
    const sizeClasses = getSizeClasses();
    const variantClasses = getVariantClasses();
    const stateClasses = tab.disabled
      ? getDisabledClasses()
      : tab.id === activeTab
      ? getActiveClasses()
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
    const fullWidthClasses = fullWidth ? "flex-1 justify-center" : "";

    return cn(
      baseClasses,
      sizeClasses,
      variantClasses,
      stateClasses,
      fullWidthClasses,
      tabClassName,
      tab.id === activeTab && activeTabClassName,
      tab.disabled && disabledTabClassName
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div
        ref={tabListRefToUse}
        className={cn(
          "relative",
          orientation === "horizontal" ? "mb-4" : "mb-0 mr-4"
        )}
      >
        <div className={getTabListClasses()}>
          {items.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[tab.id] = el;
              }}
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={getTabClasses(tab)}
              aria-selected={tab.id === activeTab}
              role="tab"
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span className="flex-shrink-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Indicator */}
        {variant === "underline" && (
          <div
            className="absolute bottom-0 bg-blue-600 transition-all duration-200 ease-out"
            style={{
              width: indicatorStyle.width,
              left: indicatorStyle.left,
              height: "2px",
            }}
          />
        )}
      </div>

      {/* Tab Content */}
      {activeItem && (
        <div
          className={cn("transition-all duration-200", tabContentClassName)}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}

// Animated Tabs with smooth transitions
interface AnimatedTabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  animationDuration?: number;
}

export function AnimatedTabs({
  items,
  defaultActiveTab,
  onTabChange,
  className,
  animationDuration = 300,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || items.find((item) => !item.disabled)?.id || items[0]?.id
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabClick = (tabId: string) => {
    const tab = items.find((item) => item.id === tabId);
    if (tab?.disabled || tabId === activeTab) return;

    setIsAnimating(true);
    setActiveTab(tabId);
    onTabChange?.(tabId);

    setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
  };

  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div className="flex border-b border-gray-200 mb-4">
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 cursor-pointer relative",
              tab.disabled
                ? "opacity-50 cursor-not-allowed text-gray-400"
                : tab.id === activeTab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge && (
              <span className="flex-shrink-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content with Animation */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isAnimating
              ? "opacity-0 transform translate-y-2"
              : "opacity-100 transform translate-y-0"
          )}
        >
          {activeItem && <div role="tabpanel">{activeItem.content}</div>}
        </div>
      </div>
    </div>
  );
}

// Vertical Tabs
interface VerticalTabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  tabListWidth?: string;
}

export function VerticalTabs({
  items,
  defaultActiveTab,
  onTabChange,
  className,
  tabListWidth = "w-64",
}: VerticalTabsProps) {
  return (
    <Tabs
      items={items}
      defaultActiveTab={defaultActiveTab}
      onTabChange={onTabChange}
      className={cn("flex", className)}
      tabListClassName={cn(tabListWidth, "flex-shrink-0")}
    />
  );
}

// Scrollable Tabs
interface ScrollableTabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  showScrollButtons?: boolean;
  tabListRef?: React.RefObject<HTMLDivElement>;
}

export function ScrollableTabs({
  items,
  defaultActiveTab,
  onTabChange,
  className,
  showScrollButtons = true,
  tabListRef,
}: ScrollableTabsProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const localScrollTabListRef = useRef<HTMLDivElement>(null);
  const scrollTabListRefToUse = tabListRef || localScrollTabListRef;

  const checkScrollButtons = () => {
    if (!scrollTabListRefToUse.current) return;

    const { scrollLeft, scrollWidth, clientWidth } =
      scrollTabListRefToUse.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  useEffect(() => {
    checkScrollButtons();
    const tabList = scrollTabListRefToUse.current;
    if (tabList) {
      tabList.addEventListener("scroll", checkScrollButtons);
      return () => tabList.removeEventListener("scroll", checkScrollButtons);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollLeft = () => {
    if (scrollTabListRefToUse.current) {
      scrollTabListRefToUse.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollTabListRefToUse.current) {
      scrollTabListRefToUse.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative", className)}>
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-medium rounded-full p-2 hover:bg-gray-50"
        >
          ←
        </button>
      )}

      <Tabs
        items={items}
        defaultActiveTab={defaultActiveTab}
        onTabChange={onTabChange}
        scrollable={true}
        tabListRef={tabListRef}
      />

      {showScrollButtons && canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-medium rounded-full p-2 hover:bg-gray-50"
        >
          →
        </button>
      )}
    </div>
  );
}
