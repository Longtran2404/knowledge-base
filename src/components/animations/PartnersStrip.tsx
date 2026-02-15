/**
 * PartnersStrip - Marquee một dòng vô hạn (infinity loop)
 * Cấu trúc 3 lớp: section (overflow hidden) → viewport (overflow-x hidden) → track (flex-nowrap, width max-content)
 * Fallback logo: url lỗi → hiển thị icon hoặc name, không dùng placeholder.
 */

import React, { useState } from 'react';

export interface PartnerLogo {
  name: string;
  url?: string;
  link?: string;
  icon?: React.ReactNode;
}

interface PartnersStripProps {
  logos: PartnerLogo[];
  className?: string;
  /** Thời gian 1 vòng (giây). Mặc định 50. */
  duration?: number;
}

function LogoCardContent({ logo, uniqueKey }: { logo: PartnerLogo; uniqueKey: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const useImage = logo.url && !imgFailed;

  const cardInner = (
    <div className="flex-shrink-0 flex items-center justify-center w-[140px] min-w-[140px] h-[72px] sm:w-[150px] sm:min-w-[150px] sm:h-[76px] rounded-xl bg-white dark:bg-card border border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden px-3 py-2">
      {useImage ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-7 sm:max-h-8 max-w-[85%] w-auto object-contain"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : logo.icon ? (
        <div className="flex items-center justify-center w-full h-full [&_svg]:max-h-7 [&_svg]:max-w-[100px] [&_svg]:object-contain">
          {logo.icon}
        </div>
      ) : (
        <span className="text-sm font-semibold text-foreground truncate px-2 text-center">
          {logo.name}
        </span>
      )}
    </div>
  );

  return <>{cardInner}</>;
}

export function PartnersStrip({
  logos,
  className = '',
  duration = 50,
}: PartnersStripProps) {
  const [paused, setPaused] = useState(false);

  const renderCard = (logo: PartnerLogo, key: string) => {
    const content = <LogoCardContent logo={logo} uniqueKey={key} />;
    if (logo.link) {
      return (
        <a
          key={key}
          href={logo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
          aria-label={logo.name}
        >
          {content}
        </a>
      );
    }
    return (
      <div key={key} className="flex-shrink-0">
        {content}
      </div>
    );
  };

  return (
    <>
      {/* Lớp 1: Section container - overflow hidden, chiều cao cố định một dòng */}
      <div
        className={`rounded-2xl border border-border/60 bg-gradient-to-b from-white to-slate-50/80 dark:from-card dark:to-card/80 shadow-medium overflow-hidden ${className}`}
        style={{ height: '96px' }}
      >
        {/* Lớp 2: Viewport - chỉ hiện một dải ngang */}
        <div
          className="h-full overflow-x-hidden overflow-y-hidden w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Lớp 3: Track - một dòng, width max-content để không wrap */}
          <div
            className="flex flex-nowrap items-center gap-6 h-full"
            style={{
              width: 'max-content',
              minWidth: 'max-content',
              animation: `partners-strip-scroll ${duration}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              willChange: 'transform',
            }}
          >
            {logos.map((logo, i) => renderCard(logo, `a-${i}`))}
            {logos.map((logo, i) => renderCard(logo, `b-${i}`))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes partners-strip-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
