/**
 * Interactive Showcase Component
 * Hiển thị các tính năng ấn tượng với animations và micro-interactions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Award,
  Globe,
  Layers,
  Code,
  Database,
  Lock,
  Rocket,
} from 'lucide-react';
import { FluidGlass } from '../ui/fluid-glass';
import { Counter } from '../ui/counter';

interface ShowcaseFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stat?: {
    value: number;
    suffix: string;
    label: string;
  };
  color: string;
  gradient: string;
}

const showcaseFeatures: ShowcaseFeature[] = [
  {
    id: 'ai-powered',
    icon: <Sparkles className="h-8 w-8" />,
    title: 'AI-Powered Learning',
    description: 'Hệ thống AI thông minh tự động đề xuất khóa học phù hợp với từng học viên',
    stat: { value: 98, suffix: '%', label: 'Độ chính xác' },
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'real-time',
    icon: <Zap className="h-8 w-8" />,
    title: 'Real-time Collaboration',
    description: 'Cộng tác trực tuyến với giảng viên và bạn học theo thời gian thực',
    stat: { value: 50000, suffix: '+', label: 'Người dùng online' },
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    id: 'secure',
    icon: <Shield className="h-8 w-8" />,
    title: 'Enterprise Security',
    description: 'Bảo mật cấp doanh nghiệp với mã hóa đầu cuối và xác thực 2 lớp',
    stat: { value: 100, suffix: '%', label: 'Bảo mật' },
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'community',
    icon: <Users className="h-8 w-8" />,
    title: 'Active Community',
    description: 'Cộng đồng 50,000+ kỹ sư, kiến trúc sư và chuyên gia hàng đầu',
    stat: { value: 50000, suffix: '+', label: 'Thành viên' },
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'analytics',
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Advanced Analytics',
    description: 'Theo dõi tiến độ học tập với dashboard phân tích chuyên sâu',
    stat: { value: 95, suffix: '%', label: 'Hoàn thành' },
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    id: 'certified',
    icon: <Award className="h-8 w-8" />,
    title: 'Certified Programs',
    description: 'Chứng chỉ được công nhận bởi các tổ chức quốc tế hàng đầu',
    stat: { value: 500, suffix: '+', label: 'Chứng chỉ' },
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
];

export function InteractiveShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <Rocket className="h-4 w-4" />
            Công nghệ tiên tiến
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Nền tảng học tập thế hệ mới
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tích hợp công nghệ AI, Real-time và bảo mật cấp doanh nghiệp
          </p>
        </motion.div>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {showcaseFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
              className="cursor-pointer"
            >
              <FluidGlass
                variant="dark"
                blur="lg"
                className={`p-6 h-full transition-all duration-300 ${
                  hoveredFeature === feature.id || selectedFeature === feature.id
                    ? `bg-gradient-to-br ${feature.gradient} border-${feature.color.split('-')[1]}-500/50 shadow-lg shadow-${feature.color.split('-')[1]}-500/20`
                    : ''
                }`}
              >
                <motion.div
                  animate={{
                    scale: hoveredFeature === feature.id ? 1.1 : 1,
                    rotate: hoveredFeature === feature.id ? 5 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`${feature.color} mb-4`}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-bold mb-2 text-white">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {feature.stat && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: selectedFeature === feature.id ? 1 : 0.7,
                      scale: selectedFeature === feature.id ? 1 : 0.9,
                    }}
                    className="flex items-center gap-3 pt-4 border-t border-white/10"
                  >
                    <div className="text-3xl font-bold">
                      <Counter
                        value={feature.stat.value}
                        suffix={feature.stat.suffix}
                        className={feature.color}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {feature.stat.label}
                    </div>
                  </motion.div>
                )}

                {/* Selection Indicator */}
                <AnimatePresence>
                  {selectedFeature === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className={`absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-r ${feature.gradient}`}
                    />
                  )}
                </AnimatePresence>
              </FluidGlass>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <FluidGlass variant="dark" blur="xl" className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <TechBadge icon={<Code />} label="React + TypeScript" color="blue" />
              <TechBadge icon={<Database />} label="Supabase" color="green" />
              <TechBadge icon={<Lock />} label="JWT Auth" color="purple" />
              <TechBadge icon={<Layers />} label="Framer Motion" color="pink" />
            </div>
          </FluidGlass>
        </motion.div>
      </div>
    </div>
  );
}

function TechBadge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex flex-col items-center gap-3 group"
    >
      <div className={`text-${color}-400 group-hover:text-${color}-300 transition-colors`}>
        {icon}
      </div>
      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
        {label}
      </span>
    </motion.div>
  );
}
