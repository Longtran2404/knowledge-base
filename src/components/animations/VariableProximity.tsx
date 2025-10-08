/**
 * Variable Proximity Text
 * Text size changes based on mouse proximity - inspired by reactbits.dev
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VariableProximityProps {
  text: string;
  className?: string;
  baseSize?: number;
  maxSize?: number;
  proximityRange?: number;
}

export function VariableProximity({
  text,
  className = '',
  baseSize = 16,
  maxSize = 32,
  proximityRange = 100,
}: VariableProximityProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const words = text.split(' ');

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-wrap gap-2 ${className}`}
    >
      {words.map((word, index) => (
        <Word
          key={index}
          word={word}
          mousePosition={mousePosition}
          baseSize={baseSize}
          maxSize={maxSize}
          proximityRange={proximityRange}
        />
      ))}
    </div>
  );
}

interface WordProps {
  word: string;
  mousePosition: { x: number; y: number };
  baseSize: number;
  maxSize: number;
  proximityRange: number;
}

function Word({ word, mousePosition, baseSize, maxSize, proximityRange }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(Infinity);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mousePosition.x - (centerX - ref.current.offsetParent?.getBoundingClientRect().left!);
      const dy = mousePosition.y - (centerY - ref.current.offsetParent?.getBoundingClientRect().top!);

      const dist = Math.sqrt(dx * dx + dy * dy);
      setDistance(dist);
    }
  }, [mousePosition]);

  const size = React.useMemo(() => {
    if (distance > proximityRange) return baseSize;
    const ratio = 1 - distance / proximityRange;
    return baseSize + (maxSize - baseSize) * ratio;
  }, [distance, baseSize, maxSize, proximityRange]);

  return (
    <motion.span
      ref={ref}
      animate={{
        fontSize: `${size}px`,
        fontWeight: size > baseSize + (maxSize - baseSize) * 0.5 ? 700 : 400,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className="inline-block cursor-default transition-colors duration-200 hover:text-blue-400"
    >
      {word}
    </motion.span>
  );
}
