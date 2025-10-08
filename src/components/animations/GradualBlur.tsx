/**
 * Gradual Blur Animation
 * Image/content gradually blurs in/out - inspired by reactbits.dev
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GradualBlurProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'in' | 'out';
}

export function GradualBlur({
  children,
  className = '',
  delay = 0,
  duration = 1,
  direction = 'in',
}: GradualBlurProps) {
  const variants = {
    hidden: {
      filter: direction === 'in' ? 'blur(20px)' : 'blur(0px)',
      opacity: direction === 'in' ? 0 : 1,
    },
    visible: {
      filter: direction === 'in' ? 'blur(0px)' : 'blur(20px)',
      opacity: direction === 'in' ? 1 : 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered version
export function ScrollGradualBlur({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ filter: 'blur(20px)', opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Text gradual blur word by word
export function GradualBlurText({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(' ');

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(10px)', opacity: 0 }}
          animate={{ filter: 'blur(0px)', opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.05,
            ease: 'easeInOut',
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
