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

  const getBackgroundStyle = (): React.CSSProperties => {
    const blurStyle = { backdropFilter: `${blurValues[blur]} saturate(180%)`, WebkitBackdropFilter: `${blurValues[blur]} saturate(180%)` as unknown as string };
    switch (variant) {
      case 'interactive':
        return {
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.92) 0%, hsl(var(--muted) / 0.9) 50%, hsl(var(--card) / 0.88) 100%)',
          ...blurStyle,
          border: '1px solid hsl(var(--border))',
          boxShadow: glow
            ? '0 8px 32px hsl(var(--primary) / 0.12), 0 0 0 1px hsl(var(--border)) inset'
            : 'var(--shadow-medium), 0 0 0 1px hsl(var(--border) / 0.5) inset',
        };
      case 'active':
        return {
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--primary) / 0.08) 100%)',
          ...blurStyle,
          border: '1px solid hsl(var(--primary) / 0.2)',
          boxShadow: '0 8px 32px hsl(var(--primary) / 0.15), 0 0 0 1px hsl(var(--primary) / 0.08) inset',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04) 0%, hsl(var(--primary) / 0.02) 25%, hsl(var(--primary) / 0.04) 50%, hsl(var(--primary) / 0.02) 75%, hsl(var(--primary) / 0.04) 100%)',
          ...blurStyle,
          border: '1px solid hsl(var(--border))',
          boxShadow: 'var(--shadow-soft), 0 0 0 1px hsl(var(--border) / 0.4) inset',
        };
      default:
        return {
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--muted) / 0.85) 100%)',
          ...blurStyle,
          border: '1px solid hsl(var(--border))',
          boxShadow: 'var(--shadow-medium), 0 0 0 1px hsl(var(--border) / 0.5) inset',
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
          background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.35) 0%, transparent 30%, transparent 70%, hsl(0 0% 100% / 0.08) 100%)',
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