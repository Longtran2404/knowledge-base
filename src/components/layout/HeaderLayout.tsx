import React from "react";
import { useLocation } from "react-router-dom";
// import LiquidGlassNavigation from "../navigation/LiquidGlassNavigation"; // Removed - using ModernSidebarV2 globally

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const location = useLocation();

  // Routes that should not have header (auth routes have their own header)
  const routesWithoutHeader = [
    "/dang-nhap",
    "/xac-minh-email",
    "/quen-mat-khau",
    "/dat-lai-mat-khau",
    "/gui-lai-xac-minh",
    "/gioi-thieu",
  ];

  const shouldShowHeader = !routesWithoutHeader.includes(location.pathname);

  return (
    <>
      {/* LiquidGlassNavigation removed - ModernSidebarV2 is now rendered globally in App.tsx */}
      {children}
    </>
  );
}
