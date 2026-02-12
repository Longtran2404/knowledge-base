/**
 * Enhanced Gioi Thieu Page with all new animations
 * Trang giới thiệu nâng cấp với tất cả hiệu ứng mới
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Target,
  Award,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Rocket,
  Star,
  Trophy,
  Clock,
  Code,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Counter } from '../components/ui/counter';
import { FluidGlass } from '../components/ui/fluid-glass';
// import { ThreadsBackgroundStatic } from '../components/ui/threads-background'; // Removed - using GalaxyBackground globally
import { SplashCursor } from '../components/animations/SplashCursor';
import { ScrollFloat } from '../components/animations/ScrollFloat';
import { VariableProximity } from '../components/animations/VariableProximity';
import { RotatingText } from '../components/animations/RotatingText';
import { GradualBlur, ScrollGradualBlur } from '../components/animations/GradualBlur';
import { LogoLoopMulti, LogoSVGs } from '../components/animations/LogoLoop';
import { BentoHero } from '../components/layout/MagicBento';
import { SEO } from '../components/SEO';

const rotatingWords = [
  'Đổi mới',
  'Sáng tạo',
  'Phát triển',
  'Thành công',
  'Tiên phong',
];

const partners = [
  'Autodesk',
  'Microsoft',
  'Google',
  'AWS',
  'Oracle',
  'SAP',
  'IBM',
  'Adobe',
];

const brands = [
  'Vingroup',
  'Hòa Phát',
  'Coteccons',
  'Vinaconex',
  'Hưng Thịnh',
  'Novaland',
  'FPT',
  'VNPT',
];

const achievements = [
  { value: 50000, suffix: '+', label: 'Học viên', icon: <Users className="h-6 w-6" /> },
  { value: 500, suffix: '+', label: 'Khóa học', icon: <BookOpen className="h-6 w-6" /> },
  { value: 95, suffix: '%', label: 'Thành công', icon: <Trophy className="h-6 w-6" /> },
  { value: 4.9, suffix: '★', decimals: 1, label: 'Đánh giá', icon: <Star className="h-6 w-6" /> },
];

const values = [
  {
    icon: <Target className="h-8 w-8" />,
    title: 'Sứ mệnh',
    description: 'Đưa công nghệ BIM và automation đến với mọi kỹ sư xây dựng Việt Nam',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Tầm nhìn',
    description: 'Trở thành nền tảng số 1 về giáo dục và công nghệ xây dựng tại Đông Nam Á',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Giá trị cốt lõi',
    description: 'Chất lượng, Sáng tạo, Hợp tác và Phát triển bền vững',
  },
];

export default function EnhancedGioiThieuPage() {
  return (
    <>
      <SEO
        title="Giới thiệu"
        description="Tìm hiểu về Knowledge Base - Nền tảng đào tạo trực tuyến hàng đầu Việt Nam"
        url="/gioi-thieu"
      />

      <SplashCursor>
        <div className="min-h-screen bg-black text-white relative">
          {/* Background is now Galaxy from reactbits.dev rendered globally in App.tsx */}

          {/* Hero Section with Rotating Text */}
          <section className="relative py-32 overflow-hidden">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-5xl mx-auto">
                <GradualBlur delay={0}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 text-sm font-medium mb-8"
                  >
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Về chúng tôi
                  </motion.div>
                </GradualBlur>

                <GradualBlur delay={0.2}>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Knowledge Base
                    </span>
                  </h1>
                </GradualBlur>

                <GradualBlur delay={0.4}>
                  <div className="text-3xl md:text-5xl font-bold mb-8 text-white">
                    Nền tảng{' '}
                    <RotatingText words={rotatingWords} interval={2500} className="text-4xl md:text-6xl" />
                  </div>
                </GradualBlur>

                <GradualBlur delay={0.6}>
                  <p className="text-xl md:text-2xl text-gray-400 mb-12">
                    Giáo dục & đào tạo công nghệ xây dựng hàng đầu Việt Nam
                  </p>
                </GradualBlur>

                <GradualBlur delay={0.8}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/khoa-hoc">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold text-lg shadow-2xl shadow-blue-500/50 flex items-center gap-2"
                      >
                        <Rocket className="h-5 w-5" />
                        Khám phá khóa học
                      </motion.button>
                    </Link>
                    <Link to="/contact">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        Liên hệ ngay
                        <ArrowRight className="h-5 w-5" />
                      </motion.button>
                    </Link>
                  </div>
                </GradualBlur>
              </div>
            </div>
          </section>

          {/* Achievements with Counter */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {achievements.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
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
          </section>

          {/* Variable Proximity Text Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <ScrollGradualBlur>
                <div className="max-w-5xl mx-auto">
                  <VariableProximity
                    text="Chúng tôi tin rằng giáo dục chất lượng cao nên được tiếp cận bởi mọi người. Với công nghệ hiện đại và đội ngũ giảng viên chuyên nghiệp, Knowledge Base mang đến trải nghiệm học tập tuyệt vời nhất cho học viên."
                    className="text-2xl md:text-4xl text-center leading-relaxed text-gray-300"
                    baseSize={24}
                    maxSize={40}
                    proximityRange={150}
                  />
                </div>
              </ScrollGradualBlur>
            </div>
          </section>

          {/* Bento Grid Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <ScrollGradualBlur>
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Tính năng nổi bật
                  </h2>
                  <p className="text-xl text-gray-400">
                    Khám phá những gì làm nên sự khác biệt của chúng tôi
                  </p>
                </div>
              </ScrollGradualBlur>

              <BentoHero />
            </div>
          </section>

          {/* Values with Scroll Float */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <ScrollFloat
                  text="Giá trị cốt lõi định hình tương lai"
                  className="text-4xl md:text-6xl font-bold text-white"
                  containerClassName="mb-6"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <FluidGlass variant="dark" blur="lg" className="p-8 h-full">
                      <div className="text-blue-400 mb-4">{value.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{value.description}</p>
                    </FluidGlass>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Partners & Brands Logo Loop - có padding để chữ logo không bị cắt */}
          <section className="py-20 relative w-full">
            <div className="container mx-auto px-4 mb-16">
              <ScrollGradualBlur>
                <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Đối tác & Thương hiệu
                </h2>
                <p className="text-xl text-gray-400 text-center">
                  Hợp tác cùng các công ty hàng đầu Việt Nam và thế giới
                </p>
              </ScrollGradualBlur>
            </div>

            <div className="overflow-hidden px-4 md:px-8">
            <LogoLoopMulti
              rows={[
                {
                  logos: [
                    { name: 'Autodesk', icon: <LogoSVGs.Autodesk /> },
                    { name: 'Microsoft', icon: <LogoSVGs.Microsoft /> },
                    { name: 'Google', icon: <LogoSVGs.Google /> },
                    { name: 'AWS', icon: <LogoSVGs.AWS /> },
                    { name: 'Oracle', icon: <LogoSVGs.Oracle /> },
                    { name: 'SAP', icon: <LogoSVGs.SAP /> },
                    { name: 'IBM', icon: <LogoSVGs.IBM /> },
                    { name: 'Adobe', icon: <LogoSVGs.Adobe /> },
                  ],
                  speed: 25,
                  direction: 'left',
                },
                {
                  logos: [
                    { name: 'Vingroup', icon: <LogoSVGs.Vingroup /> },
                    { name: 'Hòa Phát', icon: <LogoSVGs.HoaPhat /> },
                    { name: 'Coteccons', icon: <LogoSVGs.Coteccons /> },
                    { name: 'Vinaconex', icon: <LogoSVGs.Vinaconex /> },
                    { name: 'Hưng Thịnh', icon: <LogoSVGs.HungThinh /> },
                    { name: 'Novaland', icon: <LogoSVGs.Novaland /> },
                    { name: 'FPT', icon: <LogoSVGs.FPT /> },
                    { name: 'VNPT', icon: <LogoSVGs.VNPT /> },
                  ],
                  speed: 30,
                  direction: 'right',
                },
              ]}
            />
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/20 to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
              <ScrollGradualBlur>
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Sẵn sàng bắt đầu hành trình?
                  </h2>
                  <p className="text-xl text-gray-400 mb-12">
                    Tham gia cùng 50,000+ học viên đang học tập và phát triển kỹ năng
                  </p>

                  <Link to="/dang-nhap">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 60px rgba(59, 130, 246, 0.8)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-5 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold text-xl shadow-2xl shadow-blue-500/50 inline-flex items-center gap-3"
                    >
                      <Rocket className="h-6 w-6" />
                      Đăng ký miễn phí ngay
                    </motion.button>
                  </Link>
                </div>
              </ScrollGradualBlur>
            </div>
          </section>
        </div>
      </SplashCursor>
    </>
  );
}
