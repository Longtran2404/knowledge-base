/**
 * HomePage - Ultra Modern Dark Design with New Components
 * Sử dụng BlurText, FluidGlass, Counter, và ThreadsBackground
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
  Code,
  Layers,
  Box,
} from "lucide-react";
import { BlurText, BlurTextWords } from "../components/ui/blur-text";
import { FluidGlass, FluidGlassCard } from "../components/ui/fluid-glass";
import { Counter, AnimatedCounter } from "../components/ui/counter";
// import { ThreadsBackgroundStatic } from "../components/ui/threads-background"; // Removed - using GalaxyBackground globally
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HomePage() {
  // Hero stats with animations
  const heroStats = [
    {
      value: 50000,
      suffix: '+',
      label: 'Học viên',
      icon: <Users className="h-5 w-5" />,
    },
    {
      value: 500,
      suffix: '+',
      label: 'Khóa học',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      value: 95,
      suffix: '%',
      label: 'Hài lòng',
      icon: <Award className="h-5 w-5" />,
    },
    {
      value: 4.9,
      suffix: '★',
      decimals: 1,
      label: 'Đánh giá',
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  // Features data
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Khóa học chất lượng',
      description: 'Hàng trăm khóa học BIM, AutoCAD được thiết kế bởi các chuyên gia hàng đầu',
      badge: 'Popular',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Cộng đồng chuyên gia',
      description: 'Kết nối với 50,000+ kỹ sư, kiến trúc sư từ khắp Việt Nam',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Chứng chỉ uy tín',
      description: 'Cấp chứng chỉ được công nhận bởi các tổ chức nghề nghiệp hàng đầu',
      badge: 'Verified',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Thực hành thực tế',
      description: 'Áp dụng ngay với các dự án và case study thực tế',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Cập nhật xu hướng',
      description: 'Luôn cập nhật công nghệ mới nhất trong xây dựng và BIM',
      badge: 'New',
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc',
    },
  ];

  // Achievement stats
  const achievementStats = [
    {
      value: 10,
      suffix: '+',
      label: 'Năm kinh nghiệm',
      icon: <Clock className="h-6 w-6" />,
    },
    {
      value: 1000,
      suffix: '+',
      label: 'Dự án thực tế',
      icon: <Target className="h-6 w-6" />,
    },
    {
      value: 150,
      suffix: '+',
      label: 'Giảng viên',
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      value: 98,
      suffix: '%',
      label: 'Tỷ lệ hoàn thành',
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background is now Galaxy from reactbits.dev rendered globally in App.tsx */}

      {/* Ultra Modern Hero */}
      <section className="relative py-32 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 text-sm font-medium mb-8"
            >
              <Building2 className="h-4 w-4 text-blue-400" />
              Nền tảng giáo dục & đào tạo hàng đầu Việt Nam
            </motion.div>

            {/* Title with BlurText */}
            <div className="mb-6">
              <BlurTextWords
                text="Knowledge Base"
                className="text-6xl md:text-8xl font-bold mb-4"
                wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                variant="blur-slide"
                stagger={0.1}
              />
            </div>

            {/* Subtitle */}
            <BlurText
              text="Học tập và phát triển kỹ năng BIM, AutoCAD và công nghệ xây dựng hiện đại"
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              delay={0.5}
              variant="blur-fade"
            />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link to="/dang-nhap">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-medium text-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 justify-center"
                >
                  <Rocket className="h-5 w-5" />
                  Bắt đầu học ngay
                </motion.button>
              </Link>
              <Link to="/khoa-hoc">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
                >
                  <BookOpen className="h-5 w-5" />
                  Khám phá khóa học
                </motion.button>
              </Link>
            </motion.div>

            {/* Hero Stats with Counter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <FluidGlass variant="dark" blur="lg" className="p-6 text-center">
                    <div className="flex justify-center mb-3 text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      <Counter
                        value={stat.value}
                        suffix={stat.suffix}
                        decimals={stat.decimals || 0}
                        className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                      />
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </FluidGlass>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
            >
              <Zap className="h-4 w-4" />
              Tại sao chọn chúng tôi
            </motion.div>
            <BlurTextWords
              text="Tại sao chọn Knowledge Base?"
              className="text-4xl md:text-6xl font-bold mb-6"
              wordClassName="text-white"
              variant="blur-in"
            />
            <BlurText
              text="Cung cấp giải pháp toàn diện cho việc học tập và phát triển trong ngành xây dựng"
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FluidGlassCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  variant="dark"
                  glow
                  className="h-full"
                >
                  {feature.badge && (
                    <span className="inline-block px-3 py-1 text-xs bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400">
                      {feature.badge}
                    </span>
                  )}
                </FluidGlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Stats */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <BlurTextWords
              text="Thành tựu của chúng tôi"
              className="text-4xl md:text-6xl font-bold mb-6"
              wordClassName="text-white"
            />
            <BlurText
              text="Con số ấn tượng minh chứng cho chất lượng đào tạo"
              className="text-xl text-gray-400"
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievementStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FluidGlass variant="dark" blur="xl" glow className="p-8 text-center">
                  <div className="flex justify-center mb-4 text-blue-400">
                    {stat.icon}
                  </div>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    variant="gradient"
                  />
                  <div className="text-sm text-gray-400 mt-3">{stat.label}</div>
                </FluidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <FluidGlass variant="dark" blur="xl" glow className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="mb-6 inline-flex"
              >
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                  <Rocket className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <BlurTextWords
                text="Sẵn sàng bắt đầu hành trình học tập?"
                className="text-3xl md:text-5xl font-bold mb-6"
                wordClassName="text-white"
              />

              <BlurText
                text="Tham gia cộng đồng Knowledge Base ngay hôm nay để nâng cao kỹ năng và kết nối với các chuyên gia hàng đầu"
                className="text-xl text-gray-300 mb-8"
                delay={0.3}
              />

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/dang-nhap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Đăng ký miễn phí
                  </motion.button>
                </Link>
                <Link to="/khoa-hoc">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    Khám phá khóa học
                  </motion.button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="pt-8 border-t border-white/10">
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span>Bảo mật thông tin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                    <span>Chứng chỉ uy tín</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span>Cộng đồng 50K+</span>
                  </div>
                </div>
              </div>
            </FluidGlass>
          </div>
        </div>
      </section>
    </div>
  );
}
