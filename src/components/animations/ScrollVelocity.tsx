/**
 * Scroll Velocity Text
 * Infinite scrolling text with velocity-based speed - inspired by reactbits.dev
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
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-100, 0, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
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
    <div className={`overflow-hidden whitespace-nowrap flex ${className}`}>
      <motion.div style={{ x }} className="flex gap-8">
        {[...text, ...text, ...text, ...text].map((item, index) => (
          <span
            key={index}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
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
