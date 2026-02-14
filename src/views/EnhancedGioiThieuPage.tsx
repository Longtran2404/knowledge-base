/**
 * Trang Giới thiệu - Thiết kế mới, gọn, đồng bộ design system
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Target,
  Award,
  Globe,
  ArrowRight,
  Rocket,
  Star,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { Counter } from '../components/ui/counter';
import { RotatingText } from '../components/animations/RotatingText';
import { LogoLoopMulti, LogoSVGs } from '../components/animations/LogoLoop';
import { BentoHero } from '../components/layout/MagicBento';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const rotatingWords = [
  'Đổi mới',
  'Sáng tạo',
  'Phát triển',
  'Thành công',
  'Tiên phong',
];

const achievements = [
  { value: 49784, suffix: '+', label: 'Học viên', icon: Users },
  { value: 497, suffix: '+', label: 'Khóa học', icon: BookOpen },
  { value: 94, suffix: '%', label: 'Thành công', icon: Trophy },
  { value: 4.9, suffix: '★', decimals: 1, label: 'Đánh giá', icon: Star },
];

const values = [
  {
    icon: Target,
    title: 'Sứ mệnh',
    description: 'Đưa công nghệ BIM và automation đến với mọi kỹ sư xây dựng Việt Nam',
  },
  {
    icon: Globe,
    title: 'Tầm nhìn',
    description: 'Trở thành nền tảng số 1 về giáo dục và công nghệ xây dựng tại Đông Nam Á',
  },
  {
    icon: Award,
    title: 'Giá trị cốt lõi',
    description: 'Chất lượng, Sáng tạo, Hợp tác và Phát triển bền vững',
  },
];

export default function EnhancedGioiThieuPage() {
  return (
    <>
      <SEO
        title="Giới thiệu"
        description="Tìm hiểu về Knowledge Base - Nền tảng đào tạo trực tuyến hàng đầu Việt Nam"
        url="/gioi-thieu"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero - Thiết kế mới */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-10">
                <BookOpen className="h-4 w-4" />
                Nền tảng giáo dục hàng đầu
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                <span className="gradient-text">Knowledge Base</span>
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                Nền tảng{' '}
                <span className="inline-block min-w-[180px] sm:min-w-[240px] text-left">
                  <RotatingText
                    words={rotatingWords}
                    interval={2500}
                    className="gradient-text text-xl sm:text-2xl md:text-3xl"
                  />
                </span>
              </p>

              <p className="text-base md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Giáo dục & đào tạo công nghệ xây dựng hàng đầu Việt Nam
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base font-semibold shadow-medium hover:shadow-strong transition-all hover:-translate-y-0.5"
                >
                  <Link to="/khoa-hoc" className="gap-2">
                    <Rocket className="h-5 w-5" />
                    Khám phá khóa học
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base font-semibold border-2 hover:bg-primary/5"
                >
                  <Link to="/contact" className="gap-2">
                    Liên hệ ngay
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 md:py-20 relative -mt-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {achievements.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="border border-border/60 bg-card/95 shadow-soft hover:shadow-medium hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">
                        <Counter
                          value={stat.value}
                          suffix={stat.suffix}
                          decimals={stat.decimals ?? 0}
                        />
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Giới thiệu ngắn */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/40 to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl lg:text-2xl text-center leading-relaxed text-foreground">
                Chúng tôi tin rằng <span className="font-semibold text-primary">giáo dục chất lượng cao</span> nên được tiếp cận bởi mọi người. Với công nghệ hiện đại và đội ngũ giảng viên chuyên nghiệp, Knowledge Base mang đến trải nghiệm học tập tuyệt vời nhất cho học viên.
              </p>
            </div>
          </div>
        </section>

        {/* Bento - Tính năng */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-transparent to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 md:mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Tính năng nổi bật
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground tracking-tight">
                Khám phá những gì làm nên sự khác biệt
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Công nghệ tiên tiến và trải nghiệm học tập vượt trội dành cho bạn
              </p>
            </div>
            <BentoHero />
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Giá trị cốt lõi</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                Định hình tương lai cùng chúng tôi
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="border border-border/60 bg-card shadow-soft hover:shadow-medium hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full group">
                    <CardContent className="p-6 md:p-8">
                      <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partners & Thương hiệu - thiết kế mới */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/8 via-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
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
          <div className="overflow-hidden px-4 md:px-8 max-w-6xl mx-auto flex flex-col items-center">
            <LogoLoopMulti
              rows={[
                {
                  logos: [
                    { name: 'Autodesk', url: '/images/logos/autodesk.svg', icon: <LogoSVGs.Autodesk />, link: 'https://www.autodesk.com' },
                    { name: 'Microsoft', url: '/images/logos/microsoft.svg', icon: <LogoSVGs.Microsoft />, link: 'https://www.microsoft.com' },
                    { name: 'Google', url: '/images/logos/google.svg', icon: <LogoSVGs.Google />, link: 'https://www.google.com' },
                    { name: 'AWS', url: '/images/logos/amazonaws.svg', icon: <LogoSVGs.AWS />, link: 'https://aws.amazon.com' },
                    { name: 'Oracle', url: '/images/logos/oracle.svg', icon: <LogoSVGs.Oracle />, link: 'https://www.oracle.com' },
                    { name: 'SAP', url: '/images/logos/sap.svg', icon: <LogoSVGs.SAP />, link: 'https://www.sap.com' },
                    { name: 'IBM', url: '/images/logos/ibm.svg', icon: <LogoSVGs.IBM />, link: 'https://www.ibm.com' },
                    { name: 'Adobe', url: '/images/logos/adobe.svg', icon: <LogoSVGs.Adobe />, link: 'https://www.adobe.com' },
                    { name: 'Siemens', url: '/images/logos/siemens.svg', icon: <LogoSVGs.Siemens />, link: 'https://www.siemens.com' },
                    { name: 'Bosch', url: '/images/logos/bosch.svg', icon: <LogoSVGs.Bosch />, link: 'https://www.bosch.com' },
                    { name: 'Schneider', url: '/images/logos/schneiderelectric.svg', icon: <LogoSVGs.Schneider />, link: 'https://www.se.com' },
                  ],
                  speed: 40,
                  direction: 'left',
                },
                {
                  logos: [
                    { name: 'Vingroup', url: '/images/logos/vingroup.svg', icon: <LogoSVGs.Vingroup />, link: 'https://www.vingroup.net' },
                    { name: 'Hòa Phát', icon: <LogoSVGs.HoaPhat />, link: 'https://hoaphat.com.vn' },
                    { name: 'Coteccons', icon: <LogoSVGs.Coteccons />, link: 'https://coteccons.vn' },
                    { name: 'Vinaconex', icon: <LogoSVGs.Vinaconex />, link: 'https://vinaconex.com.vn' },
                    { name: 'Hưng Thịnh', icon: <LogoSVGs.HungThinh />, link: 'https://hungthinhcorp.com.vn' },
                    { name: 'Novaland', icon: <LogoSVGs.Novaland />, link: 'https://novaland.com.vn' },
                    { name: 'FPT', url: '/images/logos/fpt.svg', icon: <LogoSVGs.FPT />, link: 'https://fpt.com.vn' },
                    { name: 'VNPT', icon: <LogoSVGs.VNPT />, link: 'https://vnpt.vn' },
                    { name: 'Hòa Bình', icon: <LogoSVGs.HoaBinh />, link: 'https://hoabinhcorp.com.vn' },
                    { name: 'Ricons', icon: <LogoSVGs.Ricons />, link: 'https://ricons.vn' },
                    { name: 'Pomina', icon: <LogoSVGs.Pomina />, link: 'https://pomina.vn' },
                  ],
                  speed: 45,
                  direction: 'right',
                },
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/5 pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
                Sẵn sàng bắt đầu hành trình?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-10">
                Tham gia cùng 50,000+ học viên đang học tập và phát triển kỹ năng
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-xl px-10 py-6 text-lg font-semibold shadow-medium hover:shadow-strong transition-all hover:-translate-y-0.5"
              >
                <Link to="/dang-nhap" className="gap-3">
                  <Rocket className="h-5 w-5" />
                  Đăng ký miễn phí ngay
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
