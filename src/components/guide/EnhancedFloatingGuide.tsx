import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  BookOpen,
  X,
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
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";
import EnhancedInstructionGuide, {
  GuideSection,
} from "./EnhancedInstructionGuide";

const STORAGE_KEY = "nlc_enhanced_guide_completed";
const FLOATING_STORAGE_KEY = "nlc_floating_guide_dismissed";

const EnhancedFloatingGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const completed = useMemo(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(STORAGE_KEY) === "1",
    []
  );

  const isDismissed = useMemo(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(FLOATING_STORAGE_KEY) === "1",
    []
  );

  useEffect(() => {
    setDismissed(isDismissed);
  }, [isDismissed]);

  if (completed || dismissed) return null;

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "Bắt đầu",
      description: "Hướng dẫn cơ bản để làm quen với nền tảng",
      icon: <Zap className="w-5 h-5" />,
      color: "blue",
      items: [
        {
          id: "flt-home-1",
          title: "Trang chủ",
          description: "Khám phá giao diện chính và các tính năng nổi bật",
          to: "/trang-chu",
          icon: <Home className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "2 phút",
          category: "Cơ bản",
          isNew: true,
        },
        {
          id: "flt-intro-1",
          title: "Giới thiệu",
          description: "Tìm hiểu về mục tiêu và giá trị của nền tảng",
          to: "/gioi-thieu",
          icon: <Target className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Cơ bản",
        },
        {
          id: "flt-auth-1",
          title: "Đăng nhập/Đăng ký",
          description: "Tạo tài khoản và bắt đầu sử dụng",
          to: "/auth",
          icon: <Users className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "1 phút",
          category: "Cơ bản",
          isPopular: true,
        },
      ],
    },
    {
      id: "learning",
      title: "Học tập",
      description: "Các khóa học và tài nguyên học tập",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "green",
      items: [
        {
          id: "flt-courses-1",
          title: "Khóa học",
          description: "Khám phá các khóa học có sẵn",
          to: "/khoa-hoc",
          icon: <GraduationCap className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "5 phút",
          category: "Học tập",
        },
        {
          id: "flt-resources-1",
          title: "Tài nguyên",
          description: "Thư viện tài liệu và tài nguyên miễn phí",
          to: "/tai-nguyen",
          icon: <FileText className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Học tập",
        },
        {
          id: "flt-blog-1",
          title: "Blog",
          description: "Đọc các bài viết và cập nhật mới nhất",
          to: "/blog",
          icon: <FileText className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "4 phút",
          category: "Học tập",
        },
      ],
    },
    {
      id: "shopping",
      title: "Mua sắm",
      description: "Sản phẩm và dịch vụ",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "purple",
      items: [
        {
          id: "flt-products-1",
          title: "Sản phẩm",
          description: "Xem các sản phẩm có sẵn",
          to: "/san-pham",
          icon: <ShoppingCart className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Mua sắm",
        },
        {
          id: "flt-marketplace-1",
          title: "Marketplace",
          description: "Khám phá thị trường và giao dịch",
          to: "/marketplace",
          icon: <ShoppingCart className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "5 phút",
          category: "Mua sắm",
          isNew: true,
        },
        {
          id: "flt-pricing-1",
          title: "Gói dịch vụ",
          description: "Xem các gói dịch vụ và giá cả",
          to: "/goi-dich-vu",
          icon: <Settings className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "4 phút",
          category: "Mua sắm",
          isPopular: true,
        },
      ],
    },
    {
      id: "collaboration",
      title: "Hợp tác",
      description: "Cơ hội hợp tác và phát triển",
      icon: <Handshake className="w-5 h-5" />,
      color: "orange",
      items: [
        {
          id: "flt-partnership-1",
          title: "Hợp tác",
          description: "Tìm hiểu cơ hội hợp tác",
          to: "/hop-tac",
          icon: <Handshake className="w-4 h-4" />,
          difficulty: "medium",
          estimatedTime: "6 phút",
          category: "Hợp tác",
        },
        {
          id: "flt-profile-1",
          title: "Hồ sơ cá nhân",
          description: "Quản lý thông tin cá nhân",
          to: "/profile",
          icon: <Users className="w-4 h-4" />,
          difficulty: "easy",
          estimatedTime: "3 phút",
          category: "Cá nhân",
        },
      ],
    },
  ];

  const markCompleted = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const dismissGuide = () => {
    localStorage.setItem(FLOATING_STORAGE_KEY, "1");
    setDismissed(true);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

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

  return (
    <div className="fixed left-4 bottom-4 z-[70]">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-96 max-h-[80vh] overflow-hidden"
          >
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <h3 className="font-semibold">Hướng dẫn nhanh</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAutoPlay}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={dismissGuide}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tiến độ</span>
                      <span>
                        {completedSteps}/{totalSteps}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  <EnhancedInstructionGuide
                    sections={sections}
                    initiallyOpenIds={["getting-started"]}
                    onComplete={markCompleted}
                    storageKey="nlc_enhanced_guide_items_done"
                    mode="all"
                    viewMode="list"
                    showProgress={false}
                    showStats={false}
                    autoPlay={isPlaying}
                  />
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={markCompleted}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Hoàn thành
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      size="sm"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-3"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Hướng dẫn
              {completedSteps > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white text-blue-600 text-xs"
                >
                  {completedSteps}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFloatingGuide;
