import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Star,
  Search,
  ArrowRight,
  Play,
  CheckCircle,
  Zap,
  Award,
  Calendar,
  X,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { coursesData } from "../data/courses";
import { Course } from "../types/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import ProtectedVideoPlayer from "../components/video/ProtectedVideoPlayer";
import { PageLayout } from "../components/layout/PageLayout";
import { useAuth } from "../contexts/UnifiedAuthContext";

export default function KhoaHocPage() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: "all", name: "Tất cả", count: coursesData.length },
    { id: "BIM", name: "BIM", count: coursesData.filter((c) => c.tags?.includes("BIM")).length },
    { id: "AutoCAD", name: "AutoCAD", count: coursesData.filter((c) => c.tags?.includes("AutoCAD")).length },
    { id: "Revit", name: "Revit", count: coursesData.filter((c) => c.tags?.includes("Revit")).length },
    { id: "Automation", name: "Automation", count: coursesData.filter((c) => c.tags?.includes("Automation")).length },
  ];

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.tags?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageLayout>
      {/* Hero */}
      <section className="py-8 md:py-12 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <BookOpen className="h-4 w-4" />
            Khóa học chuyên nghiệp
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Khóa học BIM & Xây dựng
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Học tư duy workflow và tool tự động hóa thiết kế xây dựng. Làm chủ công nghệ BIM, Revit, AutoCAD với các chuyên gia hàng đầu.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="px-5 py-4 rounded-xl border border-border bg-card text-center min-w-[120px]">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Khóa học</div>
            </div>
            <div className="px-5 py-4 rounded-xl border border-border bg-card text-center min-w-[120px]">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Học viên</div>
            </div>
            <div className="px-5 py-4 rounded-xl border border-border bg-card text-center min-w-[120px]">
              <div className="text-2xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">Đánh giá</div>
            </div>
          </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-t border-border bg-muted/30">
        <div>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-input rounded-lg bg-background text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                  <span className="ml-1 opacity-80">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course list */}
      <section className="py-12">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Khóa học được yêu thích nhất
            </h2>
            <p className="text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{filteredCourses.length}</span> khóa học
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCourseClick(course)}
                onKeyDown={(e) => e.key === "Enter" && handleCourseClick(course)}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
              >
                <div className="h-44 bg-primary/5 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  {course.isHot && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Nổi bật
                    </Badge>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {course.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3">
                    {course.level} • {course.domain}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {course.year}
                    </span>
                    {course.ratingCount != null && course.ratingCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.ratingCount} học viên
                      </span>
                    )}
                    {course.ratingAvg != null && course.ratingAvg > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        {course.ratingAvg.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      {!course.price || course.price === 0 ? (
                        <span className="text-lg font-bold text-green-600">Miễn phí</span>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          {course.price.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                    <Button size="sm" className="shrink-0">
                      Đăng ký
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto p-12 rounded-xl border border-border bg-card">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Không tìm thấy khóa học
                </h3>
                <p className="text-muted-foreground">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl border border-border bg-card">
            <div className="inline-flex p-4 rounded-xl bg-primary/10 text-primary mb-4">
              <Award className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sẵn sàng bắt đầu học?
            </h2>
            <p className="text-muted-foreground mb-6">
              Tham gia cùng hàng trăm học viên đang học tập và phát triển kỹ năng
            </p>
            <Link to="/dang-nhap">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      </PageLayout>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
              {selectedCourse?.title}
              {selectedCourse?.isHot && (
                <Badge className="bg-amber-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Nổi bật
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedCourse?.domain} • {selectedCourse?.level} • {selectedCourse?.year}
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6 mt-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedCourse.videoUrl ? (
                  <ProtectedVideoPlayer
                    videoUrl={selectedCourse.videoUrl}
                    courseId={selectedCourse.id}
                    allowDownload={false}
                    watermarkText={
                      userProfile?.email
                        ? `${userProfile.email} - ${selectedCourse.title}`
                        : `Knowledge Base - ${selectedCourse.title}`
                    }
                    onProgress={() => {}}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Shield className="h-16 w-16 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Video preview sẽ có sẵn sau khi đăng ký</p>
                    <Lock className="h-8 w-8 text-muted-foreground mt-2" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Năm</div>
                  <div className="font-bold text-foreground">{selectedCourse.year}</div>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <BookOpen className="h-5 w-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Cấp độ</div>
                  <div className="font-bold text-foreground">{selectedCourse.level}</div>
                </div>
                {selectedCourse.ratingCount != null && selectedCourse.ratingCount > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <Users className="h-5 w-5 text-primary mb-2" />
                    <div className="text-xs text-muted-foreground">Học viên</div>
                    <div className="font-bold text-foreground">{selectedCourse.ratingCount}</div>
                  </div>
                )}
                {selectedCourse.ratingAvg != null && selectedCourse.ratingAvg > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <Star className="h-5 w-5 text-amber-500 mb-2" />
                    <div className="text-xs text-muted-foreground">Đánh giá</div>
                    <div className="font-bold text-foreground">{selectedCourse.ratingAvg.toFixed(1)}/5</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCourse.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md text-sm bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="rounded-lg border border-border p-5">
                <h3 className="font-bold text-foreground mb-2">Về khóa học</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Khóa học <strong className="text-foreground">{selectedCourse.title}</strong> thuộc lĩnh vực{" "}
                  <strong className="text-foreground">{selectedCourse.domain}</strong> với độ khó{" "}
                  <strong className="text-foreground">{selectedCourse.level}</strong>. Được thiết kế để giúp bạn nắm vững các kỹ năng và kiến thức cần thiết trong ngành xây dựng và BIM.
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Video được bảo vệ</h4>
                  <p className="text-sm text-muted-foreground">
                    Nội dung khóa học được bảo vệ bằng công nghệ DRM. Không cho phép quay màn hình, screenshot hoặc tải xuống để đảm bảo bản quyền.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button size="lg" className="flex-1 gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Đăng ký khóa học
                  {selectedCourse.price && selectedCourse.price > 0 ? (
                    <span className="font-bold">{selectedCourse.price.toLocaleString("vi-VN")}₫</span>
                  ) : (
                    <span className="font-bold">Miễn phí</span>
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={handleClosePreview} className="gap-2">
                  <X className="h-4 w-4" />
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
