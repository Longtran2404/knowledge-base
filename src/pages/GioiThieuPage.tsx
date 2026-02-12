import React from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Target, Award, Globe, Zap, CheckCircle, ArrowRight, Rocket, Star, Trophy, Clock } from "lucide-react";
import { BlurText, BlurTextWords } from "../components/ui/blur-text";
import { FluidGlass, FluidGlassCard } from "../components/ui/fluid-glass";
import { Counter } from "../components/ui/counter";
import { motion } from "framer-motion";

const values = [
  {
    icon: <Target className="h-8 w-8" />,
    title: "Sứ mệnh",
    description: "Đưa công nghệ BIM và automation đến với mọi kỹ sư xây dựng Việt Nam"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Tầm nhìn",
    description: "Trở thành nền tảng số 1 về giáo dục và công nghệ xây dựng tại Đông Nam Á"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Giá trị cốt lõi",
    description: "Chất lượng, Sáng tạo, Hợp tác và Phát triển bền vững"
  }
];

const milestones = [
  {
    year: "2020",
    title: "Thành lập",
    description: "Knowledge Base được thành lập với mục tiêu đổi mới giáo dục xây dựng"
  },
  {
    year: "2021",
    title: "Khóa học đầu tiên",
    description: "Ra mắt khóa học BIM cơ bản với 100+ học viên đầu tiên"
  },
  {
    year: "2022",
    title: "Mở rộng",
    description: "Phát triển 50+ khóa học và đạt 10,000+ học viên"
  },
  {
    year: "2023",
    title: "Công nghệ",
    description: "Ra mắt nền tảng e-learning và công cụ automation"
  },
  {
    year: "2024",
    title: "Tương lai",
    description: "Mục tiêu 100,000+ học viên và mở rộng ra Đông Nam Á"
  }
];

const achievements = [
  { value: 50000, suffix: "+", label: "Học viên", icon: <Users className="h-6 w-6" /> },
  { value: 200, suffix: "+", label: "Khóa học", icon: <Building2 className="h-6 w-6" /> },
  { value: 95, suffix: "%", label: "Tỷ lệ thành công", icon: <Trophy className="h-6 w-6" /> },
  { value: 4.9, suffix: "★", decimals: 1, label: "Đánh giá", icon: <Star className="h-6 w-6" /> },
];

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 text-sm font-medium mb-8"
            >
              <Building2 className="h-4 w-4 text-blue-400" />
              Về chúng tôi
            </motion.div>

            <BlurTextWords
              text="Knowledge Base"
              className="text-5xl md:text-7xl font-bold mb-6"
              wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              variant="blur-slide"
            />

            <BlurText
              text="Nền tảng giáo dục & đào tạo công nghệ xây dựng hàng đầu Việt Nam"
              className="text-xl md:text-2xl text-gray-400 mb-8"
              delay={0.3}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/khoa-hoc">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                  <Rocket className="h-5 w-5" />
                  Khám phá khóa học
                </motion.button>
              </Link>
              <Link to="/hop-tac">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Users className="h-5 w-5" />
                  Hợp tác với chúng tôi
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
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
                <FluidGlass variant="dark" blur="lg" glow className="p-6 text-center">
                  <div className="flex justify-center mb-3 text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">
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

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <BlurTextWords
              text="Giá trị cốt lõi"
              className="text-4xl md:text-6xl font-bold mb-6"
              wordClassName="text-white"
            />
            <BlurText
              text="Những giá trị định hướng mọi hoạt động của chúng tôi"
              className="text-xl text-gray-400"
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FluidGlassCard
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                  variant="dark"
                  glow
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <BlurTextWords
              text="Hành trình phát triển"
              className="text-4xl md:text-6xl font-bold mb-6"
              wordClassName="text-white"
            />
            <BlurText
              text="Từ những bước đi đầu tiên đến hiện tại"
              className="text-xl text-gray-400"
              delay={0.2}
            />
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 last:mb-0"
              >
                <FluidGlass variant="dark" blur="lg" className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white font-bold text-lg">{milestone.year}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                </FluidGlass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FluidGlass variant="dark" blur="xl" glow className="max-w-4xl mx-auto p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <BlurTextWords
              text="Sẵn sàng bắt đầu?"
              className="text-3xl md:text-5xl font-bold mb-6"
              wordClassName="text-white"
            />

            <BlurText
              text="Tham gia cộng đồng Knowledge Base ngay hôm nay"
              className="text-xl text-gray-300 mb-8"
              delay={0.3}
            />

            <Link to="/dang-nhap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-medium shadow-lg shadow-blue-500/30 inline-flex items-center gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                Đăng ký ngay
              </motion.button>
            </Link>
          </FluidGlass>
        </div>
      </section>
    </div>
  );
}
