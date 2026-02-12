/**
 * Showcase Page
 * Trang tổng hợp tất cả các components và features ấn tượng nhất
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ParticleHero } from '../components/showcase/ParticleHero';
import { InteractiveShowcase } from '../components/showcase/InteractiveShowcase';
import { AnimatedDashboard } from '../components/showcase/AnimatedDashboard';
import { Card3D, Course3DCard, Feature3DCard, Stat3DCard } from '../components/showcase/Card3D';
import { MicroInteractionsDemo } from '../components/showcase/MicroInteractions';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Code,
  Zap,
  Shield,
} from 'lucide-react';
import { SEO } from '../components/SEO';

export default function ShowcasePage() {
  return (
    <>
      <SEO
        title="Showcase - Công nghệ hiện đại"
        description="Khám phá các công nghệ và tính năng hiện đại nhất của Knowledge Base"
        keywords={['showcase', 'công nghệ', 'hiện đại', 'tính năng']}
        url="/showcase"
      />

      <div className="bg-black text-white min-h-screen">
        {/* Particle Hero */}
        <ParticleHero />

        {/* Interactive Features Showcase */}
        <InteractiveShowcase />

        {/* 3D Cards Showcase */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                3D Card Effects
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Hover để trải nghiệm hiệu ứng 3D parallax cực kỳ mượt mà
              </p>
            </motion.div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Course3DCard
                  title="BIM Architecture Pro"
                  description="Khóa học BIM chuyên sâu cho kiến trúc sư với Revit Architecture"
                  image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop"
                  level="Advanced"
                  students={15234}
                  rating={4.9}
                  price="2.999.000đ"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Course3DCard
                  title="AutoCAD Complete"
                  description="Từ cơ bản đến nâng cao, làm chủ AutoCAD trong 8 tuần"
                  image="https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=800&h=600&fit=crop"
                  level="Intermediate"
                  students={23456}
                  rating={4.8}
                  price="1.999.000đ"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Course3DCard
                  title="3D Visualization Master"
                  description="Tạo render 3D photorealistic với V-Ray và Lumion"
                  image="https://images.unsplash.com/photo-1618842437879-d0ca6506e7b6?w=800&h=600&fit=crop"
                  level="Advanced"
                  students={18765}
                  rating={4.9}
                  price="3.499.000đ"
                />
              </motion.div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Feature3DCard
                  icon={<Code className="h-8 w-8" />}
                  title="Modern Tech Stack"
                  description="React, TypeScript, Framer Motion và các công nghệ hiện đại nhất"
                  color="rgba(59, 130, 246, 0.5)"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Feature3DCard
                  icon={<Zap className="h-8 w-8" />}
                  title="Lightning Fast"
                  description="Tối ưu hóa hiệu suất với lazy loading và code splitting"
                  color="rgba(234, 179, 8, 0.5)"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Feature3DCard
                  icon={<Shield className="h-8 w-8" />}
                  title="Enterprise Security"
                  description="Bảo mật cấp doanh nghiệp với JWT, OAuth và 2FA"
                  color="rgba(34, 197, 94, 0.5)"
                />
              </motion.div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Stat3DCard
                  value={50234}
                  label="Active Students"
                  icon={<Users className="h-6 w-6" />}
                  trend={12.5}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Stat3DCard
                  value={523}
                  label="Courses Available"
                  icon={<BookOpen className="h-6 w-6" />}
                  trend={8.3}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Stat3DCard
                  value={95}
                  suffix="%"
                  label="Satisfaction Rate"
                  icon={<Award className="h-6 w-6" />}
                  trend={3.2}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Stat3DCard
                  value={1250}
                  suffix="M"
                  label="Revenue (VNĐ)"
                  icon={<TrendingUp className="h-6 w-6" />}
                  trend={15.7}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Animated Dashboard */}
        <AnimatedDashboard />

        {/* Micro Interactions */}
        <MicroInteractionsDemo />

        {/* Technology Stack */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
                Technology Stack
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Được xây dựng với các công nghệ hiện đại nhất
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex flex-col items-center gap-4 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="text-4xl">{tech.icon}</div>
                  <div className="text-center">
                    <div className="font-semibold text-white mb-1">{tech.name}</div>
                    <div className="text-xs text-gray-500">{tech.category}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/20 to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Tham gia cùng 50,000+ học viên đang học tập và phát triển kỹ năng tại Knowledge Base
              </p>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 60px rgba(59, 130, 246, 0.8)',
                }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold text-xl shadow-2xl shadow-blue-500/50"
              >
                Đăng ký ngay - Miễn phí
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

const techStack = [
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'TypeScript', icon: '📘', category: 'Language' },
  { name: 'Framer Motion', icon: '🎬', category: 'Animation' },
  { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' },
  { name: 'Supabase', icon: '⚡', category: 'Backend' },
  { name: 'PostgreSQL', icon: '🐘', category: 'Database' },
  { name: 'JWT Auth', icon: '🔐', category: 'Security' },
  { name: 'Vite', icon: '⚡', category: 'Build Tool' },
  { name: 'React Query', icon: '🔄', category: 'State' },
  { name: 'Zustand', icon: '🐻', category: 'State' },
  { name: 'React Router', icon: '🛣️', category: 'Routing' },
  { name: 'Lucide Icons', icon: '🎯', category: 'Icons' },
];
