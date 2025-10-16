import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { useGlobalData } from "../contexts/GlobalDataContext";
import {
  getCourses,
  purchaseCourse,
  Course as CourseType,
} from "../lib/supabase";
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
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function MarketplacePage() {
  const { userProfile: user } = useAuth();
  const { courses, coursesLoading, refreshCourses } = useGlobalData();
  const navigate = useNavigate();

  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    setLoading(coursesLoading);
  }, [coursesLoading]);

  useEffect(() => {
    let filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });

    // Sort courses
    switch (sortBy) {
      case "price-low":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const handlePurchase = async (courseId: string, price: number) => {
    if (!user) {
      navigate("/auth", { state: { from: { pathname: "/marketplace" } } });
      return;
    }

    setPurchasing(courseId);
    try {
      await purchaseCourse(courseId, price);
      toast.success("Mua khóa học thành công! Bạn có thể bắt đầu học ngay.");
      // Redirect to user courses or course detail
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi mua khóa học");
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const categories = [
    "all",
    "BIM",
    "CAD",
    "3D",
    "Render",
    "Quản lý",
    "Kết cấu",
  ];
  const levels = ["all", "Cơ bản", "Trung cấp", "Nâng cao"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Marketplace Khóa Học
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-blue-300" />
                <span>{courses.length}+ Khóa học</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Users className="w-5 h-5 text-blue-300" />
                <span>10,000+ Học viên</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Award className="w-5 h-5 text-blue-300" />
                <span>Chứng chỉ hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative bg-black/30 backdrop-blur-md border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Tất cả danh mục" : category}
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
                      {level === "all" ? "Tất cả trình độ" : level}
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
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Tìm thấy {filteredCourses.length} khóa học
          </h2>
          <p className="text-gray-300">
            Chọn khóa học phù hợp với nhu cầu học tập của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group bg-black/40 backdrop-blur-md border border-white/10 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <CardHeader className="p-0">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-gray-800"
                    >
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={
                        course.level === "Cơ bản"
                          ? "default"
                          : course.level === "Trung cấp"
                          ? "secondary"
                          : "destructive"
                      }
                      className="bg-white/90"
                    >
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="text-lg mb-2 line-clamp-2 text-white group-hover:text-blue-300 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {course.description}
                </CardDescription>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white">4.8</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-300">
                    {formatPrice(course.price)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
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
                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    onClick={() => handlePurchase(course.id, course.price)}
                    disabled={purchasing === course.id}
                  >
                    {purchasing === course.id ? (
                      "Đang mua..."
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
            <h3 className="text-xl font-semibold text-white mb-2">
              Không tìm thấy khóa học nào
            </h3>
            <p className="text-gray-300 mb-6">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedLevel("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
