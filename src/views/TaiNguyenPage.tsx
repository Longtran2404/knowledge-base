/**
 * Trang Tài nguyên - Thiết kế mới, đồng bộ design system
 */

import React, { useState, useMemo } from "react";
import {
  FileText,
  Video,
  BookOpen,
  Calculator,
  Download,
  Eye,
  Calendar,
  Star,
  Search,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import { resourcesData } from "../data/resources";
import { Resource } from "../types/resource";
import { SEO } from "../components/SEO";
import { Counter } from "../components/ui/counter";
import { AppProviders } from "../lib/providers/app-providers";

const categories: { id: string; label: string; icon: typeof FileText; filter: (r: Resource) => boolean }[] = [
  { id: "all", label: "Tất cả", icon: FileText, filter: () => true },
  {
    id: "documents",
    label: "Tài liệu",
    icon: FileText,
    filter: (r: Resource) => r.type === "pdf" || r.type === "doc",
  },
  {
    id: "videos",
    label: "Video",
    icon: Video,
    filter: (r: Resource) => r.type === "guide",
  },
  {
    id: "standards",
    label: "Tiêu chuẩn",
    icon: BookOpen,
    filter: (r: Resource) =>
      r.field === "BIM" ||
      r.tags.some((t) => t.toLowerCase().includes("standard")) ||
      r.tags.some((t) => t.toLowerCase().includes("tcvn")),
  },
  {
    id: "tools",
    label: "Công cụ",
    icon: Calculator,
    filter: (r: Resource) => r.type === "project",
  },
];

const stats = [
  { label: "Tài liệu", value: 1000, suffix: "+", icon: FileText },
  { label: "Video", value: 500, suffix: "+", icon: Video },
  { label: "Tiêu chuẩn", value: 200, suffix: "+", icon: BookOpen },
  { label: "Công cụ", value: 50, suffix: "+", icon: Calculator },
];

function getTypeLabel(resource: Resource): string {
  if (resource.type === "pdf" || resource.type === "doc") return "Tài liệu";
  if (resource.type === "guide") return "Video";
  if (resource.type === "project") return "Công cụ";
  if (
    resource.tags.some((t) => t.toLowerCase().includes("standard")) ||
    resource.field === "BIM"
  )
    return "Tiêu chuẩn";
  return "Tài liệu";
}

export default function TaiNguyenPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredResources = useMemo(() => {
    const cat = categories.find((c) => c.id === activeCategory);
    let list = resourcesData.filter((r) => (cat ? cat.filter(r) : true));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.field.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "newest") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "popular") {
      list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [searchQuery, activeCategory, sortBy]);

  const featuredResources = useMemo(
    () => resourcesData.slice(0, 2),
    []
  );

  return (
    <AppProviders>
      <SEO
        title="Tài nguyên"
        description="Thư viện tài liệu, video hướng dẫn, tiêu chuẩn xây dựng và công cụ tính toán cho kỹ sư xây dựng"
        url="/tai-nguyen"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
                <FileText className="h-4 w-4" />
                Thư viện tài nguyên
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="gradient-text">Tài nguyên miễn phí</span>
                <br />
                <span className="text-foreground">cho Kỹ sư Xây dựng</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Tài liệu, video hướng dẫn, tiêu chuẩn và công cụ tính toán giúp
                bạn nâng cao kiến thức và kỹ năng chuyên môn.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 md:py-14 relative -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="border border-border/60 bg-card/95 shadow-soft hover:shadow-medium hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <CardContent className="p-5 md:p-6 text-center">
                      <div className="inline-flex p-2.5 rounded-xl bg-primary/10 text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-primary mb-0.5">
                        <Counter
                          value={stat.value}
                          suffix={stat.suffix}
                          decimals={0}
                        />
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tài nguyên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 rounded-xl border-border/60"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-44 h-11 rounded-xl">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="title">Theo tên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count =
                  cat.id === "all"
                    ? resourcesData.length
                    : resourcesData.filter(cat.filter).length;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={`ml-0.5 text-xs ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : ""
                      }`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Resource grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card
                  key={resource.id}
                  className="group border border-border/60 bg-card shadow-soft hover:shadow-medium hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-primary/30 text-primary shrink-0"
                      >
                        {getTypeLabel(resource)}
                      </Badge>
                      {resource.accessLevel === "free" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 shrink-0"
                        >
                          Miễn phí
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-2">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-muted-foreground">
                      {resource.field} · {resource.type.toUpperCase()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          Tải xuống
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          Xem
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i <= 4
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        4.5 ({resource.year})
                      </span>
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(resource.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg gap-2"
                    >
                      {resource.type === "guide" ? (
                        <>
                          <Video className="h-4 w-4" />
                          Xem video
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Tải xuống
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg px-3">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Không tìm thấy tài nguyên</p>
                <p className="text-sm mt-1">
                  Thử đổi từ khóa tìm kiếm hoặc danh mục khác
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Featured Resources */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Nổi bật
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Tài nguyên được quan tâm
                </h2>
                <p className="text-muted-foreground">
                  Tài liệu và công cụ được đánh giá cao nhất
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredResources.map((resource, idx) => (
                  <Card
                    key={resource.id}
                    className={`overflow-hidden border border-border/60 shadow-soft hover:shadow-medium hover:border-primary/30 transition-all duration-300 group ${
                      idx === 0
                        ? "bg-gradient-to-br from-primary/8 to-primary/5"
                        : "bg-gradient-to-br from-accent/50 to-transparent"
                    }`}
                  >
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors">
                          {resource.type === "guide" ? (
                            <Video className="h-7 w-7" />
                          ) : (
                            <FileText className="h-7 w-7" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge
                            variant="outline"
                            className="mb-2 border-primary/40 text-primary"
                          >
                            {getTypeLabel(resource)}
                          </Badge>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                            {resource.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {resource.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-muted-foreground">
                              {resource.field}
                            </span>
                            <span className="text-sm text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">
                              {resource.year}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="shrink-0 rounded-xl gap-2"
                          size="lg"
                          asChild
                        >
                          <Link to="/tai-nguyen" className="gap-2">
                            {resource.type === "guide" ? "Xem" : "Tải"}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-20 text-center py-16 rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 to-muted/20">
              <div className="max-w-2xl mx-auto px-4 space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Đóng góp tài nguyên?
                </h2>
                <p className="text-muted-foreground">
                  Chia sẻ kiến thức và kinh nghiệm với cộng đồng kỹ sư xây dựng
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="rounded-xl gap-2" asChild>
                    <Link to="/contact">
                      <Upload className="h-5 w-5" />
                      Đăng tải tài nguyên
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-xl" asChild>
                    <Link to="/contact">Liên hệ hợp tác</Link>
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
