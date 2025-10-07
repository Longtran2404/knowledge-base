/**
 * Counter Component - Animated number counter with various effects
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  animateOnce?: boolean;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  duration = 2,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  animateOnce = true,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: animateOnce, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    } else if (!animateOnce) {
      motionValue.set(0);
    }
  }, [isInView, value, delay, motionValue, animateOnce]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      const formatted = formatNumber(latest, decimals, separator);
      setDisplayValue(formatted);
    });
  }, [springValue, decimals, separator]);

  const formatNumber = (num: number, decimals: number, separator: string) => {
    const rounded = decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
    const parts = rounded.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  variant?: 'default' | 'glow' | 'gradient';
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className,
  prefix = '',
  suffix = '',
  duration = 2,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'text-4xl font-bold',
    glow: 'text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    gradient: 'text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(variantClasses[variant], className)}
    >
      <Counter value={value} prefix={prefix} suffix={suffix} duration={duration} />
    </motion.div>
  );
};

export default Counter;
