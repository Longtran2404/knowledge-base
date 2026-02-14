/**
 * HomePage - Giao diện trắng + xanh, ít hiệu ứng, thân thiện
 */

import React from "react";
import {
  Building2,
  Users,
  BookOpen,
  Sparkles,
  Rocket,
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const heroStats = [
    { value: "50,000+", label: "Học viên", icon: Users },
    { value: "500+", label: "Khóa học", icon: BookOpen },
    { value: "95%", label: "Hài lòng", icon: Award },
    { value: "4.9★", label: "Đánh giá", icon: Sparkles },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Khóa học chất lượng",
      description: "Hàng trăm khóa học BIM, AutoCAD được thiết kế bởi các chuyên gia hàng đầu",
      badge: "Popular",
    },
    {
      icon: Users,
      title: "Cộng đồng chuyên gia",
      description: "Kết nối với 50,000+ kỹ sư, kiến trúc sư từ khắp Việt Nam",
    },
    {
      icon: Award,
      title: "Chứng chỉ uy tín",
      description: "Cấp chứng chỉ được công nhận bởi các tổ chức nghề nghiệp hàng đầu",
      badge: "Verified",
    },
    {
      icon: Target,
      title: "Thực hành thực tế",
      description: "Áp dụng ngay với các dự án và case study thực tế",
    },
    {
      icon: Globe,
      title: "Cập nhật xu hướng",
      description: "Luôn cập nhật công nghệ mới nhất trong xây dựng và BIM",
      badge: "New",
    },
    {
      icon: CheckCircle,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc",
    },
  ];

  const achievementStats = [
    { value: "10+", label: "Năm kinh nghiệm", icon: Clock },
    { value: "1000+", label: "Dự án thực tế", icon: Target },
    { value: "150+", label: "Giảng viên", icon: GraduationCap },
    { value: "98%", label: "Tỷ lệ hoàn thành", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Building2 className="h-4 w-4" />
              Nền tảng giáo dục & đào tạo hàng đầu Việt Nam
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Knowledge Base
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Nền tảng Phát triển
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Giáo dục & đào tạo công nghệ xây dựng hàng đầu Việt Nam
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link
                to="/khoa-hoc"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-lg shadow-md hover:opacity-95 transition-opacity"
              >
                <Rocket className="h-5 w-5" />
                Khám phá khóa học
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary text-primary font-medium text-lg hover:bg-primary/5 transition-colors"
              >
                Liên hệ ngay →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {heroStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl card-elevated text-center"
                  >
                    <div className="flex justify-center mb-2 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Tại sao chọn chúng tôi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tại sao chọn Knowledge Base?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cung cấp giải pháp toàn diện cho việc học tập và phát triển trong ngành xây dựng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl card-elevated"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        {feature.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/15 text-primary border border-primary/20">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievement Stats */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Thành tựu của chúng tôi
            </h2>
            <p className="text-muted-foreground">
              Con số ấn tượng minh chứng cho chất lượng đào tạo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievementStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl card-elevated text-center"
                >
                  <div className="flex justify-center mb-3 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-2xl card-elevated">
            <div className="inline-flex p-4 rounded-xl bg-primary/10 text-primary mb-6">
              <Rocket className="h-10 w-10" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-muted-foreground mb-8">
              Tham gia cộng đồng Knowledge Base ngay hôm nay để nâng cao kỹ năng và kết nối với các chuyên gia hàng đầu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/dang-nhap"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:opacity-95 transition-opacity"
              >
                <Sparkles className="h-5 w-5" />
                Đăng ký miễn phí
              </Link>
              <Link
                to="/khoa-hoc"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Khám phá khóa học
              </Link>
            </div>
            <div className="pt-6 border-t border-border flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Bảo mật thông tin
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Chứng chỉ uy tín
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Cộng đồng 50K+
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
