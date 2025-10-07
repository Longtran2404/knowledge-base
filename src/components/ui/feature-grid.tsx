/**
 * Feature Grid Component
 * Display features in a beautiful grid layout with liquid glass cards
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { LiquidGlassCard } from './liquid-glass-card';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
  color?: string;
  badge?: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'liquid-glass' | 'gradient' | 'minimal';
  hover?: boolean;
  className?: string;
}

export function FeatureGrid({
  features,
  columns = 3,
  variant = 'liquid-glass',
  hover = true,
  className = '',
}: FeatureGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const renderFeature = (feature: Feature, index: number) => {
    const Icon = feature.icon;
    const iconBgColor = feature.color?.replace('text-', 'bg-').replace('600', '100') || 'bg-blue-100';
    const iconColor = feature.color || 'text-blue-600';

    if (variant === 'minimal') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={hover ? { y: -5 } : undefined}
          className="group"
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className={`p-4 rounded-2xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
            {feature.link && (
              <a
                href={feature.link}
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Tìm hiểu thêm
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </motion.div>
      );
    }

    if (variant === 'gradient') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={hover ? { scale: 1.03, y: -5 } : undefined}
          className="relative p-8 rounded-2xl overflow-hidden group cursor-pointer"
          style={{
            background: getGradientBackground(index),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {feature.badge && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-gray-700 rounded-full">
                {feature.badge}
              </span>
            </div>
          )}

          <div className="mb-5">
            <div className="inline-flex p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            {feature.title}
          </h3>

          <p className="text-white/90 leading-relaxed mb-4">
            {feature.description}
          </p>

          {feature.link && (
            <a
              href={feature.link}
              className="inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Xem chi tiết
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>
      );
    }

    // Liquid Glass variant (default)
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
      >
        <LiquidGlassCard
          variant="interactive"
          hover={hover}
          className="h-full"
        >
          <div className="p-8">
            {feature.badge && (
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {feature.badge}
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className={`inline-flex p-4 rounded-2xl ${iconBgColor}`}>
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {feature.title}
            </h3>

            <p className="text-gray-600 leading-relaxed mb-4">
              {feature.description}
            </p>

            {feature.link && (
              <a
                href={feature.link}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                Tìm hiểu thêm
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </LiquidGlassCard>
      </motion.div>
    );
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8 ${className}`}>
      {features.map((feature, index) => renderFeature(feature, index))}
    </div>
  );
}

function getGradientBackground(index: number) {
  const gradients = [
    'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)', // Blue
    'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.95) 100%)', // Green
    'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.95) 100%)', // Purple
    'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(234, 88, 12, 0.95) 100%)', // Orange
    'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(219, 39, 119, 0.95) 100%)', // Pink
    'linear-gradient(135deg, rgba(14, 165, 233, 0.9) 0%, rgba(2, 132, 199, 0.95) 100%)', // Sky
  ];
  return gradients[index % gradients.length];
}