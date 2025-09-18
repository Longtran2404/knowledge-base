/**
 * Liquid Glass Button Component
 * Premium button with liquid glass morphism effects
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'gradient' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

export function LiquidGlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  glow = false,
  loading = false,
  disabled = false,
  onClick,
  type = "button"
}: LiquidGlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const getButtonStyle = () => {
    if (disabled || loading) {
      return {
        background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.3) 0%, rgba(209, 213, 219, 0.2) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(156, 163, 175, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        color: 'rgba(156, 163, 175, 0.7)',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 50%, rgba(168, 85, 247, 0.9) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: glow
            ? '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
            : '0 8px 32px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          color: 'white',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.7) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
          color: 'rgb(59, 130, 246)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(168, 85, 247, 0.8) 25%, rgba(99, 102, 241, 0.9) 50%, rgba(59, 130, 246, 0.8) 75%, rgba(14, 165, 233, 0.9) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: glow
            ? '0 8px 32px rgba(168, 85, 247, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
            : '0 8px 32px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          color: 'white',
        };
      case 'ghost':
        return {
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          color: 'rgb(75, 85, 99)',
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.6) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          color: 'rgb(55, 65, 81)',
        };
    }
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-2xl font-medium transition-all duration-300 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      style={getButtonStyle()}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {/* Glass reflection overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 30%, transparent 70%, rgba(255, 255, 255, 0.1) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </div>

      {/* Ripple effect on hover */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
}