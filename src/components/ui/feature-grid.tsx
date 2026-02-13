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
    const iconBgColor = feature.color?.replace('text-', 'bg-').replace('600', '100') || 'bg-primary/10';
    const iconColor = feature.color || 'text-primary';

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
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
            {feature.link && (
              <a
                href={feature.link}
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
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
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          {feature.badge && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-semibold bg-background/90 text-foreground rounded-full">
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
                <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                  {feature.badge}
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className={`inline-flex p-4 rounded-2xl ${iconBgColor}`}>
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>

            <p className="text-muted-foreground leading-relaxed mb-4">
              {feature.description}
            </p>

            {feature.link && (
              <a
                href={feature.link}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/90 transition-colors group"
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
    'var(--gradient-primary)',
    'linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.85) 100%)',
    'linear-gradient(135deg, hsl(var(--success) / 0.9) 0%, hsl(var(--success) / 0.8) 100%)',
    'var(--gradient-accent)',
    'linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--info) / 0.85) 100%)',
    'linear-gradient(135deg, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary) / 0.78) 100%)',
  ];
  return gradients[index % gradients.length];
}