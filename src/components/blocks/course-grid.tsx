
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Clock, Users, Star, BookOpen, Filter } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { Course } from "../../types/course";
import { formatPrice } from "../../lib/shared/formatters";
import { safeParseJson } from "../../lib/safe-json";
import { getLevelBadgeColor } from "../../lib/shared/helpers";

interface CourseGridProps {
  className?: string;
}

export default function CourseGrid({ className }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("newest");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const text = await response.text();
        const data = safeParseJson<Course[]>(text, []);
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const domains = [...new Set(courses.map(course => course.domain))];
  
  const filteredAndSortedCourses = courses
    .filter(course => selectedDomain === "all" || course.domain === selectedDomain)
    .sort((a, b) => {
      switch (activeTab) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          return (b.ratingCount || 0) - (a.ratingCount || 0);
        case "rating":
          return (b.ratingAvg || 0) - (a.ratingAvg || 0);
        default:
          return 0;
      }
    });

  const StarRating = ({ rating, count }: { rating?: number; count?: number }) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${
                i < Math.floor(rating) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({count || 0})
        </span>
      </div>
    );
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-blue-500 opacity-50" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {course.isHot && (
              <Badge variant="destructive">
                HOT
              </Badge>
            )}
          </div>

          {/* Price */}
          {course.price && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-900">
                {formatPrice(course.price)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Level and Domain */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={getLevelBadgeColor(course.level)}>
            {course.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course.domain}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {course.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{course.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={course.ratingAvg} count={course.ratingCount} />
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>8-12 tuần</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.ratingCount || 0} học viên</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
            <Link to={`/khoa-hoc/${course.slug}`}>
              Đăng ký ngay
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/khoa-hoc/${course.slug}`}>
              Chi tiết
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <section className={`py-16 bg-background ${className}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Khóa Học Nổi Bật
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nâng cao kỹ năng chuyên môn với các khóa học chất lượng cao từ các chuyên gia hàng đầu
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="newest">Mới nhất</TabsTrigger>
                <TabsTrigger value="popular">Phổ biến</TabsTrigger>
                <TabsTrigger value="rating">Đánh giá cao</TabsTrigger>
              </TabsList>

              {/* Domain Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-8">
              {/* Course Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAndSortedCourses.slice(0, 6).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}

              {/* Show More Button */}
              {!loading && filteredAndSortedCourses.length > 6 && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-3"
                    asChild
                  >
                    <Link to="/khoa-hoc">
                      Xem tất cả khóa học ({filteredAndSortedCourses.length})
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
