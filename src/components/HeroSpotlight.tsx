import React from "react";
import { Button } from "../components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { SpotlightItem } from "../lib/spotlight";

interface HeroSpotlightProps {
  spotlightItem: SpotlightItem;
}

const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ spotlightItem }) => {
  const getGradientByType = (type: string) => {
    switch (type) {
      case "course":
        return "from-blue-600 via-blue-700 to-indigo-800";
      case "product":
        return "from-green-600 via-emerald-700 to-teal-800";
      case "collaboration":
        return "from-purple-600 via-violet-700 to-indigo-800";
      default:
        return "from-blue-600 via-blue-700 to-indigo-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "course":
        return "Khóa học";
      case "product":
        return "Sản phẩm";
      case "collaboration":
        return "Hợp tác";
      default:
        return "Nổi bật";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return <Star className="w-4 h-4" />;
      case "product":
        return <TrendingUp className="w-4 h-4" />;
      case "collaboration":
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${getGradientByType(
        spotlightItem.type
      )} min-h-[600px]`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm mb-6">
              {getTypeIcon(spotlightItem.type)}
              <span className="text-sm font-semibold">
                {getTypeLabel(spotlightItem.type)}
              </span>
              {spotlightItem.pinned && (
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  GHIM
                </span>
              )}
              {spotlightItem.isHot && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  HOT
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {spotlightItem.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              {spotlightItem.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105"
              >
                {spotlightItem.buttonText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-full transition-all"
              >
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Stats or Additional Info */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">1000+</div>
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

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Visual Card */}
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                {/* Placeholder for actual image */}
                <div className="aspect-square bg-white/20 rounded-2xl mb-6 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🏗️</div>
                </div>

                {/* Card Content */}
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Nền tảng giáo dục xây dựng hàng đầu
                  </p>

                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/30 rounded-full text-xs font-medium">
                      Thực hành
                    </span>
                    <span className="px-3 py-1 bg-green-500/30 rounded-full text-xs font-medium">
                      Chất lượng
                    </span>
                    <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-medium">
                      Hiện đại
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center transform rotate-12 shadow-xl">
                <span className="text-2xl font-bold text-gray-900">NEW</span>
              </div>

              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">4.9</div>
                  <div className="text-xs text-gray-600">★★★★★</div>
                </div>
              </div>
            </div>
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
};

export default HeroSpotlight;
