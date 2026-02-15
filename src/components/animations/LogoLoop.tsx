/**
 * Logo Loop - Carousel đối tác & thương hiệu
 * Dùng react-fast-marquee (Aceternity Logo Clouds, 349K+ weekly downloads)
 * Mượt, pause on hover, gradient edges
 */

import React from 'react';
import Marquee from 'react-fast-marquee';

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
  const LogoContent = ({ logo }: { logo: Logo }) => (
    <div className="flex-shrink-0 flex items-center justify-center min-h-[3.5rem] min-w-[7rem] sm:min-h-[4rem] sm:min-w-[8rem] md:min-h-[4.5rem] md:min-w-[9rem] lg:min-h-[5rem] lg:min-w-[10rem] h-14 w-28 sm:h-16 sm:w-32 md:h-[4.5rem] md:w-36 lg:h-20 lg:w-44 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-lg sm:rounded-xl bg-white dark:bg-card/90 border border-border/50 shadow-sm hover:border-primary/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden mx-4 sm:mx-6 md:mx-8">
      {logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-7 sm:max-h-8 md:max-h-10 max-w-[80%] w-auto h-auto object-contain object-center"
          style={{ objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
        />
      ) : logo.icon ? (
        <div className="flex items-center justify-center [&_svg]:max-h-7 [&_svg]:max-w-[80px] sm:[&_svg]:max-h-8 sm:[&_svg]:max-w-[100px] md:[&_svg]:max-h-10 md:[&_svg]:max-w-[120px] [&_svg]:w-auto [&_svg]:h-auto [&_svg]:object-contain [&_svg]:overflow-visible">
          {logo.icon}
        </div>
      ) : (
        <span className="text-foreground font-semibold text-sm sm:text-base md:text-lg whitespace-nowrap overflow-visible">{logo.name}</span>
      )}
    </div>
  );

  const LogoCard = ({ logo, index }: { logo: Logo; index: number }) => {
    const content = <LogoContent logo={logo} />;
    const wrapperClass = "flex-shrink-0 block px-3 sm:px-4 md:px-5";
    if (logo.link) {
      return (
        <a
          key={`${logo.name}-${index}`}
          href={logo.link}
          target="_blank"
          rel="noopener noreferrer"
          className={wrapperClass}
          aria-label={`Mở ${logo.name}`}
        >
          {content}
        </a>
      );
    }
    return <div key={`${logo.name}-${index}`} className={wrapperClass}>{content}</div>;
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-gradient-to-b from-white to-slate-50/80 dark:from-card dark:to-card/80 shadow-medium py-4 sm:py-5 md:py-6 lg:py-8 flex items-center justify-center min-h-[4rem] sm:min-h-[4.5rem] md:min-h-[5rem] ${className}`}>
      <Marquee
        speed={speed}
        direction={direction === 'left' ? 'left' : 'right'}
        pauseOnHover
        gradient
        gradientColor="white"
        gradientWidth={48}
        className="min-h-[4rem] sm:min-h-[4.5rem] md:min-h-[5rem] flex items-center"
      >
        {logos.map((logo, index) => (
          <LogoCard key={`${logo.name}-${index}`} logo={logo} index={index} />
        ))}
      </Marquee>
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
/** Font hỗ trợ tiếng Việt cho SVG text (tránh lỗi hiển thị dấu) */
const svgTextFont = 'Arial, "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif';

export const LogoSVGs = {
  Autodesk: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="10" y="36" fontSize="22" fontWeight="bold" fontFamily={svgTextFont}>Autodesk</text>
    </svg>
  ),
  Microsoft: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <rect x="8" y="8" width="16" height="16" fill="#F25022" rx="2"/>
      <rect x="28" y="8" width="16" height="16" fill="#7FBA00" rx="2"/>
      <rect x="8" y="28" width="16" height="16" fill="#00A4EF" rx="2"/>
      <rect x="28" y="28" width="16" height="16" fill="#FFB900" rx="2"/>
      <text x="52" y="36" fontSize="18" fontWeight="600" fill="currentColor" fontFamily={svgTextFont}>Microsoft</text>
    </svg>
  ),
  Google: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="26" fontWeight="bold" fontFamily={svgTextFont}>
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
      <text x="10" y="36" fontSize="26" fontWeight="bold" fontFamily={svgTextFont}>AWS</text>
    </svg>
  ),
  Oracle: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <ellipse cx="36" cy="28" rx="28" ry="14" fill="none" stroke="#FF0000" strokeWidth="2"/>
      <text x="72" y="34" fontSize="18" fontWeight="bold" fill="currentColor" fontFamily={svgTextFont}>ORACLE</text>
    </svg>
  ),
  SAP: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="16" y="40" fontSize="32" fontWeight="bold" fontFamily={svgTextFont}>SAP</text>
    </svg>
  ),
  IBM: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="currentColor" {...svgProps}>
      <text x="16" y="40" fontSize="32" fontWeight="bold" fontFamily={svgTextFont}>IBM</text>
    </svg>
  ),
  Adobe: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <polygon points="24,8 40,42 32,42 28,28 44,28" fill="#FF0000"/>
      <text x="54" y="36" fontSize="20" fontWeight="bold" fill="currentColor" fontFamily={svgTextFont}>Adobe</text>
    </svg>
  ),
  Vingroup: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#0066CC" fontFamily={svgTextFont}>Vingroup</text>
    </svg>
  ),
  HoaPhat: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#C4A035" fontFamily={svgTextFont}>Hòa Phát</text>
    </svg>
  ),
  Coteccons: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#E85D04" fontFamily={svgTextFont}>Coteccons</text>
    </svg>
  ),
  Vinaconex: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#0D7D2E" fontFamily={svgTextFont}>Vinaconex</text>
    </svg>
  ),
  HungThinh: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#B91C1C" fontFamily={svgTextFont}>Hưng Thịnh</text>
    </svg>
  ),
  Novaland: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#0284C7" fontFamily={svgTextFont}>Novaland</text>
    </svg>
  ),
  FPT: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="16" y="40" fontSize="28" fontWeight="bold" fill="#E85D04" fontFamily={svgTextFont}>FPT</text>
    </svg>
  ),
  VNPT: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="40" fontSize="26" fontWeight="bold" fill="#0066CC" fontFamily={svgTextFont}>VNPT</text>
    </svg>
  ),
  HoaBinh: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#E11B22" fontFamily={svgTextFont}>Hòa Bình</text>
    </svg>
  ),
  Ricons: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#0054A6" fontFamily={svgTextFont}>Ricons</text>
    </svg>
  ),
  Pomina: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#1E3A8A" fontFamily={svgTextFont}>Pomina</text>
    </svg>
  ),
  Siemens: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#009999" fontFamily={svgTextFont}>Siemens</text>
    </svg>
  ),
  Bosch: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#EA0016" fontFamily={svgTextFont}>Bosch</text>
    </svg>
  ),
  Schneider: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#3DCD58" fontFamily={svgTextFont}>Schneider</text>
    </svg>
  ),
  Bentley: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#333333" fontFamily={svgTextFont}>Bentley</text>
    </svg>
  ),
  Trimble: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#0D6EFD" fontFamily={svgTextFont}>Trimble</text>
    </svg>
  ),
  Graphisoft: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#00A3E0" fontFamily={svgTextFont}>Graphisoft</text>
    </svg>
  ),
  Viettel: () => (
    <svg className="h-10 w-24" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="22" fontWeight="bold" fill="#E21836" fontFamily={svgTextFont}>Viettel</text>
    </svg>
  ),
  Mobifone: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#009639" fontFamily={svgTextFont}>Mobifone</text>
    </svg>
  ),
  CMC: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="16" y="40" fontSize="28" fontWeight="bold" fill="#0066B3" fontFamily={svgTextFont}>CMC</text>
    </svg>
  ),
  Ecopark: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#2E7D32" fontFamily={svgTextFont}>Ecopark</text>
    </svg>
  ),
  DatXanh: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#00796B" fontFamily={svgTextFont}>Đất Xanh</text>
    </svg>
  ),
  HoangQuan: () => (
    <svg className="h-10 w-32" viewBox="0 0 220 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="18" fontWeight="bold" fill="#1565C0" fontFamily={svgTextFont}>Hoàng Quân</text>
    </svg>
  ),
  CapitaLand: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="16" fontWeight="bold" fill="#0047AB" fontFamily={svgTextFont}>CapitaLand</text>
    </svg>
  ),
  EVN: () => (
    <svg className="h-10 w-20" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="16" y="40" fontSize="28" fontWeight="bold" fill="#D32F2F" fontFamily={svgTextFont}>EVN</text>
    </svg>
  ),
  Bitexco: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="20" fontWeight="bold" fill="#003366" fontFamily={svgTextFont}>Bitexco</text>
    </svg>
  ),
  PhuMyHung: () => (
    <svg className="h-10 w-28" viewBox="0 0 200 56" fill="none" {...svgProps}>
      <text x="8" y="36" fontSize="16" fontWeight="bold" fill="#1976D2" fontFamily={svgTextFont}>Phú Mỹ Hưng</text>
    </svg>
  ),
};
