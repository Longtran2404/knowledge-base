/**
 * Animated Dashboard Component
 * Dashboard với animations và data visualizations ấn tượng
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Target,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Counter } from '../ui/counter';
import { FluidGlass } from '../ui/fluid-glass';

interface DashboardStat {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: number;
  color: string;
  bgGradient: string;
}

const dashboardStats: DashboardStat[] = [
  {
    id: 'revenue',
    icon: <DollarSign className="h-6 w-6" />,
    label: 'Doanh thu tháng này',
    value: 1250000000,
    suffix: ' VNĐ',
    trend: 12.5,
    color: 'text-green-400',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
  },
  {
    id: 'students',
    icon: <Users className="h-6 w-6" />,
    label: 'Học viên hoạt động',
    value: 50234,
    suffix: '',
    trend: 8.3,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    id: 'courses',
    icon: <BookOpen className="h-6 w-6" />,
    label: 'Khóa học đang mở',
    value: 523,
    suffix: '',
    trend: 15.2,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
  },
  {
    id: 'completion',
    icon: <Award className="h-6 w-6" />,
    label: 'Tỷ lệ hoàn thành',
    value: 94.7,
    suffix: '%',
    trend: 3.1,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/10 to-orange-500/10',
  },
];

interface PerformanceMetric {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

const performanceMetrics: PerformanceMetric[] = [
  { label: 'Engagement', value: 87, maxValue: 100, color: 'bg-blue-500' },
  { label: 'Retention', value: 92, maxValue: 100, color: 'bg-green-500' },
  { label: 'Satisfaction', value: 95, maxValue: 100, color: 'bg-purple-500' },
  { label: 'Growth', value: 78, maxValue: 100, color: 'bg-yellow-500' },
];

export function AnimatedDashboard() {
  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Activity className="h-4 w-4" />
            Analytics & Performance
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Dashboard Thống Kê Real-time
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Theo dõi hiệu suất và phân tích dữ liệu với dashboard chuyên nghiệp
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Performance Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <FluidGlass variant="dark" blur="xl" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <PerformanceBar key={metric.label} {...metric} delay={index * 0.1} />
              ))}
            </div>
          </FluidGlass>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FluidGlass variant="dark" blur="xl" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <ActivityItem
                icon={<Users className="h-5 w-5" />}
                title="1,234 học viên mới đăng ký"
                time="5 phút trước"
                color="text-blue-400"
              />
              <ActivityItem
                icon={<BookOpen className="h-5 w-5" />}
                title="15 khóa học mới được publish"
                time="15 phút trước"
                color="text-purple-400"
              />
              <ActivityItem
                icon={<Award className="h-5 w-5" />}
                title="523 chứng chỉ được cấp"
                time="1 giờ trước"
                color="text-yellow-400"
              />
              <ActivityItem
                icon={<TrendingUp className="h-5 w-5" />}
                title="Doanh thu tăng 12.5%"
                time="2 giờ trước"
                color="text-green-400"
              />
            </div>
          </FluidGlass>
        </motion.div>

        {/* Real-time Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <FluidGlass variant="dark" blur="xl" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Biểu đồ tăng trưởng</h3>
            <div className="relative h-64 flex items-end gap-2">
              {[...Array(12)].map((_, i) => {
                const height = Math.random() * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg relative group"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap"
                    >
                      {Math.round(height)}%
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>Tháng 1</span>
              <span>Tháng 12</span>
            </div>
          </FluidGlass>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, trend, color, bgGradient }: DashboardStat) {
  return (
    <FluidGlass variant="dark" blur="lg" className={`p-6 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={color}>{icon}</div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <div className={`text-3xl font-bold mb-1 ${color}`}>
        {typeof value === 'number' && value > 1000000 ? (
          <Counter value={value / 1000000} decimals={0} suffix="M" />
        ) : (
          <Counter value={value} decimals={value % 1 !== 0 ? 1 : 0} suffix={suffix} />
        )}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </FluidGlass>
  );
}

function PerformanceBar({ label, value, maxValue, color, delay }: PerformanceMetric & { delay: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / maxValue) * 100}%` }}
          viewport={{ once: true }}
          transition={{ delay, duration: 1, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, color }: { icon: React.ReactNode; title: string; time: string; color: string }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      className="flex items-start gap-4 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all cursor-pointer"
    >
      <div className={`${color} mt-0.5`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-white mb-1">{title}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>
    </motion.div>
  );
}
