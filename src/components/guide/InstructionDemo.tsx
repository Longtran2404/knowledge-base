import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  Play,
  RotateCcw,
  Star,
  ArrowRight,
  Home,
  GraduationCap,
  ShoppingCart,
  FileText,
  Handshake,
  Settings,
  Search,
  Bell,
  Users,
  Zap,
  Target,
  CheckCircle2,
  Trophy,
  Clock,
  Award,
  Lightbulb,
  Rocket,
  Heart,
  Shield,
  Globe,
  Smartphone,
  Laptop,
  Monitor,
  Eye,
  MousePointer,
} from "lucide-react";
import { Link } from "react-router-dom";

const InstructionDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: "enhanced-guide",
      title: "Hướng dẫn nâng cao",
      description:
        "Hệ thống hướng dẫn toàn diện với giao diện đẹp và tính năng tương tác",
      icon: <BookOpen className="w-6 h-6" />,
      color: "blue",
      features: [
        "Giao diện hiện đại với animation",
        "Hướng dẫn theo từng bước",
        "Theo dõi tiến độ học tập",
        "Phân loại theo độ khó",
        "Tích hợp với tất cả trang",
      ],
      link: "/huong-dan",
      isNew: true,
    },
    {
      id: "floating-guide",
      title: "Hướng dẫn nổi",
      description: "Hướng dẫn nhanh luôn có sẵn ở góc màn hình",
      icon: <Eye className="w-6 h-6" />,
      color: "purple",
      features: [
        "Luôn hiển thị ở góc màn hình",
        "Hướng dẫn nhanh cho người mới",
        "Tự động ẩn sau khi hoàn thành",
        "Giao diện compact và đẹp mắt",
      ],
      link: "/trang-chu",
      isPopular: true,
    },
    {
      id: "tour-guide",
      title: "Tour hướng dẫn",
      description: "Hướng dẫn tương tác trực tiếp trên trang web",
      icon: <MousePointer className="w-6 h-6" />,
      color: "green",
      features: [
        "Highlight các phần tử quan trọng",
        "Hướng dẫn tương tác trực tiếp",
        "Tự động phát hiện vị trí",
        "Hỗ trợ nhiều chủ đề khác nhau",
      ],
      link: "/trang-chu",
      isNew: true,
    },
    {
      id: "page-tours",
      title: "Tour theo trang",
      description: "Hướng dẫn chuyên biệt cho từng trang cụ thể",
      icon: <Globe className="w-6 h-6" />,
      color: "orange",
      features: [
        "Tour riêng cho từng trang",
        "Tự động phát hiện trang hiện tại",
        "Hướng dẫn phù hợp với ngữ cảnh",
        "Lưu trạng thái hoàn thành",
      ],
      link: "/khoa-hoc",
      isPopular: true,
    },
  ];

  const stats = [
    {
      label: "Tổng số bước hướng dẫn",
      value: "50+",
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: "Số trang được hỗ trợ",
      value: "15+",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: "Tính năng tương tác",
      value: "20+",
      icon: <Zap className="w-5 h-5" />,
    },
    { label: "Độ hài lòng", value: "98%", icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Hệ thống hướng dẫn toàn diện
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Khám phá các tính năng hướng dẫn mới được nâng cấp, giúp người dùng
            dễ dàng làm quen với Nam Long Center
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {demos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        demo.color === "blue"
                          ? "bg-blue-100 text-blue-600"
                          : demo.color === "purple"
                          ? "bg-purple-100 text-purple-600"
                          : demo.color === "green"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {demo.icon}
                    </div>
                    <div className="flex gap-1">
                      {demo.isNew && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          Mới
                        </Badge>
                      )}
                      {demo.isPopular && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-100 text-orange-800"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Phổ biến
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{demo.title}</CardTitle>
                  <p className="text-sm text-gray-600">{demo.description}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {demo.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      asChild
                      className={`w-full ${
                        demo.color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : demo.color === "purple"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : demo.color === "green"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      <Link to={demo.link}>
                        <Play className="w-4 h-4 mr-2" />
                        Thử ngay
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Sẵn sàng khám phá?</h3>
              <p className="text-blue-100 mb-6">
                Bắt đầu hành trình khám phá Nam Long Center với hệ thống hướng
                dẫn thông minh
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Link to="/huong-dan">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Xem hướng dẫn đầy đủ
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link to="/trang-chu">
                    <Rocket className="w-5 h-5 mr-2" />
                    Bắt đầu tour
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructionDemo;
