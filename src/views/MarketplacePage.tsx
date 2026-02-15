import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { SEO } from "../components/SEO";

export default function MarketplacePage() {
  const { userProfile: user } = useAuth();
  const { courses, coursesLoading, refreshCourses } = useGlobalData();
  const navigate = useNavigate();

  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

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
      navigate("/dang-nhap", { state: { from: { pathname: "/cho-mua-ban" } } });
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Marketplace Khóa học" description="Khám phá khóa học chất lượng cao từ chuyên gia" url="/cho-mua-ban" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="h-4 w-4 mr-2" />
              Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Marketplace Khóa Học
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Khám phá hàng trăm khóa học chất lượng cao từ các chuyên gia hàng đầu
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <BookOpen className="w-5 h-5" />
                <span>{courses.length}+ Khóa học</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Users className="w-5 h-5" />
                <span>10,000+ Học viên</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Award className="w-5 h-5" />
                <span>Chứng chỉ hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border bg-background text-foreground"
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

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {coursesLoading ? "Đang tải khóa học..." : `Tìm thấy ${filteredCourses.length} khóa học`}
          </h2>
          <p className="text-muted-foreground">Chọn khóa học phù hợp với nhu cầu học tập của bạn</p>
        </div>

        {coursesLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      onError={(e) => { e.currentTarget.src = "/images/placeholder.svg"; }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-background/90 text-foreground">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={course.level === "Cơ bản" ? "default" : course.level === "Trung cấp" ? "secondary" : "destructive"}
                      >
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <CardTitle className="text-lg mb-2 line-clamp-2 text-foreground">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {course.description}
                  </CardDescription>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">{formatPrice(course.price)}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 1000) + 100} học viên</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/course/${course.id}`)}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePurchase(course.id, course.price)}
                    disabled={purchasing === course.id}
                  >
                    {purchasing === course.id ? "Đang mua..." : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mua ngay
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!coursesLoading && filteredCourses.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {courses.length === 0
                ? 'Nội dung đang được cập nhật'
                : 'Không tìm thấy khóa học phù hợp'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {courses.length === 0
                ? 'Chúng tôi đang chuẩn bị các khóa học chất lượng. Vui lòng quay lại sau.'
                : 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.'}
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
