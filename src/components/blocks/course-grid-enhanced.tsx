
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, TrendingUp, Calendar, BookOpen, Heart, Play, Award, Zap, Target, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../components/ui/hover-card";

interface Course {
  id: string;
  title: string;
  description: string;
  field: string;
  level: string;
  duration: string;
  price: number;
  rating: number;
  studentsCount: number;
  isNew?: boolean;
  isHot?: boolean;
  instructor?: string;
  completionRate?: number;
  certificate?: boolean;
}

interface CourseGridEnhancedProps {
  showFilters?: boolean;
}

export default function CourseGridEnhanced({ showFilters = true }: CourseGridEnhancedProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(6);

  const filters = [
    { id: 'all', label: 'Tất cả', icon: BookOpen, color: 'blue' },
    { id: 'new', label: 'Mới nhất', icon: Calendar, color: 'green' },
    { id: 'popular', label: 'Phổ biến', icon: TrendingUp, color: 'red' },
    { id: 'field', label: 'Theo lĩnh vực', icon: Star, color: 'purple' }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const text = await response.text();
        const data = (text && text.trim() ? (() => { try { return JSON.parse(text); } catch { return []; } })() : []);
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const fields = [...new Set(courses.map(course => course.field))];

  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'new') return course.isNew;
    if (activeFilter === 'popular') return course.isHot;
    if (activeFilter === 'field' && selectedField !== 'all') return course.field === selectedField;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Cơ bản':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Trung cấp':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nâng cao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFilterColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700',
      green: 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700',
      red: 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700',
      purple: 'bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const toggleFavorite = (courseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId);
      toast.success('Đã xóa khỏi yêu thích');
    } else {
      newFavorites.add(courseId);
      toast.success('Đã thêm vào yêu thích');
    }
    setFavorites(newFavorites);
  };

  const enrollCourse = (courseId: string, courseTitle: string) => {
    toast.success(`Đã đăng ký khóa học: ${courseTitle}`);
  };

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const sizeClass = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`${sizeClass} ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1 font-medium">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
          <BookOpen className="w-4 h-4" />
          Khóa học chất lượng cao
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Khóa Học Nổi Bật
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Nâng cao kỹ năng chuyên môn với các khóa học được thiết kế bởi các chuyên gia hàng đầu
        </p>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = activeFilter === filter.id;
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id as string)}
                  className={`flex items-center gap-2 transition-all hover:scale-105 ${
                    isActive 
                      ? `${getFilterColor(filter.color)} text-white shadow-lg` 
                      : 'hover:bg-gray-50 border-2'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
                  {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                </Button>
              );
            })}
          </div>

          {/* Field Filter */}
          {activeFilter === 'field' && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Button
                variant={selectedField === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedField('all')}
                className={selectedField === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}
              >
                Tất cả lĩnh vực
              </Button>
              {fields.map((field) => (
                <Button
                  key={field}
                  variant={selectedField === field ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedField(field)}
                  className={selectedField === field ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}
                >
                  {field}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {filteredCourses.slice(0, visibleCount).map((course) => (
          <Card key={course.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border-2 hover:border-blue-200">
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 overflow-hidden">
              {/* Enhanced Background */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Floating Course Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                  📚
                </div>
              </div>
              
              {/* Enhanced Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {course.isNew && (
                  <Badge className="bg-green-500/90 hover:bg-green-600 text-white shadow-lg animate-pulse">
                    <Calendar className="w-3 h-3 mr-1" />
                    MỚI
                  </Badge>
                )}
                {course.isHot && (
                  <Badge className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    HOT
                  </Badge>
                )}
              </div>

              {/* Favorite Button */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(course.id);
                  }}
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      favorites.has(course.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-500'
                    }`} 
                  />
                </Button>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-4 right-4">
                <Badge variant="secondary" className="bg-white/95 text-gray-900 font-bold shadow-lg">
                  {formatPrice(course.price)}
                </Badge>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
                  <Play className="w-6 h-6 text-blue-600 ml-1" />
                </div>
              </div>
            </div>

            {/* Enhanced Course Content */}
            <CardContent className="p-6 space-y-4">
              {/* Level Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${getLevelColor(course.level)} border`}>
                  <Target className="w-3 h-3 mr-1" />
                  {course.level}
                </Badge>
                {course.certificate && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Award className="w-3 h-3 mr-1" />
                    Chứng chỉ
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </h3>

              {/* Field */}
              <p className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block">
                {course.field}
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {course.description}
              </p>

              {/* Rating */}
              <StarRating rating={course.rating} size="md" />

              {/* Progress Bar (Completion Rate) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Hoàn thành trung bình</span>
                  <span className="font-semibold text-gray-700">{course.completionRate || 85}%</span>
                </div>
                <Progress value={course.completionRate || 85} className="h-2" />
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto">
                    <p className="text-sm">Thời lượng khóa học: {course.duration}</p>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                      <Users className="w-4 h-4" />
                      <span>{course.studentsCount || 120}+ học viên</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto">
                    <p className="text-sm">Đã có {course.studentsCount || 120}+ học viên đăng ký</p>
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all group"
                  onClick={() => enrollCourse(course.id, course.title)}
                >
                  <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Đăng ký ngay
                </Button>
                <Button variant="outline" className="px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" asChild>
                  <Link to={`/khoa-hoc/${course.id}`}>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Show More Button */}
      {filteredCourses.length > visibleCount && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-8 py-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 border-2 transition-all hover:scale-105 group"
          >
            Xem thêm khóa học ({filteredCourses.length - visibleCount} khóa)
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}

      {/* Course Stats */}
      <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Khóa học", value: filteredCourses.length, icon: BookOpen, color: "blue" },
          { label: "Học viên", value: "50K+", icon: Users, color: "green" },
          { label: "Giảng viên", value: "200+", icon: Award, color: "purple" },
          { label: "Đánh giá", value: "4.9★", icon: Star, color: "yellow" }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-${stat.color}-100 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
