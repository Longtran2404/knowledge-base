
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Users, Star, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { Course } from '@/lib/mockData';

interface CourseGridProps {
  courses: Course[];
  showFilters?: boolean;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, showFilters = true }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'popular' | 'field'>('all');
  const [selectedField, setSelectedField] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'Tất cả', icon: BookOpen },
    { id: 'new', label: 'Mới nhất', icon: Calendar },
    { id: 'popular', label: 'Phổ biến', icon: TrendingUp },
    { id: 'field', label: 'Theo lĩnh vực', icon: Star }
  ];

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
        return 'bg-green-100 text-green-800';
      case 'Trung cấp':
        return 'bg-blue-100 text-blue-800';
      case 'Nâng cao':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Khóa Học Nổi Bật
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Nâng cao kỹ năng chuyên môn với các khóa học chất lượng cao từ các chuyên gia hàng đầu
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id as 'all' | 'new' | 'popular' | 'field')}
                  className={`flex items-center gap-2 ${
                    activeFilter === filter.id 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
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
                className={selectedField === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Tất cả lĩnh vực
              </Button>
              {fields.map((field) => (
                <Button
                  key={field}
                  variant={selectedField === field ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedField(field)}
                  className={selectedField === field ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {field}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {filteredCourses.slice(0, 6).map((course) => (
          <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
              {/* Placeholder image with course icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-30">📚</div>
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {course.isNew && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    MỚI
                  </span>
                )}
                {course.isHot && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    HOT
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900">
                  {formatPrice(course.price)}
                </span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              {/* Level Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>

              {/* Field */}
              <p className="text-sm text-gray-500 mb-3">{course.field}</p>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={course.rating} />
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>120+ học viên</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Đăng ký ngay
                </Button>
                <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600">
                  Chi tiết
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Show More Button */}
      {filteredCourses.length > 6 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
          >
            Xem tất cả khóa học ({filteredCourses.length})
          </Button>
        </div>
      )}
    </section>
  );
};

export default CourseGrid;