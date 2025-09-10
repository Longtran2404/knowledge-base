
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "default" | "minimal" | "expanded";
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showIcon?: boolean;
}

export function SearchBar({ 
  variant = "default", 
  placeholder = "Tìm kiếm khóa học, sản phẩm...",
  className,
  onSearch,
  showIcon = false
}: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsExpanded(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Minimal variant (for header)
  if (variant === "minimal") {
    return (
      <div className={cn("relative", className)}>
        {showIcon ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setIsExpanded(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </Button>
        )}
      </div>
    );
  }

  // Expanded search overlay
  if (isExpanded) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsExpanded(false)}
        />
        
        {/* Search Modal */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4">
          <div className="bg-background border rounded-lg shadow-2xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center p-4">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 border-0 shadow-none text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 ml-2"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search suggestions */}
              {isFocused && (
                <div className="border-t p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Gợi ý tìm kiếm</span>
                    <Badge variant="secondary" className="text-xs">
                      ⌘K
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["BIM Automation", "AutoCAD", "Kỹ sư xây dựng", "Phần mềm thiết kế"].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="text-left p-2 rounded-md hover:bg-accent text-sm transition-colors"
                        onClick={() => {
                          setQuery(suggestion);
                          if (onSearch) onSearch(suggestion);
                          setIsExpanded(false);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-10 pr-4 h-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
        Nhấn <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> để tìm kiếm nhanh
      </div>
    </form>
  );
}
