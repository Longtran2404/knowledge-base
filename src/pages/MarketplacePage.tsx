import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { getCourses, purchaseCourse, Course as CourseType } from '../lib/supabase';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  PlayCircle, 
  ShoppingCart,
  BookOpen,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const mockCourses: CourseType[] = [
      {
        id: '1',
        title: 'Revit Architecture 2024 - Từ cơ bản đến nâng cao',
        description: 'Học Revit Architecture từ những kiến thức cơ bản nhất đến các kỹ thuật nâng cao cho việc thiết kế kiến trúc chuyên nghiệp.',
        price: 2500000,
        image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3270e8b8?w=500',
        instructor_id: 'instructor1',
        category: 'BIM',
        level: 'Cơ bản',
        duration: '120 giờ',
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '2',
        title: 'AutoCAD 2024 - Vẽ kỹ thuật chuyên nghiệp',
        description: 'Khóa học AutoCAD toàn diện từ cơ bản đến nâng cao, bao gồm 2D và 3D modeling.',
        price: 1800000,
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500',
        instructor_id: 'instructor2',
        category: 'CAD',
        level: 'Trung cấp',
        duration: '80 giờ',
        is_published: true,
        created_at: '2024-01-02',
        updated_at: '2024-01-02'
      },
      {
        id: '3',
        title: 'SketchUp Pro - Thiết kế kiến trúc 3D',
        description: 'Học SketchUp Pro để tạo ra những mô hình 3D kiến trúc ấn tượng và chuyên nghiệp.',
        price: 1500000,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        instructor_id: 'instructor3',
        category: '3D',
        level: 'Cơ bản',
        duration: '60 giờ',
        is_published: true,
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      },
      {
        id: '4',
        title: 'Lumion - Render kiến trúc chuyên nghiệp',
        description: 'Tạo ra những hình ảnh render và video kiến trúc chất lượng cao với Lumion.',
        price: 2200000,
        image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500',
        instructor_id: 'instructor4',
        category: 'Render',
        level: 'Nâng cao',
        duration: '100 giờ',
        is_published: true,
        created_at: '2024-01-04',
        updated_at: '2024-01-04'
      },
      {
        id: '5',
        title: 'Quản lý dự án xây dựng với Microsoft Project',
        description: 'Học cách quản lý dự án xây dựng hiệu quả với Microsoft Project và các công cụ khác.',
        price: 1200000,
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500',
        instructor_id: 'instructor5',
        category: 'Quản lý',
        level: 'Trung cấp',
        duration: '40 giờ',
        is_published: true,
        created_at: '2024-01-05',
        updated_at: '2024-01-05'
      },
      {
        id: '6',
        title: 'SAP2000 - Tính toán kết cấu',
        description: 'Khóa học SAP2000 để tính toán và phân tích kết cấu công trình một cách chính xác.',
        price: 2800000,
        image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500',
        instructor_id: 'instructor6',
        category: 'Kết cấu',
        level: 'Nâng cao',
        duration: '150 giờ',
        is_published: true,
        created_at: '2024-01-06',
        updated_at: '2024-01-06'
      }
    ];
    // Simulate loading courses
    setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });

    // Sort courses
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const handlePurchase = async (courseId: string, price: number) => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/marketplace' } } });
      return;
    }

    setPurchasing(courseId);
    try {
      await purchaseCourse(courseId, price);
      toast.success('Mua khóa học thành công! Bạn có thể bắt đầu học ngay.');
      // Redirect to user courses or course detail
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi mua khóa học');
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const categories = ['all', 'BIM', 'CAD', '3D', 'Render', 'Quản lý', 'Kết cấu'];
  const levels = ['all', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Marketplace Khóa Học
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{courses.length}+ Khóa học</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Chứng chỉ hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Tất cả danh mục' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trình độ" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'Tất cả trình độ' : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                  <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tìm thấy {filteredCourses.length} khóa học
          </h2>
          <p className="text-gray-600">
            Chọn khóa học phù hợp với nhu cầu học tập của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant={course.level === 'Cơ bản' ? 'default' : 
                              course.level === 'Trung cấp' ? 'secondary' : 'destructive'}
                      className="bg-white/90"
                    >
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </CardDescription>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(course.price)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 1000) + 100} học viên
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePurchase(course.id, course.price)}
                    disabled={purchasing === course.id}
                  >
                    {purchasing === course.id ? (
                      'Đang mua...'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mua ngay
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy khóa học nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}