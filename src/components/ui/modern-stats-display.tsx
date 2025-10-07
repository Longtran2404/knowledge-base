/**
 * Modern Stats Display Component
 * Animated statistics display with count-up effect
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  icon?: LucideIcon | React.ReactNode;
  suffix?: string;
  prefix?: string;
  color?: string;
  description?: string;
}

interface ModernStatsDisplayProps {
  stats: Stat[];
  variant?: 'default' | 'cards' | 'minimal' | 'gradient';
  columns?: 2 | 3 | 4 | 5;
  animated?: boolean;
  className?: string;
}

function CountUp({ end, duration = 2000, suffix = '', prefix = '' }: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, isInView]);

  return (
    <div ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export function ModernStatsDisplay({
  stats,
  variant = 'default',
  columns = 4,
  animated = true,
  className = '',
}: ModernStatsDisplayProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  };

  const renderStat = (stat: Stat, index: number) => {
    const Icon = stat.icon as LucideIcon | undefined;
    const isReactNode = stat.icon && typeof stat.icon !== 'function';
    const isNumeric = typeof stat.value === 'number';

    const statValue = isNumeric ? (
      <CountUp
        end={stat.value as number}
        suffix={stat.suffix || ''}
        prefix={stat.prefix || ''}
      />
    ) : (
      `${stat.prefix || ''}${stat.value}${stat.suffix || ''}`
    );

    if (variant === 'minimal') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color || 'text-blue-600'}`}>
            {statValue}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {stat.label}
          </div>
        </motion.div>
      );
    }

    if (variant === 'cards') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ delay: index * 0.1 }}
          className="relative p-6 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-lg group"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {stat.icon && (
            <div className="mb-4">
              <div className={`inline-flex p-3 rounded-xl ${stat.color?.replace('text-', 'bg-') || 'bg-blue-100'}`}>
                {isReactNode ? (
                  <>{stat.icon}</>
                ) : Icon ? (
                  <Icon className={`h-6 w-6 ${stat.color || 'text-blue-600'}`} />
                ) : null}
              </div>
            </div>
          )}
          <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color || 'text-blue-600'}`}>
            {statValue}
          </div>
          <div className="text-base font-semibold text-gray-700 mb-1">
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-sm text-gray-500">
              {stat.description}
            </div>
          )}

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
      );
    }

    if (variant === 'gradient') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          transition={{ delay: index * 0.1 }}
          className="relative p-6 rounded-2xl overflow-hidden group"
          style={{
            background: `linear-gradient(135deg, ${getGradientColors(index)} 0%, ${getGradientColors(index, true)} 100%)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {stat.icon && (
            <div className="mb-3">
              {isReactNode ? (
                <>{stat.icon}</>
              ) : Icon ? (
                <Icon className="h-8 w-8 text-white/90" />
              ) : null}
            </div>
          )}
          <div className="text-4xl md:text-5xl font-bold text-white mb-2">
            {statValue}
          </div>
          <div className="text-sm text-white/80 font-medium">
            {stat.label}
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>
      );
    }

    // Default variant
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="text-center group"
      >
        {stat.icon && (
          <div className="mb-3 flex justify-center">
            <div className={`p-3 rounded-xl ${stat.color?.replace('text-', 'bg-').replace('600', '100') || 'bg-blue-100'} group-hover:scale-110 transition-transform duration-300`}>
              {isReactNode ? (
                <>{stat.icon}</>
              ) : Icon ? (
                <Icon className={`h-6 w-6 ${stat.color || 'text-blue-600'}`} />
              ) : null}
            </div>
          </div>
        )}
        <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color || 'text-blue-600'}`}>
          {statValue}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {stat.label}
        </div>
        {stat.description && (
          <div className="text-xs text-gray-500 mt-1">
            {stat.description}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8 ${className}`}>
      {stats.map((stat, index) => renderStat(stat, index))}
    </div>
  );
}

function getGradientColors(index: number, dark = false) {
  const colors = [
    { light: 'rgba(59, 130, 246, 0.8)', dark: 'rgba(37, 99, 235, 0.9)' }, // Blue
    { light: 'rgba(16, 185, 129, 0.8)', dark: 'rgba(5, 150, 105, 0.9)' }, // Green
    { light: 'rgba(139, 92, 246, 0.8)', dark: 'rgba(124, 58, 237, 0.9)' }, // Purple
    { light: 'rgba(249, 115, 22, 0.8)', dark: 'rgba(234, 88, 12, 0.9)' }, // Orange
    { light: 'rgba(236, 72, 153, 0.8)', dark: 'rgba(219, 39, 119, 0.9)' }, // Pink
  ];
  const color = colors[index % colors.length];
  return dark ? color.dark : color.light;
}