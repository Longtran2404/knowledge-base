/**
 * Scroll Velocity Text
 * Infinite scrolling text with velocity-based speed - inspired by reactbits.dev
 * Optimized for mobile performance
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { wrap } from '@popmotion/popcorn';

interface ScrollVelocityProps {
  text: string[];
  baseVelocity?: number;
  className?: string;
}

export function ScrollVelocity({ text, baseVelocity = 2, className = '' }: ScrollVelocityProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reduce spring complexity on mobile
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: isMobile ? 100 : 50,
    stiffness: isMobile ? 200 : 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, isMobile ? 2 : 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-100, 0, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    // Reduce animation frequency on mobile
    if (isMobile && Math.random() > 0.5) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={`overflow-hidden whitespace-nowrap flex w-full ${className}`}>
      <motion.div style={{ x }} className="flex gap-8 md:gap-12 lg:gap-16">
        {[...text, ...text, ...text, ...text].map((item, index) => (
          <span
            key={index}
            className="text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-300 bg-clip-text text-transparent inline-block"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Multi-row version
export function ScrollVelocityMulti({ rows }: { rows: { text: string[]; velocity: number }[] }) {
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <ScrollVelocity
          key={index}
          text={row.text}
          baseVelocity={row.velocity}
        />
      ))}
    </div>
  );
}
