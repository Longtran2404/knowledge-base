/**
 * Shared page layout: max-width container, consistent padding, user-friendly spacing.
 * Dùng để bọc nội dung trang với giao diện đồng bộ, dễ đọc.
 */

import React from 'react';
import { cn } from 'lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Tiêu đề trang */
  title?: string;
  /** Mô tả ngắn dưới tiêu đề */
  description?: string;
  /** Badge nhỏ trên tiêu đề (vd: "Hỗ trợ", "Liên hệ") */
  badge?: string;
  /** Có hero gradient nhẹ không */
  hero?: boolean;
}

export function PageLayout({
  children,
  className,
  title,
  description,
  badge,
  hero = false,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[60vh]',
        hero && 'bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        {(title || description) && (
          <header className="space-y-3 text-center md:text-left">
            {badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {badge}
              </span>
            )}
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
