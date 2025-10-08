/**
 * Splash Cursor Effect
 * Interactive splash animation on mouse move - inspired by reactbits.dev
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Splash {
  id: number;
  x: number;
  y: number;
}

export function SplashCursor({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only create splash if mouse is inside container
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const newSplash: Splash = {
            id: idCounter.current++,
            x,
            y,
          };

          setSplashes((prev) => [...prev, newSplash]);

          // Remove splash after animation
          setTimeout(() => {
            setSplashes((prev) => prev.filter((s) => s.id !== newSplash.id));
          }, 1000);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {splashes.map((splash) => (
          <motion.div
            key={splash.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{
              left: splash.x,
              top: splash.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 blur-xl" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Alternative: Ripple effect
export function RippleCursor({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<Splash[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple: Splash = {
          id: idCounter.current++,
          x,
          y,
        };

        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 1000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('click', handleClick);
    return () => container?.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-32 h-32 rounded-full border-2 border-blue-400/50" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
