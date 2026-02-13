/**
 * Modern Loading Component - Beautiful animated loading overlay
 * Có thể tái sử dụng cho toàn bộ website
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Sparkles } from "lucide-react";

interface ModernLoadingProps {
  isLoading: boolean;
  message?: string;
  submessage?: string;
  icon?: "upload" | "loader" | "sparkles";
}

export const ModernLoading: React.FC<ModernLoadingProps> = ({
  isLoading,
  message = "Đang tải dữ liệu",
  submessage = "Vui lòng đợi trong giây lát...",
  icon = "loader",
}) => {
  const getIcon = () => {
    switch (icon) {
      case "upload":
        return <Upload className="h-12 w-12 text-white" />;
      case "sparkles":
        return <Sparkles className="h-12 w-12 text-white" />;
      default:
        return <Loader2 className="h-12 w-12 text-white animate-spin" />;
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative"
          >
            {/* Glowing background */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>

            {/* Card */}
            <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-strong">
              <div className="flex flex-col items-center space-y-6">
                {/* Animated Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-50 animate-pulse"></div>
                  <motion.div
                    animate={{
                      y: icon === "loader" ? 0 : [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative gradient-bg-primary p-6 rounded-2xl"
                  >
                    {getIcon()}
                  </motion.div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold gradient-text">
                    {message}
                  </h3>
                  <p className="text-muted-foreground text-sm">{submessage}</p>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Loading Dots */}
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModernLoading;
