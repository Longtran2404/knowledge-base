/**
 * Liquid Glass Card Component
 * Reusable card with liquid glass morphism effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'active' | 'gradient';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function LiquidGlassCard({
  children,
  className,
  variant = 'default',
  blur = 'md',
  glow = false,
  hover = true,
  clickable = false,
  onClick,
}: LiquidGlassCardProps) {
  const blurValues = {
    sm: 'blur(12px)',
    md: 'blur(16px)',
    lg: 'blur(24px)',
    xl: 'blur(32px)',
  };

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'interactive':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.7) 50%, rgba(240,245,251,0.8) 100%)',
          backdropFilter: `${blurValues[blur]} saturate(180%)`,
          WebkitBackdropFilter: `${blurValues[blur]} saturate(180%)`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: glow
            ? '0 8px 32px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
        };
      case 'active':
        return {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(168, 85, 247, 0.1) 100%)',
          backdropFilter: `${blurValues[blur]} saturate(180%)`,
          WebkitBackdropFilter: `${blurValues[blur]} saturate(180%)`,
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.03) 25%, rgba(168, 85, 247, 0.05) 50%, rgba(236, 72, 153, 0.03) 75%, rgba(59, 130, 246, 0.05) 100%)',
          backdropFilter: `${blurValues[blur]} saturate(180%)`,
          WebkitBackdropFilter: `${blurValues[blur]} saturate(180%)`,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.6) 100%)',
          backdropFilter: `${blurValues[blur]} saturate(180%)`,
          WebkitBackdropFilter: `${blurValues[blur]} saturate(180%)`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
        };
    }
  };

  const Component = clickable ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        'rounded-2xl transition-all duration-300 overflow-hidden relative',
        clickable && 'cursor-pointer',
        className
      )}
      style={getBackgroundStyle()}
      onClick={clickable ? onClick : undefined}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Glass reflection overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 30%, transparent 70%, rgba(255, 255, 255, 0.1) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Ripple effect on hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </Component>
  );
}