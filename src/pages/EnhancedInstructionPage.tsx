import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  BookOpen,
  Play,
  Pause,
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
  Wifi,
} from "lucide-react";
import EnhancedInstructionGuide, {
  GuideSection,
} from "../components/guide/EnhancedInstructionGuide";
import InstructionDemo from "../components/guide/InstructionDemo";

const EnhancedInstructionPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid" | "timeline">(
    "list"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Bắt đầu với Nam Long Center",
      description:
        "Hướng dẫn cơ bản để làm quen với nền tảng và các tính năng chính",
      icon: <Rocket className="w-6 h-6" />,
      color: "blue",
      items: [
        {
          id: "intro-1",
          title: "Trang chủ",
          description:
            "Khám phá giao diện chính, hero section và các tính năng nổi bật của trang chủ",
          to: "/trang-chu",
          icon: <Home className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Cơ bản",
          isNew: true,
        },
        {
          id: "intro-2",
          title: "Giới thiệu về nền tảng",
          description:
            "Tìm hiểu về mục tiêu, giá trị cốt lõi và tầm nhìn của Nam Long Center",
          to: "/gioi-thieu",
          icon: <Target className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "5 phút",
          category: "Cơ bản",
        },
        {
          id: "intro-3",
          title: "Đăng nhập & Đăng ký",
          description:
            "Tạo tài khoản mới hoặc đăng nhập để truy cập đầy đủ tính năng",
          to: "/auth",
          icon: <Users className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "2 phút",
          category: "Cơ bản",
          isPopular: true,
        },
        {
          id: "intro-4",
          title: "Tìm kiếm toàn cục",
          description:
            "Sử dụng tính năng tìm kiếm để nhanh chóng tìm kiếm nội dung mong muốn",
          icon: <Search className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "2 phút",
          category: "Cơ bản",
        },
      ],
    },
    {
      id: "learning",
      title: "Học tập & Phát triển",
      description:
        "Khám phá các khóa học, tài nguyên học tập và cơ hội phát triển kỹ năng",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "green",
      items: [
        {
          id: "learn-1",
          title: "Khóa học",
          description: "Duyệt và tham gia các khóa học từ cơ bản đến nâng cao",
          to: "/khoa-hoc",
          icon: <GraduationCap className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "5 phút",
          category: "Học tập",
        },
        {
          id: "learn-2",
          title: "Thư viện tài nguyên",
          description:
            "Truy cập thư viện tài liệu, video, và tài nguyên miễn phí",
          to: "/tai-nguyen",
          icon: <FileText className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "4 phút",
          category: "Học tập",
        },
        {
          id: "learn-3",
          title: "Blog & Tin tức",
          description:
            "Đọc các bài viết chuyên sâu, cập nhật mới nhất và chia sẻ kinh nghiệm",
          to: "/blog",
          icon: <FileText className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "6 phút",
          category: "Học tập",
        },
        {
          id: "learn-4",
          title: "Hồ sơ học tập",
          description:
            "Theo dõi tiến độ học tập, chứng chỉ và thành tích đạt được",
          to: "/profile",
          icon: <Trophy className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "3 phút",
          category: "Học tập",
        },
      ],
    },
    {
      id: "shopping",
      title: "Mua sắm & Dịch vụ",
      description: "Khám phá sản phẩm, dịch vụ và các gói đăng ký phù hợp",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "purple",
      items: [
        {
          id: "shop-1",
          title: "Sản phẩm",
          description: "Xem và mua các sản phẩm chất lượng cao",
          to: "/san-pham",
          icon: <ShoppingCart className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "4 phút",
          category: "Mua sắm",
        },
        {
          id: "shop-2",
          title: "Marketplace",
          description:
            "Khám phá thị trường, giao dịch và mua bán với cộng đồng",
          to: "/marketplace",
          icon: <Globe className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "6 phút",
          category: "Mua sắm",
          isNew: true,
        },
        {
          id: "shop-3",
          title: "Gói dịch vụ",
          description:
            "Xem và so sánh các gói dịch vụ Free, Premium và Partner",
          to: "/goi-dich-vu",
          icon: <Settings className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "5 phút",
          category: "Mua sắm",
          isPopular: true,
        },
        {
          id: "shop-4",
          title: "Thanh toán",
          description:
            "Tìm hiểu các phương thức thanh toán an toàn và tiện lợi",
          icon: <Shield className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Mua sắm",
        },
      ],
    },
    {
      id: "collaboration",
      title: "Hợp tác & Cộng đồng",
      description:
        "Tham gia cộng đồng, tìm cơ hội hợp tác và phát triển mạng lưới",
      icon: <Handshake className="w-6 h-6" />,
      color: "orange",
      items: [
        {
          id: "collab-1",
          title: "Cơ hội hợp tác",
          description: "Tìm hiểu và tham gia các chương trình hợp tác, đối tác",
          to: "/hop-tac",
          icon: <Handshake className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "7 phút",
          category: "Hợp tác",
        },
        {
          id: "collab-2",
          title: "Cộng đồng",
          description: "Tham gia thảo luận, chia sẻ kinh nghiệm với cộng đồng",
          icon: <Users className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "4 phút",
          category: "Cộng đồng",
        },
        {
          id: "collab-3",
          title: "Hồ sơ cá nhân",
          description:
            "Quản lý thông tin cá nhân, cài đặt tài khoản và bảo mật",
          to: "/profile",
          icon: <Users className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Cá nhân",
        },
        {
          id: "collab-4",
          title: "Thông báo",
          description:
            "Cài đặt và quản lý thông báo để không bỏ lỡ cập nhật quan trọng",
          icon: <Bell className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "2 phút",
          category: "Cá nhân",
        },
      ],
    },
    {
      id: "advanced",
      title: "Tính năng nâng cao",
      description: "Khám phá các tính năng chuyên sâu và công cụ quản lý",
      icon: <Zap className="w-6 h-6" />,
      color: "red",
      items: [
        {
          id: "adv-1",
          title: "Dashboard quản lý",
          description:
            "Sử dụng bảng điều khiển để quản lý nội dung và thống kê",
          to: "/manager",
          icon: <Monitor className="w-4 h-4" />,
          difficulty: "hard",
          estimatedTime: "10 phút",
          category: "Nâng cao",
        },
        {
          id: "adv-2",
          title: "Tùy chỉnh giao diện",
          description: "Cá nhân hóa giao diện theo sở thích và nhu cầu sử dụng",
          icon: <Settings className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "5 phút",
          category: "Nâng cao",
        },
        {
          id: "adv-3",
          title: "Tích hợp API",
          description: "Tìm hiểu cách tích hợp API cho các ứng dụng bên thứ ba",
          icon: <Globe className="w-4 h-4" />,
          difficulty: "hard",
          estimatedTime: "15 phút",
          category: "Nâng cao",
        },
        {
          id: "adv-4",
          title: "Báo cáo & Phân tích",
          description: "Xem báo cáo chi tiết về hoạt động và hiệu suất",
          icon: <Award className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "8 phút",
          category: "Nâng cao",
        },
      ],
    },
    {
      id: "mobile",
      title: "Sử dụng trên thiết bị di động",
      description: "Tối ưu hóa trải nghiệm sử dụng trên smartphone và tablet",
      icon: <Smartphone className="w-6 h-6" />,
      color: "indigo",
      items: [
        {
          id: "mobile-1",
          title: "Ứng dụng di động",
          description:
            "Tải và sử dụng ứng dụng di động cho trải nghiệm tốt nhất",
          icon: <Smartphone className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Di động",
        },
        {
          id: "mobile-2",
          title: "Giao diện responsive",
          description:
            "Tìm hiểu cách sử dụng giao diện thích ứng trên các thiết bị khác nhau",
          icon: <Laptop className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "2 phút",
          category: "Di động",
        },
        {
          id: "mobile-3",
          title: "Tính năng offline",
          description: "Sử dụng các tính năng khi không có kết nối internet",
          icon: <Wifi className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "4 phút",
          category: "Di động",
        },
      ],
    },
  ];

  const categories = [
    "Tất cả",
    "Cơ bản",
    "Học tập",
    "Mua sắm",
    "Hợp tác",
    "Cộng đồng",
    "Cá nhân",
    "Nâng cao",
    "Di động",
  ];

  const getTotalSteps = () => {
    return sections.reduce((total, section) => total + section.items.length, 0);
  };

  const getCompletedSteps = () => {
    try {
      const raw = localStorage.getItem("nlc_enhanced_guide_items_done");
      if (!raw) return 0;
      const arr: string[] = JSON.parse(raw);
      return arr.length;
    } catch {
      return 0;
    }
  };

  const totalSteps = getTotalSteps();
  const completedSteps = getCompletedSteps();
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const resetProgress = () => {
    localStorage.removeItem("nlc_enhanced_guide_items_done");
    localStorage.removeItem("nlc_enhanced_guide_completed");
    window.location.reload();
  };

  const markCompleted = () => {
    localStorage.setItem("nlc_enhanced_guide_completed", "1");
    window.location.reload();
  };

  const isCompleted =
    typeof window !== "undefined" &&
    localStorage.getItem("nlc_enhanced_guide_completed") === "1";

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chúc mừng! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn đã hoàn thành hướng dẫn toàn diện về Nam Long Center. Bây giờ
              bạn có thể khám phá tất cả tính năng một cách tự tin!
            </p>

            <div className="space-y-3">
              <Button
                onClick={resetProgress}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Xem lại hướng dẫn
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/trang-chu")}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Demo Section */}
      <InstructionDemo />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Hướng dẫn toàn diện
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Khám phá tất cả tính năng của Nam Long Center một cách dễ dàng và
              hiệu quả. Từ cơ bản đến nâng cao, chúng tôi sẽ hướng dẫn bạn từng
              bước một.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{totalSteps}</div>
                <div className="text-sm text-blue-100">Bước hướng dẫn</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{completedSteps}</div>
                <div className="text-sm text-blue-100">Đã hoàn thành</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-blue-100">Tiến độ</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedInstructionGuide
            sections={sections}
            initiallyOpenIds={["getting-started"]}
            onComplete={markCompleted}
            storageKey="nlc_enhanced_guide_items_done"
            mode="all"
            viewMode={viewMode}
            showProgress={true}
            showStats={true}
            autoPlay={isPlaying}
            onViewModeChange={setViewMode}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedInstructionPage;
