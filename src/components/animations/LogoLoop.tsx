/**
 * Logo Loop - Carousel đối tác & thương hiệu
 * CSS animation mượt không giật, chữ không bị cắt
 */

import React from 'react';

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
  speed = 40,
  direction = 'left',
  className = ''
}: LogoLoopProps) {
  // Duplicate 2x để loop seamless: khi scroll -50% = hết bản 1, bản 2 giống hệt → reset không giật
  const duplicatedLogos = [...logos, ...logos];

  const LogoContent = ({ logo }: { logo: Logo }) => (
    <div className="flex-shrink-0 flex items-center justify-center min-h-[4rem] min-w-[7rem] md:min-h-[5rem] md:min-w-[9rem] h-16 w-32 md:h-20 md:w-40 px-5 py-3 rounded-xl bg-white/80 dark:bg-background/60 border border-border/50 hover:border-primary/40 hover:shadow-soft transition-all duration-300 cursor-pointer overflow-visible">
      {logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-11 max-w-[85%] w-auto object-contain object-center"
          style={{ objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
        />
      ) : logo.icon ? (
        <div className="flex items-center justify-center [&_svg]:max-h-10 [&_svg]:max-w-[120px] [&_svg]:w-auto [&_svg]:h-auto [&_svg]:object-contain [&_svg]:overflow-visible">
          {logo.icon}
        </div>
      ) : (
        <span className="text-foreground font-semibold text-base md:text-lg whitespace-nowrap overflow-visible">{logo.name}</span>
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

  const animationName = direction === 'left' ? 'marquee-left' : 'marquee-right';

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-border/60 bg-white/90 dark:bg-card/90 shadow-soft py-6 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[hsl(var(--background))] dark:via-[hsl(var(--background)/0.95)] z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-[hsl(var(--background))] dark:via-[hsl(var(--background)/0.95)] z-10 pointer-events-none" />

      <div
        className="flex gap-8 md:gap-12 items-center shrink-0 w-max will-change-transform"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <LogoCard key={`${logo.name}-${index}`} logo={logo} index={index} />
        ))}
      </div>
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

/** SVG logos - viewBox có padding để chữ không bị cắt chân (g, y, p...) */
const svgProps = { overflow: 'visible' as const };

export const LogoSVGs = {
  Autodesk: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="10" y="36" fontSize="22" fontWeight="bold">Autodesk</text>
    </svg>
  ),
  Microsoft: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <rect x="8" y="8" width="16" height="16" fill="#F25022" rx="2"/>
      <rect x="28" y="8" width="16" height="16" fill="#7FBA00" rx="2"/>
      <rect x="8" y="28" width="16" height="16" fill="#00A4EF" rx="2"/>
      <rect x="28" y="28" width="16" height="16" fill="#FFB900" rx="2"/>
      <text x="52" y="36" fontSize="18" fontWeight="600" fill="currentColor">Microsoft</text>
    </svg>
  ),
  Google: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="26" fontWeight="bold">
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
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="10" y="36" fontSize="26" fontWeight="bold">AWS</text>
    </svg>
  ),
  Oracle: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <ellipse cx="36" cy="28" rx="28" ry="14" fill="none" stroke="#FF0000" strokeWidth="2"/>
      <text x="72" y="34" fontSize="18" fontWeight="bold" fill="currentColor">ORACLE</text>
    </svg>
  ),
  SAP: () => (
    <svg className="h-10 w-18" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="16" y="40" fontSize="32" fontWeight="bold">SAP</text>
    </svg>
  ),
  IBM: () => (
    <svg className="h-10 w-18" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="16" y="40" fontSize="32" fontWeight="bold">IBM</text>
    </svg>
  ),
  Adobe: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <polygon points="24,8 40,42 32,42 28,28 44,28" fill="#FF0000"/>
      <text x="54" y="36" fontSize="20" fontWeight="bold" fill="currentColor">Adobe</text>
    </svg>
  ),
  Vingroup: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#0066CC">Vingroup</text>
    </svg>
  ),
  HoaPhat: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#C4A035">Hòa Phát</text>
    </svg>
  ),
  Coteccons: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#E85D04">Coteccons</text>
    </svg>
  ),
  Vinaconex: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#0D7D2E">Vinaconex</text>
    </svg>
  ),
  HungThinh: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#B91C1C">Hưng Thịnh</text>
    </svg>
  ),
  Novaland: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#0284C7">Novaland</text>
    </svg>
  ),
  FPT: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="16" y="40" fontSize="28" fontWeight="bold" fill="#E85D04">FPT</text>
    </svg>
  ),
  VNPT: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="40" fontSize="26" fontWeight="bold" fill="#0066CC">VNPT</text>
    </svg>
  ),
  HoaBinh: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#E11B22">Hòa Bình</text>
    </svg>
  ),
  Ricons: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#0054A6">Ricons</text>
    </svg>
  ),
  Pomina: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#1E3A8A">Pomina</text>
    </svg>
  ),
  Siemens: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#009999">Siemens</text>
    </svg>
  ),
  Bosch: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#EA0016">Bosch</text>
    </svg>
  ),
  Schneider: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#3DCD58">Schneider</text>
    </svg>
  ),
};
