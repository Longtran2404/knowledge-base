
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";

import { SpotlightItem } from "../../types/spotlight";
import { pickSpotlight } from "../../lib/spotlight";

interface HeroSpotlightProps {
  className?: string;
}

export default function HeroSpotlight({ className }: HeroSpotlightProps) {
  const [spotlight, setSpotlight] = useState<SpotlightItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/spotlight");
        if (!response.ok) {
          throw new Error("Failed to fetch spotlight data");
        }
        
        const data: SpotlightItem[] = await response.json();
        const selectedSpotlight = pickSpotlight(data);
        setSpotlight(selectedSpotlight);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlight();
  }, []);

  const getRefTypeIcon = (refType: string) => {
    switch (refType) {
      case "course":
        return <Star className="h-4 w-4" />;
      case "product":
        return <TrendingUp className="h-4 w-4" />;
      case "collab":
        return <Users className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getRefTypeLabel = (refType: string) => {
    switch (refType) {
      case "course":
        return "Khóa học";
      case "product":
        return "Sản phẩm";
      case "collab":
        return "Hợp tác";
      case "post":
        return "Bài viết";
      default:
        return "Nổi bật";
    }
  };

  const getGradientByType = (refType: string) => {
    switch (refType) {
      case "course":
        return "from-blue-600 via-blue-700 to-indigo-800";
      case "product":
        return "from-green-600 via-emerald-700 to-teal-800";
      case "collab":
        return "from-purple-600 via-violet-700 to-indigo-800";
      case "post":
        return "from-orange-600 via-red-700 to-pink-800";
      default:
        return "from-blue-600 via-blue-700 to-indigo-800";
    }
  };

  if (loading) {
    return (
      <section className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 ${className}`}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-8 w-32 bg-white/20" />
              <Skeleton className="h-16 w-full bg-white/20" />
              <Skeleton className="h-24 w-full bg-white/20" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 bg-white/20" />
                <Skeleton className="h-12 w-32 bg-white/20" />
              </div>
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-80 w-80 rounded-2xl bg-white/20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !spotlight) {
    return (
      <section className={`relative overflow-hidden bg-gradient-to-br from-gray-600 via-gray-700 to-slate-800 ${className}`}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Knowledge Base
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Nền tảng giáo dục và thương mại hàng đầu cho ngành xây dựng Việt Nam
            </p>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link to="/khoa-hoc">
                Khám phá khóa học
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${getGradientByType(spotlight.refType)} ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {getRefTypeIcon(spotlight.refType)}
                <span className="ml-1">{getRefTypeLabel(spotlight.refType)}</span>
              </Badge>
              {spotlight.pinned && (
                <Badge variant="destructive" className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600">
                  GHIM
                </Badge>
              )}
              {spotlight.isHot && (
                <Badge variant="destructive">
                  HOT
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {spotlight.title}
            </h1>

            {/* Subtitle */}
            {spotlight.subtitle && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                {spotlight.subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105"
                asChild
              >
                <Link to={spotlight.ctaHref || "#"}>
                  {spotlight.ctaLabel || "Tìm hiểu thêm"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-full transition-all"
                asChild
              >
                <Link to="/khoa-hoc">
                  Xem tất cả khóa học
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-white/80">Khóa học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-sm text-white/80">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="flex justify-center lg:justify-end">
            <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-8">
                {/* Image Placeholder or Actual Image */}
                <div className="aspect-square bg-white/20 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                  {spotlight.image ? (
                    <img
                      src={spotlight.image}
                      alt={spotlight.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-6xl opacity-50">
                      {spotlight.refType === "course" && "📚"}
                      {spotlight.refType === "product" && "🛍️"}
                      {spotlight.refType === "collab" && "🤝"}
                      {spotlight.refType === "post" && "📰"}
                    </div>
                  )}
                </div>
                
                {/* Card Info */}
                <div className="text-white space-y-4">
                  <h3 className="text-xl font-bold">Knowledge Base</h3>
                  <p className="text-white/80 text-sm">
                    Nền tảng giáo dục xây dựng hàng đầu
                  </p>
                  
                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-500/30 text-white border-blue-400/30">
                      Thực hành
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/30 text-white border-green-400/30">
                      Chất lượng
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/30 text-white border-purple-400/30">
                      Hiện đại
                    </Badge>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center transform rotate-12 shadow-xl">
                  <span className="text-sm font-bold text-gray-900">NEW</span>
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-900">4.9</div>
                    <div className="text-[8px] text-gray-600">★★★★★</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
