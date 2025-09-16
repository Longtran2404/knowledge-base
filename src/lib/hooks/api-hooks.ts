// API hooks for data fetching
import { useState, useEffect } from "react";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "course" | "product" | "resource" | "blog";
  url: string;
  image?: string;
}

export const useSearch = (searchQuery?: string) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Khóa học React cơ bản",
          description: "Học React từ cơ bản đến nâng cao",
          type: "course" as const,
          url: "/courses/react-basic",
          image: "/images/course-1.jpg",
        },
        {
          id: "2",
          title: "Template Website Bán Hàng",
          description: "Template chuyên nghiệp cho website bán hàng",
          type: "product" as const,
          url: "/products/website-template",
          image: "/images/product-1.jpg",
        },
        {
          id: "3",
          title: "Ebook JavaScript",
          description: "Tài liệu học JavaScript miễn phí",
          type: "resource" as const,
          url: "/resources/javascript-ebook",
          image: "/images/resource-1.jpg",
        },
      ].filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
    } catch (err) {
      setError("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setQuery("");
  };

  // Auto-search when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      search(searchQuery);
    }
  }, [searchQuery]);

  return {
    query,
    searchResults: results,
    loading: isLoading,
    error,
    search,
    clearResults,
    setQuery,
  };
};

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock courses data
      const mockCourses = [
        {
          id: "1",
          title: "Lập trình React từ A-Z",
          description: "Khóa học toàn diện về React...",
          instructor: "Nguyễn Văn A",
          price: 299000,
          level: "beginner",
          rating: 4.8,
          students: 1250,
          image: "/images/course-1.jpg",
        },
      ];

      setCourses(mockCourses);
    } catch (err) {
      setError("Có lỗi xảy ra khi tải khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
  };
};
