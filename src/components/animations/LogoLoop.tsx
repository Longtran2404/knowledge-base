/**
 * Logo Loop Animation
 * Infinite scrolling logo carousel - inspired by reactbits.dev
 * Optimized for performance with logo images
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Logo {
  name: string;
  url?: string;
  icon?: React.ReactNode;
}

interface LogoLoopProps {
  logos: Logo[];
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function LogoLoop({
  logos,
  speed = 30,
  direction = 'left',
  className = ''
}: LogoLoopProps) {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className={`relative w-full overflow-hidden py-2 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-12 items-center"
        animate={{
          x: direction === 'left' ? [0, -100 * logos.length] : [-100 * logos.length, 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex-shrink-0 flex items-center justify-center h-24 w-32 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
          >
            {logo.url ? (
              <img
                src={logo.url}
                alt={logo.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
              />
            ) : logo.icon ? (
              <div className="text-white">
                {logo.icon}
              </div>
            ) : (
              <div className="text-white text-2xl font-bold">
                {logo.name}
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Multi-row version
interface LogoLoopMultiProps {
  rows: {
    logos: Logo[];
    speed?: number;
    direction?: 'left' | 'right';
  }[];
  className?: string;
}

export function LogoLoopMulti({ rows, className = '' }: LogoLoopMultiProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {rows.map((row, index) => (
        <LogoLoop
          key={index}
          logos={row.logos}
          speed={row.speed}
          direction={row.direction}
        />
      ))}
    </div>
  );
}

// SVG Logo Components for major brands
export const LogoSVGs = {
  Autodesk: () => (
    <svg className="h-12 w-24" viewBox="0 0 200 60" fill="currentColor">
      <text x="10" y="40" fontSize="28" fontWeight="bold" fill="white">Autodesk</text>
    </svg>
  ),
  Microsoft: () => (
    <svg className="h-12 w-24" viewBox="0 0 200 60" fill="currentColor">
      <rect x="10" y="10" width="20" height="20" fill="#F25022"/>
      <rect x="35" y="10" width="20" height="20" fill="#7FBA00"/>
      <rect x="10" y="35" width="20" height="20" fill="#00A4EF"/>
      <rect x="35" y="35" width="20" height="20" fill="#FFB900"/>
      <text x="65" y="40" fontSize="24" fontWeight="600" fill="white">Microsoft</text>
    </svg>
  ),
  Google: () => (
    <svg className="h-12 w-32" viewBox="0 0 200 60" fill="none">
      <text x="10" y="40" fontSize="32" fontWeight="bold">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
    </svg>
  ),
  AWS: () => (
    <svg className="h-12 w-20" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="32" fontWeight="bold">AWS</text>
    </svg>
  ),
  Oracle: () => (
    <svg className="h-12 w-24" viewBox="0 0 200 60" fill="white">
      <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="#FF0000" strokeWidth="3"/>
      <text x="100" y="40" fontSize="24" fontWeight="bold">ORACLE</text>
    </svg>
  ),
  SAP: () => (
    <svg className="h-12 w-20" viewBox="0 0 200 60" fill="white">
      <text x="20" y="45" fontSize="42" fontWeight="bold">SAP</text>
    </svg>
  ),
  IBM: () => (
    <svg className="h-12 w-20" viewBox="0 0 200 60" fill="white">
      <text x="20" y="45" fontSize="42" fontWeight="bold">IBM</text>
    </svg>
  ),
  Adobe: () => (
    <svg className="h-12 w-24" viewBox="0 0 200 60" fill="white">
      <polygon points="30,10 50,50 40,50 35,35 55,35" fill="#FF0000"/>
      <text x="70" y="40" fontSize="28" fontWeight="bold">Adobe</text>
    </svg>
  ),
  Vingroup: () => (
    <svg className="h-12 w-28" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="28" fontWeight="bold" fill="#0066CC">Vingroup</text>
    </svg>
  ),
  HoaPhat: () => (
    <svg className="h-12 w-28" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="26" fontWeight="bold" fill="#FFD700">Hòa Phát</text>
    </svg>
  ),
  Coteccons: () => (
    <svg className="h-12 w-32" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="24" fontWeight="bold" fill="#FF6600">Coteccons</text>
    </svg>
  ),
  Vinaconex: () => (
    <svg className="h-12 w-32" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="24" fontWeight="bold" fill="#00AA00">Vinaconex</text>
    </svg>
  ),
  HungThinh: () => (
    <svg className="h-12 w-28" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="22" fontWeight="bold" fill="#CC0000">Hưng Thịnh</text>
    </svg>
  ),
  Novaland: () => (
    <svg className="h-12 w-28" viewBox="0 0 200 60" fill="white">
      <text x="10" y="40" fontSize="26" fontWeight="bold" fill="#0099FF">Novaland</text>
    </svg>
  ),
  FPT: () => (
    <svg className="h-12 w-20" viewBox="0 0 200 60" fill="white">
      <text x="20" y="45" fontSize="36" fontWeight="bold" fill="#FF6600">FPT</text>
    </svg>
  ),
  VNPT: () => (
    <svg className="h-12 w-24" viewBox="0 0 200 60" fill="white">
      <text x="10" y="45" fontSize="32" fontWeight="bold" fill="#0066CC">VNPT</text>
    </svg>
  ),
};
