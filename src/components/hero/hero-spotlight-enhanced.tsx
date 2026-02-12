
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import { ArrowRight, Star, TrendingUp, Users, Sparkles, Play, BookOpen, ShoppingBag, Briefcase, FileText, Zap, Award, Target, Clock } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Progress } from "../../components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../components/ui/hover-card";

import { SpotlightItem } from "../../types/spotlight";
import { pickSpotlight } from "../../lib/spotlight";

interface HeroSpotlightEnhancedProps {
  className?: string;
}

export default function HeroSpotlightEnhanced({ className }: HeroSpotlightEnhancedProps) {
  const [spotlight, setSpotlight] = useState<SpotlightItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        setLoading(true);
        // Animate progress bar
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const response = await fetch("/api/spotlight");
        if (!response.ok) {
          throw new Error("Failed to fetch spotlight data");
        }
        
        const data: SpotlightItem[] = await response.json();
        const selectedSpotlight = pickSpotlight(data);
        setSpotlight(selectedSpotlight);
        setProgress(100);
        
        setTimeout(() => setIsVisible(true), 300);
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
        return <BookOpen className="h-5 w-5" />;
      case "product":
        return <ShoppingBag className="h-5 w-5" />;
      case "collab":
        return <Briefcase className="h-5 w-5" />;
      case "post":
        return <FileText className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getRefTypeColor = (refType: string) => {
    switch (refType) {
      case "course":
        return "from-blue-600 to-cyan-600";
      case "product":
        return "from-emerald-600 to-teal-600";
      case "collab":
        return "from-purple-600 to-violet-600";
      case "post":
        return "from-orange-600 to-amber-600";
      default:
        return "from-blue-600 to-indigo-600";
    }
  };

  const getRefTypeLink = (item: SpotlightItem) => {
    const baseLinks = {
      course: "/khoa-hoc",
      product: "/san-pham",
      collab: "/hop-tac",
      post: "/blog"
    };
    return `${baseLinks[item.refType]}/${item.id}`;
  };

  const stats = [
    { label: "Học viên", value: "50K+", icon: Users, color: "text-blue-600" },
    { label: "Khóa học", value: "200+", icon: BookOpen, color: "text-green-600" },
    { label: "Đánh giá", value: "4.9★", icon: Star, color: "text-yellow-600" },
    { label: "Chứng chỉ", value: "15K+", icon: Award, color: "text-purple-600" }
  ];

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <Skeleton className="h-16 w-3/4 mx-auto bg-white/10" />
            <Skeleton className="h-6 w-1/2 mx-auto bg-white/10" />
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
                <span>Đang tải...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-purple-400/10 rounded-full animate-pulse delay-700" />
      </section>
    );
  }

  if (error || !spotlight) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Không thể tải nội dung spotlight</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={heroRef}
      className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden ${className}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      {/* Floating Elements with Enhanced Animation */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float" />
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-float delay-300" />
      <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full animate-float delay-700" />
      <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full animate-float delay-500" />

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <Badge variant="outline" className="border-blue-400/50 text-blue-200 bg-blue-950/50 backdrop-blur-sm">
                  {getRefTypeIcon(spotlight.refType)}
                  <span className="ml-1 capitalize">{spotlight.refType}</span>
                </Badge>
                {spotlight.isHot && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    HOT
                  </Badge>
                )}
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Khóa học BIM Automation
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  cho Kỹ sư XDDD
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Học tư duy workflow + tool tự động hóa thiết kế xây dựng. 
                Làm chủ công nghệ BIM, Revit, AutoCAD và các phần mềm thiết kế hiện đại.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <HoverCard key={index}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer hover:bg-white/20 transition-all group">
                          <IconComponent className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                          <span className="font-bold text-white">{stat.value}</span>
                          <span className="text-blue-200 text-sm">{stat.label}</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <p className="text-sm">
                          <strong>{stat.value}</strong> {stat.label} đã tin tưởng Knowledge Base
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${getRefTypeColor(spotlight.refType)} hover:shadow-2xl hover:shadow-blue-500/25 text-white font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all group`}
                asChild
              >
                <Link to={getRefTypeLink(spotlight)}>
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Khám phá ngay
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-4 rounded-full transition-all backdrop-blur-sm group"
                asChild
              >
                <Link to="/gioi-thieu">
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Xem demo
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center justify-center lg:justify-start gap-4 text-blue-200">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Được chứng nhận</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Cam kết chất lượng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all group overflow-hidden">
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative h-80 bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  
                  {/* Placeholder with Enhanced Styling */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl opacity-30 group-hover:scale-110 transition-transform">
                      {spotlight.refType === 'course' ? '🎓' : 
                       spotlight.refType === 'product' ? '🛍️' : 
                       spotlight.refType === 'collab' ? '🤝' : '📝'}
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 z-20">
                    {spotlight.pinned && (
                      <Badge className="bg-yellow-500/90 text-yellow-900 mb-2">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Nổi bật
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {new Date().toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {spotlight.title}
                      </h3>
                      <p className="text-blue-200 text-sm line-clamp-2">
                        {spotlight.subtitle || "Khám phá ngay để biết thêm chi tiết"}
                      </p>
                    </div>
                    {getRefTypeIcon(spotlight.refType)}
                  </div>

                  {/* Progress or Rating */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-200">Độ phổ biến</span>
                      <span className="text-white font-semibold">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  {/* CTA */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-500" asChild>
                    <Link to={getRefTypeLink(spotlight)}>
                      Tìm hiểu thêm
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
