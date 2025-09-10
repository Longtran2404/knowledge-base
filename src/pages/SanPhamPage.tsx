import React from "react";

import { Search, Filter, Star, Download, ArrowRight, Package, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productsData } from "../data/products";
import { AnimeScrollEffects, StaggerAnimation } from "@/components/animations/anime-scroll-effects";

import { AppProviders } from "@/lib/providers/app-providers";


export default function ProductsPage() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <main className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section */}
          <AnimeScrollEffects animationType="fadeInUp" delay={200}>
            <section className="text-center py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                Công cụ <span className="text-green-600">Automation</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
                Tối ưu hóa workflow thiết kế với các công cụ thông minh và plugin chuyên nghiệp. 
                Tăng hiệu suất làm việc lên 300%.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Package className="h-5 w-5 mr-2" />
                  100+ Sản phẩm
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Download className="h-5 w-5 mr-2" />
                  10K+ Tải về
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Star className="h-5 w-5 mr-2" />
                  4.8/5 Đánh giá
                </Badge>
              </div>
            </section>
          </AnimeScrollEffects>

          {/* Search and Filters */}
          <AnimeScrollEffects animationType="fadeInUp" delay={300}>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button className="h-12 px-8">
                  <Filter className="h-5 w-5 mr-2" />
                  Lọc
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {['Tất cả', 'Plugin', 'Tool', 'Script', 'Template', 'Library'].map((category, index) => (
                  <AnimeScrollEffects
                    key={category}
                    animationType="fadeInLeft"
                    delay={400 + index * 50}
                  >
                    <Badge
                      variant={category === 'Tất cả' ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-green-50 transition-colors px-4 py-2 text-sm"
                    >
                      {category}
                    </Badge>
                  </AnimeScrollEffects>
                ))}
              </div>
            </div>
          </AnimeScrollEffects>

          {/* Featured Product */}
          <AnimeScrollEffects animationType="scaleIn" delay={500}>
            <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div>
                  <Badge variant="secondary" className="mb-4 bg-yellow-400 text-yellow-900">
                    <Zap className="h-4 w-4 mr-2" />
                    Sản phẩm nổi bật
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    BIM Automation Suite
                  </h2>
                  <p className="text-green-100 text-lg mb-6">
                    Bộ công cụ toàn diện cho automation trong BIM. 
                    Tự động hóa quy trình thiết kế, tạo báo cáo và quản lý dự án.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      <span>5K+ tải về</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      <span>4.9/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <span>Plugin</span>
                    </div>
                  </div>
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    Tải về ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </AnimeScrollEffects>

          {/* Products Grid */}
          <StaggerAnimation staggerDelay={100}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.map((product, index) => (
                <AnimeScrollEffects
                  key={product.id}
                  animationType="fadeInUp"
                  delay={600 + index * 50}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-t-lg flex items-center justify-center">
                      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.type}
                        </Badge>
                        <div className="text-2xl font-bold text-green-600">
                          {!product.price || product.price === 0 ? "Miễn phí" : `${product.price.toLocaleString()}đ`}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.domain} - {product.type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Loại: {product.type}</span>
                          <span>{product.ratingCount || 0} người dùng</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.ratingAvg || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {product.ratingAvg || 0}/5
                          </span>
                        </div>
                        <Button className="w-full group-hover:bg-green-600 transition-colors">
                          Tải về <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimeScrollEffects>
              ))}
            </div>
          </StaggerAnimation>

          {/* Call to Action */}
          <AnimeScrollEffects animationType="fadeInUp" delay={800}>
            <section className="mt-16 text-center">
              <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Cần công cụ đặc biệt?
                </h2>
                <p className="text-xl text-emerald-100 mb-6 max-w-2xl mx-auto">
                  Chúng tôi có thể phát triển công cụ tùy chỉnh theo yêu cầu cụ thể của bạn
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                    Yêu cầu tùy chỉnh
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                    Liên hệ tư vấn
                  </Button>
                </div>
              </Card>
            </section>
          </AnimeScrollEffects>
        </main>
      </div>
    </AppProviders>
  );
}
