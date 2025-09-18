import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Target,
  Globe,
  BookOpen,
  Zap,
  Play,
  Clock,
  Trophy,
  ArrowRight,
  Home,
  Star,
  CheckCircle,
  Rocket,
  GraduationCap,
} from "lucide-react";
import { LiquidGlassButton } from "../components/ui/liquid-glass-button";
import { LiquidGlassCard } from "../components/ui/liquid-glass-card";
import { Badge } from "../components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section
        data-tour="hero-section"
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white"
      >
        {/* Enhanced background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-fade-in-down">
              <Badge
                variant="secondary"
                className="mb-8 bg-white/10 text-white border-white/20 backdrop-blur-sm text-sm px-6 py-3 rounded-full glass-strong animate-pulse-glow"
              >
                🚀 Nền tảng BIM & Xây dựng số 1 Việt Nam
              </Badge>
            </div>

            <div className="animate-fade-in-up animation-delay-200">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight gradient-text text-shadow-lg">
                Nam Long Center
              </h1>
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed">
                Nền tảng giáo dục và thương mại toàn diện cho ngành xây dựng.
                <br className="hidden md:block" />
                Kết nối{" "}
                <span className="font-bold text-yellow-200 animate-pulse-slow">
                  10,000+
                </span>{" "}
                kỹ sư, chuyên gia và doanh nghiệp.
              </p>
            </div>

            <div className="animate-fade-in-up animation-delay-600">
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link to="/auth">
                  <LiquidGlassButton
                    size="xl"
                    variant="primary"
                    glow={true}
                    className="text-lg px-10 py-5 font-bold"
                  >
                    <Rocket className="mr-3 h-6 w-6" />
                    Bắt đầu học ngay
                  </LiquidGlassButton>
                </Link>
                <Link to="/khoa-hoc">
                  <LiquidGlassButton
                    size="xl"
                    variant="secondary"
                    className="text-lg px-10 py-5 font-semibold text-white"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Khám phá khóa học
                  </LiquidGlassButton>
                </Link>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="animate-fade-in-up animation-delay-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    10K+
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
                    Học viên
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    500+
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
                    Khóa học
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    1K+
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
                    Tài liệu
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    95%
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
                    Hài lòng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-blue-100 text-blue-600 border-blue-200 px-4 py-2 rounded-full">
                ✨ Tính năng nổi bật
              </Badge>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 gradient-text">
                Tại sao chọn Nam Long Center?
              </h2>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Chúng tôi cung cấp giải pháp toàn diện cho việc học tập, kết nối
                và phát triển trong ngành xây dựng với công nghệ tiên tiến nhất
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="animate-fade-in-up animation-delay-200">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <GraduationCap className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Đào tạo chuyên sâu
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Khóa học BIM, Automation và công nghệ xây dựng hiện đại với
                  chứng chỉ được công nhận quốc tế
                </p>
              </LiquidGlassCard>
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <Users className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Cộng đồng chuyên gia
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kết nối với 10,000+ kỹ sư, chuyên gia và doanh nghiệp trong
                  ngành xây dựng hàng đầu
                </p>
              </LiquidGlassCard>
            </div>

            <div className="animate-fade-in-up animation-delay-600">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <Zap className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Công nghệ tiên tiến
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sử dụng AI, Machine Learning và công nghệ mới nhất để tối ưu
                  hóa quy trình xây dựng
                </p>
              </LiquidGlassCard>
            </div>

            <div className="animate-fade-in-up animation-delay-800">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <Target className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Giải pháp thực tế
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Áp dụng kiến thức vào các dự án thực tế với case studies từ
                  các công ty hàng đầu
                </p>
              </LiquidGlassCard>
            </div>

            <div className="animate-fade-in-up animation-delay-1000">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <Globe className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Tiếp cận toàn cầu
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Học từ các chuyên gia quốc tế và cập nhật xu hướng công nghệ
                  xây dựng toàn cầu
                </p>
              </LiquidGlassCard>
            </div>

            <div className="animate-fade-in-up animation-delay-1200">
              <LiquidGlassCard variant="interactive" hover={true} className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <Trophy className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Chứng nhận uy tín
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Chứng chỉ được công nhận bởi các tổ chức giáo dục và hiệp
                  hội ngành xây dựng
                </p>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-2 rounded-full glass">
                📊 Thống kê ấn tượng
              </Badge>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
                Con số biết nói
              </h2>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Những con số ấn tượng phản ánh sự tin tưởng và thành công của
                cộng đồng Nam Long Center
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up animation-delay-200 group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow">
                10,000+
              </div>
              <div className="text-white/80 text-lg">Kỹ sư & Chuyên gia</div>
            </div>
            <div className="animate-fade-in-up animation-delay-400 group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow">
                500+
              </div>
              <div className="text-white/80 text-lg">Khóa học</div>
            </div>
            <div className="animate-fade-in-up animation-delay-600 group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow">
                50+
              </div>
              <div className="text-white/80 text-lg">Đối tác doanh nghiệp</div>
            </div>
            <div className="animate-fade-in-up animation-delay-800 group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow">
                95%
              </div>
              <div className="text-white/80 text-lg">Tỷ lệ hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section-padding bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <Badge className="mb-8 bg-green-100 text-green-600 border-green-200 px-4 py-2 rounded-full">
                🚀 Bắt đầu ngay hôm nay
              </Badge>
            </div>

            <div className="animate-fade-in-up animation-delay-200">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 gradient-text">
                Sẵn sàng bắt đầu hành trình?
              </h2>
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Tham gia cộng đồng Nam Long Center ngay hôm nay để nâng cao kỹ
                năng và kết nối với các chuyên gia hàng đầu trong ngành xây dựng
              </p>
            </div>

            <div className="animate-fade-in-up animation-delay-600">
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/auth">
                  <LiquidGlassButton
                    size="xl"
                    variant="gradient"
                    glow={true}
                    className="px-10 py-5 font-bold"
                  >
                    <Star className="mr-3 h-6 w-6" />
                    Đăng ký miễn phí
                  </LiquidGlassButton>
                </Link>
                <Link to="/khoa-hoc">
                  <LiquidGlassButton
                    size="xl"
                    variant="secondary"
                    className="px-10 py-5 font-semibold"
                  >
                    <BookOpen className="mr-3 h-6 w-6" />
                    Xem khóa học
                  </LiquidGlassButton>
                </Link>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in-up animation-delay-800 mt-16">
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Miễn phí đăng ký</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Chứng chỉ uy tín</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Cộng đồng mạnh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
