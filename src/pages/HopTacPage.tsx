import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Award,
  ArrowRight,
  Check,
  Star,
  Crown,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Download,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  Heart,
  Building2,
  Handshake
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

import { AppProviders } from "../lib/providers/app-providers";


const pricingPlans = [
  {
    id: "free",
    name: "Miễn phí",
    price: "0đ",
    period: "tháng",
    description: "Gói cơ bản cho người dùng mới",
    features: [
      "Tải 10 tài liệu trong 1 tháng",
      "Xem preview khóa học",
      "Truy cập tài nguyên cơ bản",
      "Hỗ trợ cộng đồng",
      "Không xem được khóa học đầy đủ",
      "Không tải được sản phẩm"
    ],
    limitations: [
      "Giới hạn 10 tài liệu/tháng",
      "Không có quyền truy cập đầy đủ"
    ],
    buttonText: "Bắt đầu miễn phí",
    buttonVariant: "outline" as const,
    popular: false,
    icon: <Unlock className="h-6 w-6" />
  },
  {
    id: "premium",
    name: "Hội viên Premium",
    price: "299.000đ",
    period: "tháng",
    description: "Gói cao cấp cho người dùng chuyên nghiệp",
    features: [
      "Tải tài liệu không giới hạn",
      "Xem khóa học miễn phí đầy đủ",
      "Truy cập tài nguyên thực hành",
      "Tải sản phẩm và tools",
      "Hướng dẫn sử dụng chi tiết",
      "Hỗ trợ ưu tiên 24/7",
      "Chứng chỉ hoàn thành khóa học",
      "Cập nhật nội dung mới nhất"
    ],
    limitations: [],
    buttonText: "Đăng ký Premium",
    buttonVariant: "default" as const,
    popular: true,
    icon: <Crown className="h-6 w-6" />
  },
  {
    id: "partner",
    name: "Đối tác",
    price: "199.000đ",
    period: "tháng",
    description: "Gói đặc biệt cho đối tác và chuyên gia",
    features: [
      "Xem khóa học theo chuyên ngành",
      "Tài liệu chuyên ngành đầy đủ",
      "Tools và plugins chuyên ngành",
      "Đăng tải tài liệu của riêng bạn",
      "Đăng tải sản phẩm của riêng bạn",
      "Quản lý nội dung cá nhân",
      "Hỗ trợ kỹ thuật chuyên sâu",
      "Cơ hội hợp tác kinh doanh",
      "Chia sẻ doanh thu từ nội dung"
    ],
    limitations: [],
    buttonText: "Trở thành đối tác",
    buttonVariant: "default" as const,
    popular: false,
    icon: <Handshake className="h-6 w-6" />
  }
];

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
      toast.success("Bạn đang sử dụng gói miễn phí!", {
        description: "Đăng ký để mở khóa thêm tính năng"
      });
      navigate("/auth");
      return;
    }

    // Chuyển đến trang thanh toán
    toast.success(`Đang chuyển đến thanh toán gói ${planName}`, {
      description: `Tổng tiền: ${price.toLocaleString('vi-VN')}đ`
    });

    // Navigate to pricing page with selected plan
    navigate(`/pricing?plan=${planId}&name=${encodeURIComponent(planName)}&price=${price}`);
  };

  return (
    <AppProviders>
      <div className="min-h-screen relative bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm">
                  <Handshake className="h-4 w-4 mr-2" />
                  Cơ hội hợp tác
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Hợp tác cùng
                  <br />
                  <span className="bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                    Nam Long Center
                  </span>
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                  Trở thành đối tác chiến lược và cùng chúng tôi kiến tạo tương lai 
                  ngành xây dựng Việt Nam
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {[
                  { label: "Đối tác", value: "50+", icon: Handshake },
                  { label: "Nội dung", value: "1000+", icon: BookOpen },
                  { label: "Học viên", value: "10K+", icon: Users },
                  { label: "Dự án", value: "200+", icon: Building2 }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mx-auto mb-2">
                        <IconComponent className="h-6 w-6 text-purple-200" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-purple-200">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="relative py-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm">
                <Crown className="h-4 w-4 mr-2" />
                Bảng giá dịch vụ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Chọn gói phù hợp với bạn
              </h2>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Từ gói miễn phí cơ bản đến gói đối tác cao cấp,
                chúng tôi có giải pháp phù hợp cho mọi nhu cầu
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`relative border-2 bg-black/40 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular
                      ? 'border-purple-500 shadow-xl shadow-purple-500/50 scale-105'
                      : 'border-white/10 hover:border-purple-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm border-0">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                        Phổ biến nhất
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        plan.popular ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-gray-300'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-300">{plan.description}</CardDescription>

                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-300">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Tính năng bao gồm:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-400">Hạn chế:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start gap-2">
                              <Lock className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-300">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                      }`}
                      size="lg"
                      onClick={() => handleSubscribe(plan.id, plan.name, parseInt(plan.price.replace(/\D/g, '')))}
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
        <section className="relative py-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Lợi ích hợp tác
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tại sao nên hợp tác với chúng tôi?
              </h2>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Khám phá những lợi ích độc quyền khi trở thành đối tác của Nam Long Center
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {collaborationBenefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6 bg-black/40 backdrop-blur-md border border-white/10 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4">
                      <div className="text-purple-300">
                        {benefit.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Requirements */}
        <section className="relative py-20">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm">
                <Shield className="h-4 w-4 mr-2" />
                Yêu cầu đối tác
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tiêu chuẩn để trở thành đối tác
              </h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Chúng tôi tìm kiếm những đối tác có chuyên môn cao và tâm huyết
                với ngành xây dựng
              </p>
            </div>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Yêu cầu cơ bản</h3>
                    <ul className="space-y-4">
                      {partnerRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-green-400" />
                          </div>
                          <span className="text-gray-300">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-400/20">
                    <h3 className="text-2xl font-bold text-white mb-4">Quy trình hợp tác</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <span className="text-gray-300">Đăng ký và gửi hồ sơ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <span className="text-gray-300">Phỏng vấn và đánh giá</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <span className="text-gray-300">Ký kết hợp đồng</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          4
                        </div>
                        <span className="text-gray-300">Bắt đầu hợp tác</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 px-4 py-2 border-purple-400/50 text-purple-200 bg-purple-950/50 backdrop-blur-sm">
              <Heart className="h-4 w-4 mr-2" />
              Sẵn sàng hợp tác
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bắt đầu hành trình hợp tác ngay hôm nay
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
              Hãy để chúng tôi giúp bạn mở rộng thị trường và tăng doanh thu
              thông qua nền tảng giáo dục hàng đầu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 text-lg"
                onClick={() => handleSubscribe("partner", "Đối tác", 199000)}
              >
                <Handshake className="mr-3 h-6 w-6" />
                Đăng ký hợp tác
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
                onClick={() => navigate("/contact")}
              >
                <Users className="mr-3 h-6 w-6" />
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppProviders>
  );
}
