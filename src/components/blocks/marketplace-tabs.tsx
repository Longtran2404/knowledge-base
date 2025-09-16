import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  ShoppingCart,
  Star,
  Package,
  Wrench,
  Book,
  Code,
  Zap,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";

import { Product } from "../../types/product";
import { formatPrice } from "../../lib/spotlight";

interface MarketplaceTabsProps {
  className?: string;
}

export default function MarketplaceTabs({ className }: MarketplaceTabsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) => activeTab === "all" || product.type === activeTab
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tool":
        return <Wrench className="h-4 w-4" />;
      case "book":
        return <Book className="h-4 w-4" />;
      case "software":
        return <Code className="h-4 w-4" />;
      case "bundle":
        return <Zap className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "tool":
        return "Công cụ";
      case "book":
        return "Sách";
      case "software":
        return "Phần mềm";
      case "bundle":
        return "Bundle";
      default:
        return "Sản phẩm";
    }
  };

  const StarRating = ({
    rating,
    count,
  }: {
    rating?: number;
    count?: number;
  }) => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({count || 0})
        </span>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-30">
                {getTypeIcon(product.type)}
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isHot && <Badge variant="destructive">HOT</Badge>}
          </div>

          {/* Quick Add Button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Type Badge */}
        <div className="mb-3">
          <Badge variant="outline" className="gap-1">
            {getTypeIcon(product.type)}
            {getTypeLabel(product.type)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={product.ratingAvg} count={product.ratingCount} />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
            <Link to={`/san-pham/${product.slug}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Mua ngay
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/san-pham/${product.slug}`}>Chi tiết</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <Skeleton className="h-6 w-20 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-8 w-24 mb-4" />
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các công cụ, sách, phần mềm và gói bundle chất lượng cao
            cho ngành xây dựng
          </p>
        </div>

        {/* Product Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all" className="gap-2">
              <Package className="h-4 w-4" />
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="tool" className="gap-2">
              <Wrench className="h-4 w-4" />
              Công cụ
            </TabsTrigger>
            <TabsTrigger value="book" className="gap-2">
              <Book className="h-4 w-4" />
              Sách
            </TabsTrigger>
            <TabsTrigger value="software" className="gap-2">
              <Code className="h-4 w-4" />
              Phần mềm
            </TabsTrigger>
            <TabsTrigger value="bundle" className="gap-2">
              <Zap className="h-4 w-4" />
              Bundle
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredProducts.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Show More Button */}
            {!loading && filteredProducts.length > 6 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  asChild
                >
                  <Link to="/marketplace">
                    Xem tất cả sản phẩm ({filteredProducts.length})
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Special Offers Banner */}
        <div className="mt-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-8 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Ưu Đãi Đặc Biệt</h3>
            <p className="text-lg mb-6 text-white/90">
              Mua 2 sản phẩm bất kỳ và nhận ngay voucher 500K cho lần mua tiếp
              theo
            </p>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
            >
              Khám phá ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
