/**
 * Shared page layout: max-width container, consistent padding and section spacing.
 * Use to wrap main content for a consistent, user-friendly layout across pages.
 */

import React from 'react';
import { cn } from 'lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Optional page title (standard heading style) */
  title?: string;
  /** Optional description below title */
  description?: string;
}

export function PageLayout({
  children,
  className,
  title,
  description,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8',
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
