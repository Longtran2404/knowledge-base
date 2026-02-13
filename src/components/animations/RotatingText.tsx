/**
 * Rotating Text Animation
 * Words rotate in and out - inspired by reactbits.dev
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function RotatingText({ words, interval = 2000, className = '' }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -20, opacity: 0, filter: 'blur(8px)' }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          className="inline-block gradient-text"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Alternative: Flip animation
export function RotatingTextFlip({ words, interval = 2000, className = '' }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`relative inline-block perspective-1000 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="inline-block gradient-text"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
