import React from "react";

import {
  FileText,
  Video,
  BookOpen,
  Calculator,
  Download,
  Eye,
  Calendar,
  Users,
  Star,
  Search,
  Filter,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { resourcesData } from "../data/resources";

import { AppProviders } from "../lib/providers/app-providers";

const categories = [
  { id: "all", label: "Tất cả", count: resourcesData.length, icon: FileText },
  {
    id: "documents",
    label: "Tài liệu",
    count: resourcesData.filter((r) => r.type === "pdf" || r.type === "doc")
      .length,
    icon: FileText,
  },
  {
    id: "videos",
    label: "Video",
    count: resourcesData.filter((r) => r.type === "guide").length,
    icon: Video,
  },
  {
    id: "standards",
    label: "Tiêu chuẩn",
    count: resourcesData.filter(
      (r) => r.field === "BIM" || r.field === "Quality Management"
    ).length,
    icon: BookOpen,
  },
  {
    id: "tools",
    label: "Công cụ",
    count: resourcesData.filter((r) => r.type === "project").length,
    icon: Calculator,
  },
];

export default function ResourcesPage() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 py-20">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Thư viện tài nguyên
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Tài nguyên Miễn phí
                  <br />
                  <span className="bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                    cho Kỹ sư Xây dựng
                  </span>
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                  Thư viện tài liệu, video hướng dẫn, tiêu chuẩn xây dựng và
                  công cụ tính toán giúp bạn nâng cao kiến thức và kỹ năng.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {[
                  { label: "Tài liệu", value: "1000+", icon: FileText },
                  { label: "Video", value: "500+", icon: Video },
                  { label: "Tiêu chuẩn", value: "200+", icon: BookOpen },
                  { label: "Công cụ", value: "50+", icon: Calculator },
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mx-auto mb-2">
                        <IconComponent className="h-6 w-6 text-purple-200" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-purple-200">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter */}
            <div className="mb-12 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tài nguyên..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="popular">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="downloads">Tải nhiều nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Resource Categories Tabs */}
            <Tabs defaultValue="all" className="mb-12">
              <TabsList className="grid w-full grid-cols-5">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="text-sm"
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.label}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resourcesData
                      .filter(
                        (resource) =>
                          category.id === "all" ||
                          resource.field === category.id
                      )
                      .map((resource) => (
                        <Card
                          key={resource.id}
                          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/5 backdrop-blur-sm border-white/10 text-white"
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
                                {resource.type === "pdf" ||
                                resource.type === "doc"
                                  ? "Tài liệu"
                                  : resource.type === "guide"
                                  ? "Video"
                                  : resource.field === "BIM"
                                  ? "Tiêu chuẩn"
                                  : "Công cụ"}
                              </Badge>
                              {resource.accessLevel === "free" && (
                                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-400/30">
                                  Miễn phí
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                              {resource.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-gray-400">
                              {resource.field} - {resource.type}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="pb-4">
                            <div className="space-y-3">
                              {/* Resource Stats */}
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Download className="h-4 w-4" />
                                  <span>1K+ lượt tải</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>500+ lượt xem</span>
                                </div>
                              </div>

                              {/* Rating */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(4.5)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  4.5 (100+ đánh giá)
                                </span>
                              </div>

                              {/* Tags */}
                              {resource.tags && (
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground">
                                    Tags:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {resource.tags
                                      .slice(0, 3)
                                      .map((tag, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    {resource.tags.length > 3 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +{resource.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* File Info */}
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(
                                      resource.createdAt
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                {resource.type === "pdf" && <span>2.5 MB</span>}
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-0">
                            <div className="w-full space-y-3">
                              <div className="flex gap-2">
                                <Button className="flex-1" size="lg">
                                  {resource.type === "guide"
                                    ? "Xem video"
                                    : "Tải xuống"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="px-3"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Featured Resources */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Tài nguyên Nổi bật</h2>
                <p className="text-lg text-muted-foreground">
                  Những tài liệu và công cụ được đánh giá cao nhất
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Featured Document */}
                <Card className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-400/30 backdrop-blur-sm">
                  <CardHeader>
                    <Badge
                      variant="outline"
                      className="w-fit border-purple-400/50 text-purple-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tài liệu nổi bật
                    </Badge>
                    <CardTitle className="text-2xl text-white">
                      Hướng dẫn BIM cho Dự án Xây dựng
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Tài liệu toàn diện về quy trình BIM từ thiết kế đến thi
                      công
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Độ dày:</span>
                        <span className="font-semibold text-white">150 trang</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Định dạng:</span>
                        <span className="font-semibold text-white">PDF + Word</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Cập nhật:</span>
                        <span className="font-semibold text-white">Tháng 12/2024</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Tải miễn phí
                    </Button>
                  </CardFooter>
                </Card>

                {/* Featured Video Series */}
                <Card className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-violet-400/30 backdrop-blur-sm">
                  <CardHeader>
                    <Badge
                      variant="outline"
                      className="w-fit border-violet-400/50 text-violet-300"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video series
                    </Badge>
                    <CardTitle className="text-2xl text-white">
                      Khóa học AutoCAD từ Cơ bản đến Nâng cao
                    </CardTitle>
                    <CardDescription className="text-violet-200">
                      Series video 20 bài giảng với hơn 10 giờ nội dung chất
                      lượng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-300">Số bài:</span>
                        <span className="font-semibold text-white">20 bài</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-300">Thời lượng:</span>
                        <span className="font-semibold text-white">10+ giờ</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-300">Đánh giá:</span>
                        <span className="font-semibold text-white">
                          4.9★ (500+ đánh giá)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      Xem series
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold">Đóng góp tài nguyên?</h2>
                <p className="text-lg text-muted-foreground">
                  Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng kỹ sư
                  xây dựng
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Đăng tải tài nguyên
                  </Button>
                  <Button variant="outline" size="lg">
                    Liên hệ hợp tác
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppProviders>
  );
}
