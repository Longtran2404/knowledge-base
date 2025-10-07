/**
 * BlurText Component - Text animation with blur effect
 * Inspired by modern text animations for international UX
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: 'blur-in' | 'blur-slide' | 'blur-fade';
  animateOnce?: boolean;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className,
  delay = 0,
  duration = 0.6,
  variant = 'blur-in',
  animateOnce = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: animateOnce, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!animateOnce) {
      controls.start('hidden');
    }
  }, [isInView, controls, animateOnce]);

  const variants: any = {
    'blur-in': {
      hidden: {
        filter: 'blur(10px)',
        opacity: 0
      },
      visible: {
        filter: 'blur(0px)',
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      },
    },
    'blur-slide': {
      hidden: {
        filter: 'blur(10px)',
        opacity: 0,
        x: -20,
      },
      visible: {
        filter: 'blur(0px)',
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94] as any,
        },
      },
    },
    'blur-fade': {
      hidden: {
        filter: 'blur(10px)',
        opacity: 0,
        scale: 0.95,
      },
      visible: {
        filter: 'blur(0px)',
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[variant]}
      className={cn('inline-block', className)}
    >
      {text}
    </motion.div>
  );
};

interface BlurTextWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  variant?: 'blur-in' | 'blur-slide' | 'blur-fade';
}

export const BlurTextWords: React.FC<BlurTextWordsProps> = ({
  text,
  className,
  wordClassName,
  delay = 0,
  duration = 0.5,
  stagger = 0.05,
  variant = 'blur-in',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      },
    }),
  };

  const wordVariants: any = {
    'blur-in': {
      hidden: {
        opacity: 0,
        filter: 'blur(10px)',
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          duration,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      },
    },
    'blur-slide': {
      hidden: {
        opacity: 0,
        filter: 'blur(10px)',
        y: 20,
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94] as any,
        },
      },
    },
    'blur-fade': {
      hidden: {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 0.8,
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
          duration,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={container}
      className={cn('flex flex-wrap gap-x-2', className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants[variant]}
          className={cn('inline-block', wordClassName)}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;
