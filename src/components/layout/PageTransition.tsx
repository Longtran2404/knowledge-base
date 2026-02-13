import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/** Chuyển trang đơn giản, không animation để giảm lag */
export default function PageTransition({ children }: PageTransitionProps) {
  return <div className="w-full">{children}</div>;
}
