import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface EnhancedFilterProps {
  categories: FilterCategory[];
  onFilterChange: (filters: Record<string, string[]>) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function EnhancedFilter({
  categories,
  onFilterChange,
  searchPlaceholder = "Tìm kiếm...",
  className = "",
}: EnhancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFilterChange = (
    categoryId: string,
    optionValue: string,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      const current = prev[categoryId] || [];
      let newValues: string[];

      if (checked) {
        newValues = [...current, optionValue];
      } else {
        newValues = current.filter((value) => value !== optionValue);
      }

      return {
        ...prev,
        [categoryId]: newValues,
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchQuery("");
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, values) => total + values.length,
      0
    );
  };

  const filteredCategories = categories.map((category) => ({
    ...category,
    options: category.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={false}
        animate={{ gap: isExpanded ? 3 : 3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleExpanded}
            variant="outline"
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </motion.div>

        {getActiveFilterCount() > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={filterRef}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-900">
                    Bộ lọc nâng cao
                  </CardTitle>
                  <Button
                    onClick={toggleExpanded}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {category.label}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                          className="p-1 h-6 w-6"
                        >
                          <motion.div
                            animate={{
                              rotate: expandedCategories.includes(category.id)
                                ? 180
                                : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </Button>
                      </div>

                      <AnimatePresence>
                        {expandedCategories.includes(category.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {category.options.map((option) => {
                              const isSelected =
                                selectedFilters[category.id]?.includes(
                                  option.value
                                ) || false;

                              return (
                                <motion.label
                                  key={option.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="relative">
                                    <input
                                      type={
                                        category.multiSelect
                                          ? "checkbox"
                                          : "radio"
                                      }
                                      name={category.id}
                                      value={option.value}
                                      checked={isSelected}
                                      onChange={(e) =>
                                        handleFilterChange(
                                          category.id,
                                          option.value,
                                          e.target.checked
                                        )
                                      }
                                      className="sr-only"
                                      aria-label={`Chọn ${option.label}`}
                                      title={option.label}
                                    />
                                    <motion.div
                                      className={`
                                        w-5 h-5 rounded border-2 flex items-center justify-center
                                        ${
                                          isSelected
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300"
                                        }
                                      `}
                                      animate={{
                                        scale: isSelected ? [1, 1.2, 1] : 1,
                                      }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {isSelected && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <Check className="h-3 w-3 text-white" />
                                        </motion.div>
                                      )}
                                    </motion.div>
                                  </div>

                                  <div className="flex-1">
                                    <span className="text-sm text-gray-700">
                                      {option.label}
                                    </span>
                                    {option.count && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 text-xs"
                                      >
                                        {option.count}
                                      </Badge>
                                    )}
                                  </div>
                                </motion.label>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-4 border-t border-gray-200"
                  >
                    <h4 className="font-medium text-gray-700 mb-3">
                      Bộ lọc đang hoạt động:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedFilters).map(
                        ([categoryId, values]) => {
                          const category = categories.find(
                            (c) => c.id === categoryId
                          );
                          return values.map((value) => {
                            const option = category?.options.find(
                              (o) => o.value === value
                            );
                            return (
                              <motion.div
                                key={`${categoryId}-${value}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{option?.label}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleFilterChange(categoryId, value, false)
                                  }
                                  className="p-0 h-4 w-4 hover:bg-blue-200 rounded-full"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            );
                          });
                        }
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
