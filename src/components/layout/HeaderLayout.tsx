import React from "react";
import { useLocation } from "react-router-dom";
import MainHeader from "../header/main-header";
import EnhancedFloatingGuide from "../guide/EnhancedFloatingGuide";

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const location = useLocation();

  // Routes that should not have header
  const routesWithoutHeader = ["/"];

  const shouldShowHeader = !routesWithoutHeader.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <MainHeader />}
      {children}
      <EnhancedFloatingGuide />
    </>
  );
}
