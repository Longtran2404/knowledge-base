import React from "react";
import { useLocation } from "react-router-dom";
import MainHeader from "../header/main-header";

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const location = useLocation();

  // Routes that should not have header (auth routes have their own header)
  const routesWithoutHeader = [
    "/auth",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/resend-verification",
    "/gioi-thieu",
  ];

  const shouldShowHeader = !routesWithoutHeader.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <MainHeader />}
      <div className={shouldShowHeader ? "pt-16 lg:pt-18" : ""}>{children}</div>
    </>
  );
}
