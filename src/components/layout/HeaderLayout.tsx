import React from "react";

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  return <>{children}</>;
}
