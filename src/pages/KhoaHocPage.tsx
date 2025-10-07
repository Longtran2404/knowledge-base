import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
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
import { BlurText, BlurTextWords } from "../components/ui/blur-text";
import { FluidGlass, FluidGlassCard } from "../components/ui/fluid-glass";
import { Counter } from "../components/ui/counter";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import ProtectedVideoPlayer from "../components/video/ProtectedVideoPlayer";
import { useAuth } from "../contexts/UnifiedAuthContext";

export default function KhoaHocPage() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: "all", name: "Tất cả", count: coursesData.length },
    { id: "BIM", name: "BIM", count: coursesData.filter(c => c.tags?.includes("BIM")).length },
    { id: "AutoCAD", name: "AutoCAD", count: coursesData.filter(c => c.tags?.includes("AutoCAD")).length },
    { id: "Revit", name: "Revit", count: coursesData.filter(c => c.tags?.includes("Revit")).length },
    { id: "Automation", name: "Automation", count: coursesData.filter(c => c.tags?.includes("Automation")).length },
  ];

  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" ||
                           course.tags?.includes(selectedCategory);
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
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 text-sm font-medium mb-8"
          >
            <BookOpen className="h-4 w-4 text-blue-400" />
            Khóa học chuyên nghiệp
          </motion.div>

          <div className="mb-6 px-4">
            <BlurTextWords
              text="Khóa học BIM & Xây dựng"
              className="text-4xl md:text-5xl lg:text-7xl font-bold break-words"
              wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
              variant="blur-slide"
            />
          </div>

          <BlurText
            text="Học tư duy workflow và tool tự động hóa thiết kế xây dựng. Làm chủ công nghệ BIM, Revit, AutoCAD với các chuyên gia hàng đầu."
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed px-4"
            delay={0.3}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            <FluidGlass variant="dark" blur="md" className="px-6 py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <div className="text-left">
                  <Counter value={50} suffix="+" className="text-2xl font-bold text-white" />
                  <div className="text-sm text-gray-400">Khóa học</div>
                </div>
              </div>
            </FluidGlass>

            <FluidGlass variant="dark" blur="md" className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                <div className="text-left">
                  <Counter value={500} suffix="+" className="text-2xl font-bold text-white" />
                  <div className="text-sm text-gray-400">Học viên</div>
                </div>
              </div>
            </FluidGlass>

            <FluidGlass variant="dark" blur="md" className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-400" />
                <div className="text-left">
                  <Counter value={4.9} suffix="/5" decimals={1} className="text-2xl font-bold text-white" />
                  <div className="text-sm text-gray-400">Đánh giá</div>
                </div>
              </div>
            </FluidGlass>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 rounded-full"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-gray-900 text-white">
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Khóa học được yêu thích nhất
            </h2>
            <p className="text-gray-400">
              Tìm thấy <span className="text-blue-400 font-semibold">{filteredCourses.length}</span> khóa học
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleCourseClick(course)}
              >
                <FluidGlass variant="dark" blur="lg" glow className="h-full overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
                  {/* Course Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-16 w-16 text-white/50 group-hover:text-white/80 transition-colors" />
                      </div>
                    )}
                    {course.isHot && (
                      <Badge className="absolute top-4 left-4 bg-yellow-500/90 text-black border-0">
                        <Star className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex gap-2 mb-3">
                      {course.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-blue-400/30 text-blue-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>

                    {/* Level & Domain */}
                    <p className="text-sm text-gray-400 mb-4">
                      {course.level} • {course.domain}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{course.year}</span>
                      </div>
                      {course.ratingCount && course.ratingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.ratingCount} học viên</span>
                        </div>
                      )}
                      {course.ratingAvg && course.ratingAvg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{course.ratingAvg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        {!course.price || course.price === 0 ? (
                          <span className="text-2xl font-bold text-green-400">Miễn phí</span>
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {course.price.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                      >
                        Đăng ký
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FluidGlass>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <FluidGlass variant="dark" blur="lg" className="max-w-md mx-auto p-12">
                <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy khóa học</h3>
                <p className="text-gray-400">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
              </FluidGlass>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <FluidGlass variant="dark" blur="xl" glow className="max-w-4xl mx-auto p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                <Award className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu học?
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Tham gia cùng hàng trăm học viên đang học tập và phát triển kỹ năng
            </p>

            <Link to="/dang-nhap">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:shadow-lg hover:shadow-blue-500/50 text-white border-0 px-8 py-6 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Đăng ký ngay
              </Button>
            </Link>
          </FluidGlass>
        </div>
      </section>

      {/* Course Preview Modal with Protected Video */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedCourse?.title}
              {selectedCourse?.isHot && (
                <Badge className="bg-yellow-500/90 text-black border-0 ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  Nổi bật
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedCourse?.domain} • {selectedCourse?.level} • {selectedCourse?.year}
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6 mt-4">
              {/* Video Preview with Protection */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg overflow-hidden">
                {selectedCourse.videoUrl ? (
                  <ProtectedVideoPlayer
                    videoUrl={selectedCourse.videoUrl}
                    courseId={selectedCourse.id}
                    allowDownload={false}
                    watermarkText={userProfile?.email ? `${userProfile.email} - ${selectedCourse.title}` : `Nam Long Center - ${selectedCourse.title}`}
                    onProgress={(progress) => {
                      // Track video progress (can be saved to database later)
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Shield className="h-20 w-20 text-white/30 mb-4" />
                    <p className="text-gray-400 text-lg">Video preview sẽ có sẵn sau khi đăng ký</p>
                    <Lock className="h-8 w-8 text-gray-500 mt-2" />
                  </div>
                )}
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Calendar className="h-5 w-5 text-blue-400 mb-2" />
                  <div className="text-sm text-gray-400">Năm</div>
                  <div className="text-lg font-bold">{selectedCourse.year}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <BookOpen className="h-5 w-5 text-green-400 mb-2" />
                  <div className="text-sm text-gray-400">Cấp độ</div>
                  <div className="text-lg font-bold">{selectedCourse.level}</div>
                </div>
                {selectedCourse.ratingCount && selectedCourse.ratingCount > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <Users className="h-5 w-5 text-purple-400 mb-2" />
                    <div className="text-sm text-gray-400">Học viên</div>
                    <div className="text-lg font-bold">{selectedCourse.ratingCount}</div>
                  </div>
                )}
                {selectedCourse.ratingAvg && selectedCourse.ratingAvg > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <Star className="h-5 w-5 text-yellow-400 mb-2" />
                    <div className="text-sm text-gray-400">Đánh giá</div>
                    <div className="text-lg font-bold">{selectedCourse.ratingAvg.toFixed(1)}/5</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedCourse.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-blue-400/30 text-blue-400">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">Về khóa học</h3>
                <p className="text-gray-300 leading-relaxed">
                  Khóa học <strong>{selectedCourse.title}</strong> thuộc lĩnh vực <strong>{selectedCourse.domain}</strong>
                  {' '}với độ khó <strong>{selectedCourse.level}</strong>.
                  {' '}Được thiết kế để giúp bạn nắm vững các kỹ năng và kiến thức cần thiết trong ngành xây dựng và BIM.
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Video được bảo vệ</h4>
                  <p className="text-sm text-gray-300">
                    Nội dung khóa học được bảo vệ bằng công nghệ DRM. Không cho phép quay màn hình,
                    screenshot hoặc tải xuống để đảm bảo bản quyền.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => {
                    handleClosePreview();
                    // Navigate to enrollment page
                  }}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Đăng ký khóa học
                  {selectedCourse.price && selectedCourse.price > 0 ? (
                    <span className="ml-2 font-bold">
                      {selectedCourse.price.toLocaleString('vi-VN')}₫
                    </span>
                  ) : (
                    <span className="ml-2 font-bold">Miễn phí</span>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={handleClosePreview}
                >
                  <X className="mr-2 h-4 w-4" />
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
