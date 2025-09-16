import React, { useState } from "react";
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
  Construction,
  Wrench,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { toast } from "sonner";

// Mock data for demonstration
const mockProducts = [
  {
    id: "1",
    title: "Khóa học BIM Revit Architecture",
    description: "Học thiết kế kiến trúc với Revit từ cơ bản đến nâng cao",
    price: 299000,
    originalPrice: 599000,
    rating: 4.8,
    students: 1250,
    duration: "40 giờ",
    level: "Trung cấp",
    category: "Khóa học",
    image: "/images/courses/revit-arch.jpg",
    tags: ["BIM", "Revit", "Architecture"],
    isNew: true,
  },
  {
    id: "2",
    title: "AutoCAD 2D/3D Chuyên nghiệp",
    description: "Thành thạo AutoCAD cho kỹ sư xây dựng",
    price: 199000,
    originalPrice: 399000,
    rating: 4.9,
    students: 2100,
    duration: "30 giờ",
    level: "Cơ bản",
    category: "Khóa học",
    image: "/images/courses/autocad.jpg",
    tags: ["AutoCAD", "2D", "3D"],
    isNew: false,
  },
  {
    id: "3",
    title: "Plugin Revit - BIM Automation",
    description: "Plugin tự động hóa quy trình BIM",
    price: 1500000,
    originalPrice: 2000000,
    rating: 4.7,
    students: 450,
    duration: "Vĩnh viễn",
    level: "Nâng cao",
    category: "Phần mềm",
    image: "/images/products/bim-plugin.jpg",
    tags: ["Plugin", "Automation", "BIM"],
    isNew: true,
  },
  {
    id: "4",
    title: "Sách: BIM Implementation Guide",
    description: "Hướng dẫn triển khai BIM trong dự án",
    price: 250000,
    originalPrice: 350000,
    rating: 4.6,
    students: 800,
    duration: "Sách",
    level: "Tất cả",
    category: "Sách",
    image: "/images/products/bim-book.jpg",
    tags: ["Sách", "BIM", "Guide"],
    isNew: false,
  },
];

const categories = [
  { id: "all", label: "Tất cả", count: mockProducts.length },
  {
    id: "courses",
    label: "Khóa học",
    count: mockProducts.filter((p) => p.category === "Khóa học").length,
  },
  {
    id: "software",
    label: "Phần mềm",
    count: mockProducts.filter((p) => p.category === "Phần mềm").length,
  },
  {
    id: "books",
    label: "Sách",
    count: mockProducts.filter((p) => p.category === "Sách").length,
  },
  {
    id: "tools",
    label: "Công cụ",
    count: mockProducts.filter((p) => p.category === "Công cụ").length,
  },
];

export default function SimpleMarketplacePage() {
  const { userProfile: user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      product.category ===
        categories.find((c) => c.id === selectedCategory)?.label;

    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (product: (typeof mockProducts)[0]) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua sản phẩm");
      return;
    }

    toast.success(`Đã thêm "${product.title}" vào giỏ hàng!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá khóa học, phần mềm, sách và công cụ chuyên nghiệp cho
              ngành xây dựng
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm khóa học, sản phẩm..."
                  className="w-full pl-10 h-12 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Danh mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.label}
                    <Badge variant="secondary" className="ml-auto">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Sort */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sắp xếp</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Phổ biến</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-low">Giá thấp</SelectItem>
                    <SelectItem value="price-high">Giá cao</SelectItem>
                    <SelectItem value="rating">Đánh giá cao</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Development Notice */}
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Construction className="h-6 w-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">
                      Tính năng đang phát triển
                    </h3>
                    <p className="text-orange-700 text-sm">
                      Marketplace hiện đang trong giai đoạn phát triển. Một số
                      tính năng có thể chưa hoạt động đầy đủ.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                    {product.isNew && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Mới
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2"
                    >
                      {product.category}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{product.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{product.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{product.duration}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

