/**
 * Scroll Float Text Animation
 * Text floats up as you scroll - inspired by reactbits.dev
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollFloatProps {
  text: string;
  className?: string;
  containerClassName?: string;
}

export function ScrollFloat({ text, className = '', containerClassName = '' }: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={`relative ${containerClassName}`}>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {words.map((word, index) => {
          const start = index / words.length;
          const end = start + 1 / words.length;

          return (
            <Word
              key={index}
              word={word}
              scrollYProgress={scrollYProgress}
              range={[start, end]}
            />
          );
        })}
      </div>
    </div>
  );
}

interface WordProps {
  word: string;
  scrollYProgress: any;
  range: [number, number];
}

function Word({ word, scrollYProgress, range }: WordProps) {
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  const y = useTransform(scrollYProgress, range, [50, 0]);
  const scale = useTransform(scrollYProgress, range, [0.8, 1]);

  return (
    <motion.span
      style={{ opacity, y, scale }}
      className="inline-block"
    >
      {word}
    </motion.span>
  );
}

// Alternative: Character-by-character animation
export function ScrollFloatChars({ text, className = '' }: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'start 0.2'],
  });

  const chars = text.split('');

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex flex-wrap ${className}`}>
        {chars.map((char, index) => {
          const start = index / chars.length;
          const end = start + 1 / chars.length;

          return (
            <Char
              key={index}
              char={char}
              scrollYProgress={scrollYProgress}
              range={[start, end]}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CharProps {
  char: string;
  scrollYProgress: any;
  range: [number, number];
}

function Char({ char, scrollYProgress, range }: CharProps) {
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  const y = useTransform(scrollYProgress, range, [100, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block"
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}
