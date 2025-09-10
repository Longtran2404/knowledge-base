import React from "react";

import { FileText, Calendar, User, Clock, Eye, Heart, Share2, Search, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { postsData } from "../data/posts";

import { AppProviders } from "@/lib/providers/app-providers";


const categories = [
  { id: "all", label: "Tất cả", count: postsData.length },
  { id: "bim", label: "BIM & Revit", count: postsData.filter(p => p.tags?.includes("BIM")).length },
  { id: "automation", label: "Automation", count: postsData.filter(p => p.tags?.includes("Automation")).length },
  { id: "construction", label: "Xây dựng", count: postsData.filter(p => p.tags?.includes("Construction")).length },
  { id: "technology", label: "Công nghệ", count: postsData.filter(p => p.tags?.includes("Technology")).length },
  { id: "tips", label: "Tips & Tricks", count: postsData.filter(p => p.tags?.includes("Tips")).length },
];

const popularTags = [
  "BIM", "Revit", "AutoCAD", "Automation", "Xây dựng", "Thiết kế", "Workflow", "Tips"
];

export default function BlogPage() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 py-20">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="border-orange-400/50 text-orange-200 bg-orange-950/50 backdrop-blur-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Blog chuyên môn
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Kiến thức & Kinh nghiệm
                  <br />
                  <span className="bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">
                    từ Chuyên gia
                  </span>
                </h1>
                <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                  Chia sẻ kiến thức chuyên môn, kinh nghiệm thực tế và xu hướng công nghệ 
                  mới nhất trong ngành xây dựng.
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {[
                  { label: "Bài viết", value: "500+", icon: FileText },
                  { label: "Tác giả", value: "50+", icon: User },
                  { label: "Lượt đọc", value: "100K+", icon: Eye },
                  { label: "Lượt thích", value: "10K+", icon: Heart }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mx-auto mb-2">
                        <IconComponent className="h-6 w-6 text-orange-200" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-orange-200">{stat.label}</div>
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
                      placeholder="Tìm kiếm bài viết..."
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
                  <Select defaultValue="latest">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Mới nhất</SelectItem>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                      <SelectItem value="trending">Đang hot</SelectItem>
                      <SelectItem value="views">Lượt đọc cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Tags phổ biến:</span>
                {popularTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured Post */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Bài viết Nổi bật</h2>
                <p className="text-lg text-muted-foreground">
                  Những bài viết được đánh giá cao và nhiều người quan tâm
                </p>
              </div>
              
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="p-8 flex flex-col justify-center">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="border-orange-400 text-orange-700">
                          {postsData[0]?.tags?.includes("BIM") ? "BIM & Revit" :
                           postsData[0]?.tags?.includes("Automation") ? "Automation" :
                           postsData[0]?.tags?.includes("Construction") ? "Xây dựng" : "Công nghệ"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Nổi bật
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl text-orange-900 leading-tight">
                        {postsData[0]?.title || "Hướng dẫn BIM cho Dự án Xây dựng"}
                      </CardTitle>
                      <CardDescription className="text-lg text-orange-700">
                        {postsData[0]?.excerpt || "Khám phá quy trình BIM từ thiết kế đến thi công với các công cụ và phương pháp hiện đại."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="flex items-center gap-6 text-sm text-orange-700">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Nam Long Center</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{postsData[0] ? new Date(postsData[0].createdAt).toLocaleDateString('vi-VN') : "15/12/2024"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>8 phút đọc</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                        Đọc bài viết
                      </Button>
                    </CardFooter>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center p-8">
                    <div className="text-8xl opacity-30">
                      📝
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Blog Categories Tabs */}
            <Tabs defaultValue="all" className="mb-12">
              <TabsList className="grid w-full grid-cols-6">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-sm">
                    {category.label}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsData
                      .filter(post => category.id === "all" || post.tags?.includes(category.id))
                      .map((post) => (
                        <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="text-xs">
                                {post.tags?.includes("BIM") ? "BIM & Revit" :
                                 post.tags?.includes("Automation") ? "Automation" :
                                 post.tags?.includes("Construction") ? "Xây dựng" :
                                 post.tags?.includes("Technology") ? "Công nghệ" : "Tips & Tricks"}
                              </Badge>
                              {post.tags?.includes("Featured") && (
                                <Badge variant="secondary" className="text-xs">
                                  Nổi bật
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
                              {post.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                              {post.excerpt}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pb-4">
                            <div className="space-y-3">
                              {/* Post Stats */}
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>100+ lượt đọc</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  <span>50+ lượt thích</span>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {post.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {post.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {post.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{post.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>

                          <CardFooter className="pt-0">
                            <div className="w-full space-y-3">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Nam Long Center</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1" size="lg">
                                  Đọc bài viết
                                </Button>
                                <Button variant="outline" size="lg" className="px-3">
                                  <Share2 className="h-4 w-4" />
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

            {/* Newsletter Subscription */}
            <div className="mb-16">
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl text-orange-900">
                    Đăng ký nhận tin tức
                  </CardTitle>
                  <CardDescription className="text-lg text-orange-700">
                    Nhận bài viết mới nhất về BIM, Automation và Công nghệ xây dựng
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <Input
                      placeholder="Email của bạn"
                      type="email"
                      className="flex-1"
                    />
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Đăng ký
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold">Muốn đóng góp bài viết?</h2>
                <p className="text-lg text-muted-foreground">
                  Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng kỹ sư xây dựng
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    Viết bài viết
                  </Button>
                  <Button variant="outline" size="lg">
                    Liên hệ biên tập
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
