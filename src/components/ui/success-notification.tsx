import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Gift, Star, Sparkles } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";

interface SuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: "registration" | "success" | "welcome" | "achievement";
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function SuccessNotification({
  isVisible,
  onClose,
  title = "Đăng ký thành công!",
  message = "Chào mừng bạn đến với Knowledge Base",
  type = "registration",
  autoClose = true,
  duration = 5000,
  className,
}: SuccessNotificationProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);

    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "registration":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "welcome":
        return <Gift className="w-8 h-8 text-blue-500" />;
      case "achievement":
        return <Star className="w-8 h-8 text-yellow-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case "registration":
        return "from-green-500 via-emerald-500 to-teal-500";
      case "welcome":
        return "from-blue-500 via-indigo-500 to-purple-500";
      case "achievement":
        return "from-yellow-400 via-orange-500 to-red-500";
      default:
        return "from-green-500 via-emerald-500 to-teal-500";
    }
  };

  const confettiElements = Array.from({ length: 12 }, (_, i) => (
    <motion.div
      key={i}
      className={`absolute w-2 h-2 ${
        i % 3 === 0
          ? "bg-yellow-400"
          : i % 3 === 1
          ? "bg-pink-400"
          : "bg-blue-400"
      } rounded-full`}
      initial={{
        opacity: 0,
        y: 20,
        x: Math.random() * 400 - 200,
        rotate: 0,
      }}
      animate={
        show
          ? {
              opacity: [0, 1, 1, 0],
              y: [20, -100, -200, -300],
              x: Math.random() * 200 - 100,
              rotate: 360,
            }
          : {}
      }
      transition={{
        duration: 3,
        delay: Math.random() * 0.5,
        ease: "easeOut",
      }}
      style={{
        left: `${50 + Math.random() * 200 - 100}%`,
        top: "50%",
      }}
    />
  ));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShow(false);
              setTimeout(onClose, 300);
            }
          }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiElements}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative max-w-md w-full"
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-md">
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-10`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                      "linear-gradient(225deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                      "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 hover:bg-white/20"
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="w-4 h-4" />
              </Button>

              <CardContent className="p-8 text-center relative">
                {/* Main icon with pulse animation */}
                <motion.div
                  className="mb-6 flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {getIcon()}

                    {/* Sparkle effects */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className={`text-2xl font-bold bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent mb-3`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  className="text-gray-600 text-lg mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {message}
                </motion.p>

                {/* Benefits list */}
                {type === "registration" && (
                  <motion.div
                    className="space-y-2 mb-6 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Truy cập miễn phí tất cả khóa học cơ bản</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Tải xuống tài liệu và templates</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Nhận chứng chỉ sau khi hoàn thành</span>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  className="flex gap-3 flex-col sm:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    className={`flex-1 bg-gradient-to-r ${getGradient()} hover:opacity-90 text-white border-0 shadow-lg`}
                    onClick={() => {
                      setShow(false);
                      setTimeout(onClose, 300);
                    }}
                  >
                    Bắt đầu khám phá
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-gray-50"
                    onClick={() => {
                      setShow(false);
                      setTimeout(onClose, 300);
                    }}
                  >
                    Đóng
                  </Button>
                </motion.div>

                {/* Progress indicator */}
                {autoClose && (
                  <motion.div
                    className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getGradient()}`}
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: duration / 1000, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy usage
export function useSuccessNotification() {
  const [notification, setNotification] = useState({
    isVisible: false,
    title: "",
    message: "",
    type: "success" as "registration" | "success" | "welcome" | "achievement",
  });

  const showNotification = (config: {
    title?: string;
    message?: string;
    type?: "registration" | "success" | "welcome" | "achievement";
  }) => {
    setNotification({
      isVisible: true,
      title: config.title || "Thành công!",
      message: config.message || "Thao tác đã được thực hiện thành công",
      type: config.type || "success",
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
