/**
 * FluidGlass Component - Modern glass morphism effect with fluid animations
 * Perfect for dark theme with backdrop blur effects
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FluidGlassProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'dark' | 'light' | 'primary' | 'secondary';
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  glowColor?: string;
  border?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FluidGlass: React.FC<FluidGlassProps> = ({
  variant = 'dark',
  blur = 'md',
  glow = false,
  glowColor,
  border = true,
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white/10 border-white/20',
    dark: 'bg-black/30 border-white/10',
    light: 'bg-white/60 border-white/40',
    primary: 'bg-blue-500/20 border-blue-400/30',
    secondary: 'bg-purple-500/20 border-purple-400/30',
  };

  const blurClasses = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const glowClass = glow
    ? `shadow-lg ${glowColor || 'shadow-blue-500/20'} hover:shadow-xl hover:${glowColor || 'shadow-blue-500/30'}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        variantClasses[variant],
        blurClasses[blur],
        border && 'border',
        glowClass,
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Fluid gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

interface FluidGlassCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'dark' | 'light' | 'primary' | 'secondary';
  glow?: boolean;
  onClick?: () => void;
}

export const FluidGlassCard: React.FC<FluidGlassCardProps> = ({
  title,
  description,
  icon,
  className,
  children,
  variant = 'dark',
  glow = false,
  onClick,
}) => {
  return (
    <FluidGlass
      variant={variant}
      blur="lg"
      glow={glow}
      className={cn('p-6', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      whileHover={onClick ? { y: -5 } : undefined}
    >
      {icon && (
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-300 text-sm mb-4">{description}</p>
      )}
      {children}
    </FluidGlass>
  );
};

export default FluidGlass;
