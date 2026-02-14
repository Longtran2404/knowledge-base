/**
 * Logo Loop - Carousel đối tác & thương hiệu
 * Thiết kế mới: có màu, gradient hai bên mượt
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Logo {
  name: string;
  url?: string;
  link?: string;
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
  // Duplicate 2x để infinity loop mượt (không giật)
  const duplicatedLogos = [...logos, ...logos];

  const LogoContent = ({ logo }: { logo: Logo }) => (
    <div className="flex-shrink-0 flex items-center justify-center h-16 w-28 md:h-20 md:w-36 px-4 py-2 rounded-xl bg-white/80 dark:bg-background/60 border border-border/50 hover:border-primary/40 hover:shadow-soft transition-all duration-300 cursor-pointer">
      {logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-12 max-w-full object-contain"
          onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
        />
      ) : logo.icon ? (
        <div className="[&_svg]:max-h-10 [&_svg]:w-auto [&_svg]:max-w-full">
          {logo.icon}
        </div>
      ) : (
        <span className="text-foreground font-semibold text-lg truncate">{logo.name}</span>
      )}
    </div>
  );

  const LogoCard = ({ logo, index }: { logo: Logo; index: number }) => {
    const content = <LogoContent logo={logo} />;
    if (logo.link) {
      return (
        <a
          key={`${logo.name}-${index}`}
          href={logo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 block"
          aria-label={`Mở ${logo.name}`}
        >
          {content}
        </a>
      );
    }
    return <div key={`${logo.name}-${index}`} className="flex-shrink-0">{content}</div>;
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-border/60 bg-white/90 dark:bg-card/90 shadow-soft py-6 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[hsl(var(--background))] dark:via-[hsl(var(--background)/0.95)] z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-[hsl(var(--background))] dark:via-[hsl(var(--background)/0.95)] z-10 pointer-events-none" />

      <motion.div
        className="flex gap-10 md:gap-14 items-center shrink-0 w-max"
        style={{ willChange: 'transform' }}
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <LogoCard key={`${logo.name}-${index}`} logo={logo} index={index} />
        ))}
      </motion.div>
    </div>
  );
}

interface LogoLoopMultiProps {
  rows: { logos: Logo[]; speed?: number; direction?: 'left' | 'right' }[];
  className?: string;
}

export function LogoLoopMulti({ rows, className = '' }: LogoLoopMultiProps) {
  return (
    <div className={`space-y-6 ${className}`}>
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

/** SVG logos - dùng currentColor để hiển thị đúng trên nền sáng */
export const LogoSVGs = {
  Autodesk: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="currentColor">
      <text x="10" y="34" fontSize="22" fontWeight="bold">Autodesk</text>
    </svg>
  ),
  Microsoft: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <rect x="8" y="8" width="16" height="16" fill="#F25022" rx="2"/>
      <rect x="28" y="8" width="16" height="16" fill="#7FBA00" rx="2"/>
      <rect x="8" y="28" width="16" height="16" fill="#00A4EF" rx="2"/>
      <rect x="28" y="28" width="16" height="16" fill="#FFB900" rx="2"/>
      <text x="52" y="34" fontSize="18" fontWeight="600" fill="currentColor">Microsoft</text>
    </svg>
  ),
  Google: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="26" fontWeight="bold">
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
    <svg className="h-10 w-20" viewBox="0 0 200 50" fill="currentColor">
      <text x="10" y="34" fontSize="26" fontWeight="bold">AWS</text>
    </svg>
  ),
  Oracle: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <ellipse cx="36" cy="25" rx="28" ry="14" fill="none" stroke="#FF0000" strokeWidth="2"/>
      <text x="72" y="32" fontSize="18" fontWeight="bold" fill="currentColor">ORACLE</text>
    </svg>
  ),
  SAP: () => (
    <svg className="h-10 w-18" viewBox="0 0 200 50" fill="currentColor">
      <text x="16" y="38" fontSize="32" fontWeight="bold">SAP</text>
    </svg>
  ),
  IBM: () => (
    <svg className="h-10 w-18" viewBox="0 0 200 50" fill="currentColor">
      <text x="16" y="38" fontSize="32" fontWeight="bold">IBM</text>
    </svg>
  ),
  Adobe: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <polygon points="24,8 40,42 32,42 28,28 44,28" fill="#FF0000"/>
      <text x="54" y="34" fontSize="20" fontWeight="bold" fill="currentColor">Adobe</text>
    </svg>
  ),
  Vingroup: () => (
    <svg className="h-10 w-26" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="22" fontWeight="bold" fill="#0066CC">Vingroup</text>
    </svg>
  ),
  HoaPhat: () => (
    <svg className="h-10 w-26" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#C4A035">Hòa Phát</text>
    </svg>
  ),
  Coteccons: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#E85D04">Coteccons</text>
    </svg>
  ),
  Vinaconex: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#0D7D2E">Vinaconex</text>
    </svg>
  ),
  HungThinh: () => (
    <svg className="h-10 w-26" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="18" fontWeight="bold" fill="#B91C1C">Hưng Thịnh</text>
    </svg>
  ),
  Novaland: () => (
    <svg className="h-10 w-26" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#0284C7">Novaland</text>
    </svg>
  ),
  FPT: () => (
    <svg className="h-10 w-18" viewBox="0 0 200 50" fill="none">
      <text x="16" y="38" fontSize="28" fontWeight="bold" fill="#E85D04">FPT</text>
    </svg>
  ),
  VNPT: () => (
    <svg className="h-10 w-22" viewBox="0 0 200 50" fill="none">
      <text x="8" y="38" fontSize="26" fontWeight="bold" fill="#0066CC">VNPT</text>
    </svg>
  ),
  HoaBinh: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#E11B22">Hòa Bình</text>
    </svg>
  ),
  Ricons: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="22" fontWeight="bold" fill="#0054A6">Ricons</text>
    </svg>
  ),
  Pomina: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="22" fontWeight="bold" fill="#1E3A8A">Pomina</text>
    </svg>
  ),
  Siemens: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="20" fontWeight="bold" fill="#009999">Siemens</text>
    </svg>
  ),
  Bosch: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="22" fontWeight="bold" fill="#EA0016">Bosch</text>
    </svg>
  ),
  Schneider: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 50" fill="none">
      <text x="8" y="34" fontSize="18" fontWeight="bold" fill="#3DCD58">Schneider</text>
    </svg>
  ),
};
