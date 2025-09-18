import React from "react";

import { Search, Filter, Star, Users, Clock, ArrowRight, BookOpen, Zap, Target } from "lucide-react";
import { LiquidGlassButton } from "../components/ui/liquid-glass-button";
import { LiquidGlassCard } from "../components/ui/liquid-glass-card";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { coursesData } from "../data/courses";
import { AnimeScrollEffects, StaggerAnimation } from "../components/animations/anime-scroll-effects";

import { AppProviders } from "../lib/providers/app-providers";
import { FilterWrapper } from "../components/filters/filter-wrapper";


export default function CoursesPage() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <main className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section */}
          <AnimeScrollEffects animationType="fadeInUp" delay={200}>
            <LiquidGlassCard variant="gradient" glow={true} className="text-center py-16 md:py-24 mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                Khóa học <span className="text-blue-600">BIM Automation</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
                Học tư duy workflow + tool tự động hóa thiết kế xây dựng.
                Làm chủ công nghệ BIM, Revit, AutoCAD và các phần mềm thiết kế hiện đại.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  50+ Khóa học
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Users className="h-5 w-5 mr-2" />
                  500+ Học viên
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Star className="h-5 w-5 mr-2" />
                  4.9/5 Đánh giá
                </Badge>
              </div>
            </LiquidGlassCard>
          </AnimeScrollEffects>

          {/* Search and Filters */}
          <AnimeScrollEffects animationType="fadeInUp" delay={300}>
            <div className="mb-8">
              {/* Enhanced Filter */}
              <FilterWrapper
                categories={[
                  {
                    id: "level",
                    label: "Cấp độ",
                    options: [
                      { id: "beginner", label: "Cơ bản", value: "beginner", count: 15 },
                      { id: "intermediate", label: "Trung cấp", value: "intermediate", count: 23 },
                      { id: "advanced", label: "Nâng cao", value: "advanced", count: 18 }
                    ],
                    multiSelect: true
                  },
                  {
                    id: "category",
                    label: "Chuyên ngành",
                    options: [
                      { id: "bim", label: "BIM", value: "bim", count: 25 },
                      { id: "automation", label: "Automation", value: "automation", count: 20 },
                      { id: "revit", label: "Revit", value: "revit", count: 18 },
                      { id: "autocad", label: "AutoCAD", value: "autocad", count: 15 }
                    ],
                    multiSelect: true
                  },
                  {
                    id: "duration",
                    label: "Thời lượng",
                    options: [
                      { id: "short", label: "Ngắn hạn (< 10h)", value: "short", count: 12 },
                      { id: "medium", label: "Trung bình (10-30h)", value: "medium", count: 28 },
                      { id: "long", label: "Dài hạn (> 30h)", value: "long", count: 16 }
                    ],
                    multiSelect: false
                  }
                ]}
                searchPlaceholder="Tìm kiếm khóa học..."
                className="mb-6"
              />

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {['Tất cả', 'BIM', 'Revit', 'AutoCAD', 'Automation', 'Workflow'].map((category, index) => (
                  <AnimeScrollEffects
                    key={category}
                    animationType="fadeInLeft"
                    delay={400 + index * 50}
                  >
                    <Badge
                      variant={category === 'Tất cả' ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-blue-50 transition-colors px-4 py-2 text-sm"
                    >
                      {category}
                    </Badge>
                  </AnimeScrollEffects>
                ))}
              </div>
            </div>
          </AnimeScrollEffects>

          {/* Featured Course */}
          <AnimeScrollEffects animationType="scaleIn" delay={500}>
            <LiquidGlassCard variant="gradient" glow={true} className="mb-12 text-white overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div>
                  <Badge variant="secondary" className="mb-4 bg-yellow-400 text-yellow-900">
                    <Zap className="h-4 w-4 mr-2" />
                    Khóa học nổi bật
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    BIM Automation Masterclass
                  </h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Khóa học toàn diện về BIM Automation, từ cơ bản đến nâng cao. 
                    Học cách tự động hóa quy trình thiết kế và xây dựng.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>40 giờ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>200+ học viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      <span>4.9/5</span>
                    </div>
                  </div>
                  <LiquidGlassButton size="lg" variant="secondary" glow={true}>
                    Đăng ký ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </LiquidGlassButton>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </AnimeScrollEffects>

          {/* Course Grid */}
          <StaggerAnimation staggerDelay={100}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData.map((course, index) => (
                <AnimeScrollEffects
                  key={course.id}
                  animationType="fadeInUp"
                  delay={600 + index * 50}
                >
                  <LiquidGlassCard variant="interactive" hover={true} className="group">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg flex items-center justify-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.domain}
                        </Badge>
                        <div className="text-2xl font-bold text-blue-600">
                          {!course.price || course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                                         <CardDescription className="line-clamp-2">
                        {course.domain} - {course.level || 'Chuyên môn'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Thời lượng: 40 giờ</span>
                          <span>{course.ratingCount || 0} học viên</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(course.ratingAvg || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {course.ratingAvg || 0}/5
                          </span>
                        </div>
                        <LiquidGlassButton className="w-full" variant="primary">
                          Xem chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </AnimeScrollEffects>
              ))}
            </div>
          </StaggerAnimation>

          {/* Call to Action */}
          <AnimeScrollEffects animationType="fadeInUp" delay={800}>
            <section className="mt-16 text-center">
              <LiquidGlassCard variant="gradient" glow={true} className="text-white p-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Sẵn sàng bắt đầu hành trình?
                </h2>
                <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
                  Tham gia cộng đồng kỹ sư xây dựng tiên tiến và làm chủ công nghệ BIM Automation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <LiquidGlassButton size="lg" variant="secondary" glow={true}>
                    Đăng ký khóa học
                  </LiquidGlassButton>
                  <LiquidGlassButton size="lg" variant="ghost" className="text-white">
                    Tư vấn miễn phí
                  </LiquidGlassButton>
                </div>
              </LiquidGlassCard>
            </section>
          </AnimeScrollEffects>
        </main>
      </div>
    </AppProviders>
  );
}
