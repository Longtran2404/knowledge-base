/**
 * PartnersSection - Section "Đối tác & Thương hiệu" với tiêu đề + marquee một dòng
 */

import React from 'react';
import { PartnersStrip, type PartnerLogo } from '../animations/PartnersStrip';

interface PartnersSectionProps {
  logos: PartnerLogo[];
  duration?: number;
  className?: string;
}

export function PartnersSection({
  logos,
  duration = 50,
  className = '',
}: PartnersSectionProps) {
  return (
    <section
      className={`py-16 md:py-24 bg-gradient-to-b from-primary/8 via-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-10">
        <div className="text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-4 border border-primary/25">
            Đối tác tin cậy
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 gradient-text">
            Đối tác & Thương hiệu
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hợp tác cùng các công ty hàng đầu Việt Nam và thế giới
          </p>
        </div>
      </div>
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full">
        <PartnersStrip logos={logos} duration={duration} className="max-w-6xl mx-auto" />
      </div>
    </section>
  );
}
