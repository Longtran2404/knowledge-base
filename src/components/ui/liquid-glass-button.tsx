/**
 * Liquid Glass Button Component
 * Premium button with liquid glass morphism effects
 */

import React from 'react';
import { Link } from 'react-router-dom';
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
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  href?: string;
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
  type = "button",
  href
}: LiquidGlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const getButtonStyle = (): React.CSSProperties => {
    const blur = { backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)' as unknown as string };
    if (disabled || loading) {
      return {
        background: 'linear-gradient(135deg, hsl(var(--muted) / 0.8) 0%, hsl(var(--muted) / 0.6) 100%)',
        ...blur,
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-soft), 0 0 0 1px hsl(var(--border) / 0.5) inset',
        color: 'hsl(var(--muted-foreground) / 0.8)',
      };
    }
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--gradient-primary)',
          ...blur,
          border: '1px solid hsl(var(--primary) / 0.4)',
          boxShadow: glow
            ? 'var(--shadow-glow), 0 0 0 1px hsl(0 0% 100% / 0.2) inset'
            : '0 8px 32px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(0 0% 100% / 0.15) inset',
          color: 'hsl(var(--primary-foreground))',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.95) 0%, hsl(var(--muted) / 0.9) 100%)',
          ...blur,
          border: '1px solid hsl(var(--primary) / 0.3)',
          boxShadow: '0 8px 32px hsl(var(--primary) / 0.08), 0 0 0 1px hsl(var(--border)) inset',
          color: 'hsl(var(--primary))',
        };
      case 'gradient':
        return {
          background: 'var(--gradient-accent)',
          ...blur,
          border: '1px solid hsl(var(--primary) / 0.35)',
          boxShadow: glow
            ? 'var(--shadow-glow), 0 0 0 1px hsl(0 0% 100% / 0.2) inset'
            : '0 8px 32px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(0 0% 100% / 0.15) inset',
          color: 'hsl(var(--primary-foreground))',
        };
      case 'ghost':
        return {
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)' as unknown as string,
          border: '1px solid hsl(var(--border))',
          boxShadow: 'none',
          color: 'hsl(var(--foreground))',
        };
      default:
        return {
          background: 'linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--muted) / 0.85) 100%)',
          ...blur,
          border: '1px solid hsl(var(--border))',
          boxShadow: 'var(--shadow-medium), 0 0 0 1px hsl(var(--border) / 0.5) inset',
          color: 'hsl(var(--foreground))',
        };
    }
  };

  const commonClasses = cn(
    'relative overflow-hidden rounded-2xl font-medium transition-all duration-300 disabled:cursor-not-allowed inline-block',
    sizeClasses[size],
    className
  );

  const commonProps = {
    className: commonClasses,
    style: getButtonStyle(),
  };

  const motionProps = {
    whileHover: !disabled && !loading ? { scale: 1.02, y: -1 } : undefined,
    whileTap: !disabled && !loading ? { scale: 0.98 } : undefined,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 },
  };

  const content = (
    <>
      {/* Glass reflection overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.25) 0%, transparent 30%, transparent 70%, hsl(0 0% 100% / 0.08) 100%)',
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
    </>
  );

  // If href is provided, render as Link
  if (href) {
    return (
      <Link to={href} style={{ textDecoration: 'none' }}>
        <motion.div {...commonProps} {...motionProps}>
          {content}
        </motion.div>
      </Link>
    );
  }

  // Otherwise, render as button
  return (
    <motion.button
      {...commonProps}
      {...motionProps}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {content}
    </motion.button>
  );
}