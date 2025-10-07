/**
 * Liquid Glass Hero Component
 * Modern hero section with liquid glass effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LiquidGlassButton } from './liquid-glass-button';
import { Badge } from './badge';

interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gradient';
  icon?: React.ReactNode;
}

interface HeroStat {
  value: string | number;
  suffix?: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface LiquidGlassHeroProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle: string;
  actions?: HeroAction[];
  stats?: HeroStat[];
  variant?: 'default' | 'gradient' | 'spotlight';
  backgroundImage?: string;
  children?: React.ReactNode;
}

export function LiquidGlassHero({
  badge,
  badgeIcon,
  title,
  subtitle,
  actions = [],
  stats = [],
  variant = 'default',
  backgroundImage,
  children,
}: LiquidGlassHeroProps) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'spotlight':
        return 'bg-gradient-to-b from-slate-50 to-white';
      default:
        return 'bg-gradient-to-b from-gray-50 to-white';
    }
  };

  return (
    <section className={`relative overflow-hidden ${getBackgroundStyle()} py-20 lg:py-32`}>
      {/* Background Elements */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 shadow-sm"
              >
                {badgeIcon || <Sparkles className="h-4 w-4" />}
                {badge}
              </Badge>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            {typeof title === 'string' ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
            ) : (
              title
            )}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Actions */}
          {actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {actions.map((action, index) => (
                <LiquidGlassButton
                  key={index}
                  variant={action.variant || (index === 0 ? 'primary' : 'secondary')}
                  size="lg"
                  glow={index === 0}
                  onClick={action.onClick}
                  href={action.href}
                >
                  {action.label}
                  {action.icon || (index === 0 && <ArrowRight className="ml-2 h-5 w-5" />)}
                </LiquidGlassButton>
              ))}
            </motion.div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="relative p-6 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.7) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {stat.icon && (
                    <div className="mb-2 flex justify-center">
                      <div className={`p-2 rounded-lg ${stat.color || 'bg-blue-100'}`}>
                        {stat.icon}
                      </div>
                    </div>
                  )}
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color || 'text-blue-600'}`}>
                    {stat.value}{stat.suffix || ''}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Additional Children */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}