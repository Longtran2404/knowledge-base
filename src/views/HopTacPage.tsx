import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowRight,
  Check,
  Star,
  Crown,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Lock,
  Unlock,
  TrendingUp,
  Heart,
  Building2,
  Handshake,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { SEO } from "../components/SEO";
import { SUBSCRIPTION_PLANS } from "../config/subscription-plans";

const planIcons: Record<string, React.ReactNode> = {
  free: <Unlock className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
  partner: <Handshake className="h-6 w-6" />,
};

const collaborationBenefits = [
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Mở rộng thị trường",
    description: "Tiếp cận cộng đồng kỹ sư xây dựng toàn quốc"
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Tăng doanh thu",
    description: "Chia sẻ lợi nhuận từ nội dung và sản phẩm"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Bảo vệ thương hiệu",
    description: "Được bảo vệ quyền sở hữu trí tuệ"
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Công nghệ tiên tiến",
    description: "Tiếp cận công nghệ BIM và automation mới nhất"
  }
];

const partnerRequirements = [
  "Có chuyên môn trong lĩnh vực xây dựng",
  "Có kinh nghiệm thực tế ít nhất 3 năm",
  "Có khả năng tạo nội dung chất lượng",
  "Cam kết tuân thủ quy định cộng đồng",
  "Có tinh thần hợp tác và chia sẻ"
];

export default function CollaborationPage() {
  const navigate = useNavigate();

  const handleSubscribe = (planId: string, planName: string, price: number) => {
    if (planId === "free") {
      toast.success("Bạn đang sử dụng gói miễn phí!", { description: "Đăng ký để mở khóa thêm tính năng" });
      navigate("/dang-nhap");
      return;
    }
    toast.success(`Đang chuyển đến thanh toán gói ${planName}`, { description: `Tổng tiền: ${price.toLocaleString("vi-VN")}đ` });
    navigate(`/goi-dich-vu?plan=${planId}&name=${encodeURIComponent(planName)}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Hợp tác" description="Trở thành đối tác chiến lược - Knowledge Base" url="/hop-tac" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Handshake className="h-4 w-4 mr-2" />
              Cơ hội hợp tác
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Hợp tác cùng <span className="gradient-text">Knowledge Base</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Trở thành đối tác chiến lược và cùng chúng tôi kiến tạo tương lai ngành xây dựng Việt Nam
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Đối tác", value: "50+", icon: Handshake },
                { label: "Nội dung", value: "1000+", icon: BookOpen },
                { label: "Học viên", value: "10K+", icon: Users },
                { label: "Dự án", value: "200+", icon: Building2 },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2 text-primary">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

        {/* Pricing Plans */}
        <section className="py-16 md:py-20 overflow-visible">
          <div className="container mx-auto px-4 overflow-visible">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Crown className="h-4 w-4 mr-2" />
                Bảng giá dịch vụ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Chọn gói phù hợp với bạn</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Từ gói miễn phí cơ bản đến gói đối tác cao cấp, chúng tôi có giải pháp phù hợp cho mọi nhu cầu
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-6 overflow-visible">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all hover:shadow-lg overflow-visible ${
                    plan.popular
                      ? "border-primary shadow-lg scale-[1.02]"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                      <Badge className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 shadow-md">
                        <Star className="h-3 w-3 fill-current shrink-0" />
                        <span>Phổ biến nhất</span>
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={`text-center pb-6 ${plan.popular ? "pt-8" : ""}`}>
                    <div className={`flex justify-center mb-4 p-3 rounded-full ${plan.popular ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {planIcons[plan.id]}
                    </div>
                    <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Tính năng bao gồm:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-destructive">Hạn chế:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lock className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <span className="text-sm text-destructive/90">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id, plan.name, plan.price)}
                    >
                      {plan.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Collaboration Benefits */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                Lợi ích hợp tác
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Tại sao nên hợp tác với chúng tôi?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Khám phá những lợi ích độc quyền khi trở thành đối tác của Knowledge Base
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {collaborationBenefits.map((benefit, index) => (
                <Card key={index} className="border border-border bg-card hover:shadow-md transition-all">
                  <CardContent className="text-center p-6">
                    <div className="flex justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 text-primary">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Requirements */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Shield className="h-4 w-4 mr-2" />
                Yêu cầu đối tác
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Tiêu chuẩn để trở thành đối tác</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chúng tôi tìm kiếm những đối tác có chuyên môn cao và tâm huyết với ngành xây dựng
              </p>
            </div>

            <Card className="border border-border bg-card">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-6">Yêu cầu cơ bản</h3>
                    <ul className="space-y-4">
                      {partnerRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                    <h3 className="text-2xl font-bold text-foreground mb-4">Quy trình hợp tác</h3>
                    <div className="space-y-4">
                      {["Đăng ký và gửi hồ sơ", "Phỏng vấn và đánh giá", "Ký kết hợp đồng", "Bắt đầu hợp tác"].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </div>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Heart className="h-4 w-4 mr-2" />
              Sẵn sàng hợp tác
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Bắt đầu hành trình hợp tác ngay hôm nay</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Hãy để chúng tôi giúp bạn mở rộng thị trường và tăng doanh thu thông qua nền tảng giáo dục hàng đầu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleSubscribe("partner", "Đối tác", 199000)}>
                <Handshake className="mr-3 h-6 w-6" />
                Đăng ký hợp tác
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                <Users className="mr-3 h-6 w-6" />
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
}
