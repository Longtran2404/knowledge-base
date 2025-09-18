import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Bell,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        bgGradient: "from-emerald-50 via-green-50 to-teal-50",
        borderColor: "border-emerald-200",
        iconColor: "text-emerald-600",
        shadow: "shadow-emerald-200/50",
        ringColor: "ring-emerald-500/20",
      },
      error: {
        icon: XCircle,
        gradient: "from-red-500 via-pink-500 to-rose-500",
        bgGradient: "from-red-50 via-pink-50 to-rose-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        shadow: "shadow-red-200/50",
        ringColor: "ring-red-500/20",
      },
      warning: {
        icon: AlertTriangle,
        gradient: "from-amber-500 via-orange-500 to-yellow-500",
        bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
        borderColor: "border-amber-200",
        iconColor: "text-amber-600",
        shadow: "shadow-amber-200/50",
        ringColor: "ring-amber-500/20",
      },
      info: {
        icon: Info,
        gradient: "from-blue-500 via-indigo-500 to-purple-500",
        bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        shadow: "shadow-blue-200/50",
        ringColor: "ring-blue-500/20",
      },
    };
    return configs[type];
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : 300,
        scale: isVisible ? 1 : 0.8,
      }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.4,
      }}
      className={`
        relative max-w-sm w-full
        bg-gradient-to-br ${config.bgGradient}
        border ${config.borderColor}
        rounded-2xl
        shadow-2xl ${config.shadow}
        ring-4 ${config.ringColor}
        backdrop-blur-xl
        overflow-hidden
        group
        hover:scale-[1.02]
        hover:shadow-3xl
        transition-all duration-300
      `}
    >
      {/* Animated background gradient overlay */}
      <div
        className={`
        absolute inset-0
        bg-gradient-to-r ${config.gradient}
        opacity-5
        group-hover:opacity-10
        transition-opacity duration-300
      `}
      />

      {/* Sparkle effect */}
      <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <Sparkles className="w-4 h-4 text-gray-400" />
      </div>

      {/* Main content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon with animated background */}
          <div
            className={`
            flex-shrink-0
            w-10 h-10
            rounded-xl
            bg-gradient-to-br ${config.gradient}
            flex items-center justify-center
            shadow-lg
            group-hover:scale-110
            transition-transform duration-300
          `}
          >
            <Icon className="w-5 h-5 text-white drop-shadow-sm" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {toast.title}
                </h3>
                {toast.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {toast.description}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className={`
                      mt-2 text-xs font-medium
                      bg-gradient-to-r ${config.gradient}
                      text-white
                      px-3 py-1.5
                      rounded-lg
                      hover:shadow-lg
                      transform hover:scale-105
                      transition-all duration-200
                    `}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onRemove(toast.id), 300);
                }}
                className="
                  flex-shrink-0 ml-2
                  w-6 h-6
                  rounded-full
                  bg-white/50
                  hover:bg-white/80
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-110
                  backdrop-blur-sm
                "
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <motion.div
          className={`
            absolute bottom-0 left-0 h-1
            bg-gradient-to-r ${config.gradient}
            rounded-full
          `}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (toast.duration || 5000) / 1000,
            ease: "linear",
          }}
        />
      </div>

      {/* Animated border shine effect */}
      <div
        className="
        absolute inset-0
        rounded-2xl
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        opacity-0
        group-hover:opacity-100
        group-hover:animate-[shimmer_1.5s_ease-in-out]
        pointer-events-none
      "
      />
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (!document.body) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

class EnhancedToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  subscribe(callback: (toasts: Toast[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((callback) => callback([...this.toasts]));
  }

  private addToast(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };

    this.toasts.push(newToast);
    this.notify();

    return id;
  }

  success(title: string, description?: string, options?: Partial<Toast>) {
    return this.addToast({
      type: "success",
      title,
      description,
      ...options,
    });
  }

  error(title: string, description?: string, options?: Partial<Toast>) {
    return this.addToast({
      type: "error",
      title,
      description,
      duration: 7000, // Longer duration for errors
      ...options,
    });
  }

  warning(title: string, description?: string, options?: Partial<Toast>) {
    return this.addToast({
      type: "warning",
      title,
      description,
      ...options,
    });
  }

  info(title: string, description?: string, options?: Partial<Toast>) {
    return this.addToast({
      type: "info",
      title,
      description,
      ...options,
    });
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const enhancedToast = new EnhancedToastManager();

export const EnhancedToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = enhancedToast.subscribe(setToasts);
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return (
    <>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={enhancedToast.remove.bind(enhancedToast)}
      />
    </>
  );
};

// CSS Animation for shimmer effect (add to your global CSS)
export const shimmerAnimation = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;
