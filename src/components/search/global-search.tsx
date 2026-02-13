
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, X, BookOpen, ShoppingBag, FileText, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useSearch } from "../../lib/hooks/api-hooks";
import { useAppStore } from "../../lib/stores/app-store";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

interface SearchResult {
  id: string;
  type: 'course' | 'product' | 'post' | 'resource';
  title: string;
  description: string;
  price?: number;
  rating?: number;
  category?: string;
  level?: string;
  image?: string;
}

interface SearchResultsResponse {
  results?: SearchResult[];
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'minimal';
}

export function GlobalSearch({ 
  placeholder = "Tìm kiếm khóa học, sản phẩm...", 
  className = "",
  showIcon = true,
  variant = 'default'
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery } = useAppStore();

  // Debounced search with useSearch hook
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { searchResults, loading: isLoading, error } = useSearch(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kb-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  const saveRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kb-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentSearch(query);
    setIsOpen(false);
    setQuery("");
    
    // Navigate to result
    const baseUrls = {
      course: '/khoa-hoc',
      product: '/san-pham',
      post: '/blog',
      resource: '/tai-nguyen'
    };
    
    window.location.href = `${baseUrls[result.type]}/${result.id}`;
  }, [query, saveRecentSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const res = searchResults as SearchResultsResponse | undefined;
        setSelectedIndex(prev =>
          prev < (res?.results?.length ?? 0) - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const res = searchResults as SearchResultsResponse | undefined;
        const item = res?.results?.[selectedIndex];
        if (item) handleResultClick(item);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, handleResultClick]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'product':
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case 'post':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Khóa học';
      case 'product':
        return 'Sản phẩm';
      case 'post':
        return 'Bài viết';
      case 'resource':
        return 'Tài nguyên';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'post':
        return 'bg-orange-100 text-orange-800';
      case 'resource':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    setSearchQuery(searchTerm);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('kb-recent-searches');
    toast.success('Đã xóa lịch sử tìm kiếm');
  };

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {isOpen && (query || recentSearches.length > 0) && (
          <Card className="absolute top-full mt-2 w-full z-50 shadow-xl border-2">
            <CardContent className="p-2 max-h-96 overflow-y-auto">
              {/* Search Results or Loading */}
              {query ? (
                <>
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Đang tìm kiếm...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-500">Có lỗi xảy ra khi tìm kiếm</p>
                    </div>
                  )}
                  
                  {(searchResults as SearchResultsResponse)?.results?.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Không tìm thấy kết quả nào</p>
                    </div>
                  )}
                  
                  {(searchResults as SearchResultsResponse)?.results?.map((result, index) => (
                    <div
                      key={result.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      {getTypeIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                          <Badge variant="outline" className={`${getTypeColor(result.type)} text-xs`}>
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                        {result.price && (
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            {formatPrice(result.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                /* Recent Searches */
                recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <h3 className="text-sm font-medium text-gray-700">Tìm kiếm gần đây</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Xóa tất cả
                      </Button>
                    </div>
                    {recentSearches.map((searchTerm, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-50 group"
                        onClick={() => handleRecentSearchClick(searchTerm)}
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1">{searchTerm}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <div className="relative">
            {showIcon && (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className={showIcon ? "pl-10 pr-10" : "pr-10"}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList className="max-h-96">
            {query ? (
              <>
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Đang tìm kiếm...</span>
                  </div>
                )}
                
                <CommandEmpty>
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Không tìm thấy kết quả nào</p>
                  </div>
                </CommandEmpty>
                
                {(searchResults as SearchResultsResponse)?.results?.length > 0 && (
                  <CommandGroup heading="Kết quả tìm kiếm">
                    {((searchResults as SearchResultsResponse)?.results ?? []).map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleResultClick(result)}
                        className="flex items-start gap-3 p-3"
                      >
                        {getTypeIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                            <Badge variant="outline" className={`${getTypeColor(result.type)} text-xs`}>
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                          {result.price && (
                            <p className="text-xs font-semibold text-blue-600 mt-1">
                              {formatPrice(result.price)}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            ) : (
              recentSearches.length > 0 && (
                <CommandGroup heading="Tìm kiếm gần đây">
                  {recentSearches.map((searchTerm, index) => (
                    <CommandItem
                      key={index}
                      value={searchTerm}
                      onSelect={() => handleRecentSearchClick(searchTerm)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="flex-1">{searchTerm}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
