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
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <BookOpen className="h-4 w-4" />
                Về chúng tôi
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
                <span className="gradient-text">Knowledge Base</span>
              </h1>

              <p className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                Nền tảng{' '}
                <span className="inline-block min-w-[200px] md:min-w-[280px] text-left">
                  <RotatingText
                    words={rotatingWords}
                    interval={2500}
                    className="gradient-text text-2xl md:text-4xl drop-shadow-sm"
                  />
                </span>
              </p>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Giáo dục & đào tạo công nghệ xây dựng hàng đầu Việt Nam
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8 text-base shadow-medium hover:shadow-strong transition-shadow">
                  <Link to="/khoa-hoc" className="gap-2">
                    <Rocket className="h-5 w-5" />
                    Khám phá khóa học
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base">
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
        <section className="py-12 md:py-16 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {achievements.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="border-border bg-card/80 shadow-soft hover:shadow-medium transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                        <Counter
                          value={stat.value}
                          suffix={stat.suffix}
                          decimals={stat.decimals ?? 0}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Giới thiệu ngắn */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <p className="text-lg md:text-2xl text-center leading-relaxed text-foreground max-w-4xl mx-auto">
              Chúng tôi tin rằng giáo dục chất lượng cao nên được tiếp cận bởi mọi người. Với công nghệ hiện đại và đội ngũ giảng viên chuyên nghiệp, Knowledge Base mang đến trải nghiệm học tập tuyệt vời nhất cho học viên.
            </p>
          </div>
        </section>

        {/* Bento */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
                Tính năng nổi bật
              </h2>
              <p className="text-muted-foreground text-lg">
                Khám phá những gì làm nên sự khác biệt của chúng tôi
              </p>
            </div>
            <BentoHero />
          </div>
        </section>

        {/* Values */}
        <section className="py-14 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center mb-12">
              Giá trị cốt lõi định hình tương lai
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="border-border bg-card shadow-soft h-full">
                    <CardContent className="p-6 md:p-8">
                      <div className="text-primary mb-4">
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

        {/* Partners */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
              Đối tác & Thương hiệu
            </h2>
            <p className="text-muted-foreground text-lg text-center">
              Hợp tác cùng các công ty hàng đầu Việt Nam và thế giới
            </p>
          </div>
          <div className="overflow-hidden px-4 md:px-8">
            <LogoLoopMulti
              rows={[
                {
                  logos: [
                    { name: 'Autodesk', icon: <LogoSVGs.Autodesk /> },
                    { name: 'Microsoft', icon: <LogoSVGs.Microsoft /> },
                    { name: 'Google', icon: <LogoSVGs.Google /> },
                    { name: 'AWS', icon: <LogoSVGs.AWS /> },
                    { name: 'Oracle', icon: <LogoSVGs.Oracle /> },
                    { name: 'SAP', icon: <LogoSVGs.SAP /> },
                    { name: 'IBM', icon: <LogoSVGs.IBM /> },
                    { name: 'Adobe', icon: <LogoSVGs.Adobe /> },
                  ],
                  speed: 25,
                  direction: 'left',
                },
                {
                  logos: [
                    { name: 'Vingroup', icon: <LogoSVGs.Vingroup /> },
                    { name: 'Hòa Phát', icon: <LogoSVGs.HoaPhat /> },
                    { name: 'Coteccons', icon: <LogoSVGs.Coteccons /> },
                    { name: 'Vinaconex', icon: <LogoSVGs.Vinaconex /> },
                    { name: 'Hưng Thịnh', icon: <LogoSVGs.HungThinh /> },
                    { name: 'Novaland', icon: <LogoSVGs.Novaland /> },
                    { name: 'FPT', icon: <LogoSVGs.FPT /> },
                    { name: 'VNPT', icon: <LogoSVGs.VNPT /> },
                  ],
                  speed: 30,
                  direction: 'right',
                },
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Sẵn sàng bắt đầu hành trình?
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                Tham gia cùng 50,000+ học viên đang học tập và phát triển kỹ năng
              </p>
              <Button asChild size="lg" className="rounded-full px-10 text-lg shadow-medium">
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
