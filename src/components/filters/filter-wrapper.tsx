
import React from 'react';
import { EnhancedFilter } from './enhanced-filter';

interface FilterWrapperProps {
  categories: {
    id: string;
    label: string;
    options: {
      id: string;
      label: string;
      value: string;
      count?: number;
    }[];
    multiSelect?: boolean;
  }[];
  searchPlaceholder?: string;
  className?: string;
}

export function FilterWrapper({ categories, searchPlaceholder, className }: FilterWrapperProps) {
  const handleFilterChange = (filters: Record<string, string[]>) => {
    console.log('Applied filters:', filters);
    // TODO: Implement actual filtering logic
  };

  return (
    <EnhancedFilter
      categories={categories}
      onFilterChange={handleFilterChange}
      searchPlaceholder={searchPlaceholder}
      className={className}
    />
  );
}
