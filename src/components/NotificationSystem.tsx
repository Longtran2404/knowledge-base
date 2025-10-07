/**
 * Notification System for payment status updates
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useFadeIn, useSlideUp } from "../hooks/useAnimations";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  actions?: Array<{
    label: string;
    action: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newNotification: Notification = {
        id,
        duration: 5000, // 5 seconds default
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, newNotification.duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>,
    document.body
  );
}

function NotificationItem({
  notification,
  index,
  onRemove,
}: {
  notification: Notification;
  index: number;
  onRemove: () => void;
}) {
  const slideUp = useSlideUp(index * 100);
  const fadeIn = useFadeIn(index * 100);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border shadow-lg ${getStyles()} ${
        slideUp.className
      } ${fadeIn.className}`}
      ref={slideUp.ref}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{notification.title}</div>
          <div className="text-sm opacity-90 mt-1">{notification.message}</div>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notification.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={action.action}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Predefined notification helpers
export function usePaymentNotifications() {
  const { addNotification } = useNotifications();

  const notifyPaymentSuccess = useCallback(
    (transactionId: string) => {
      addNotification({
        type: "success",
        title: "Thanh toán thành công!",
        message: `Giao dịch ${transactionId} đã được xử lý thành công.`,
        actions: [
          {
            label: "Xem chi tiết",
            action: () => {
              // Navigate to order details
              console.log("Navigate to order details");
            },
          },
        ],
      });
    },
    [addNotification]
  );

  const notifyPaymentFailed = useCallback(
    (error: string) => {
      addNotification({
        type: "error",
        title: "Thanh toán thất bại",
        message: error,
        actions: [
          {
            label: "Thử lại",
            action: () => {
              // Retry payment
              console.log("Retry payment");
            },
          },
        ],
      });
    },
    [addNotification]
  );

  const notifyPaymentProcessing = useCallback(() => {
    addNotification({
      type: "info",
      title: "Đang xử lý thanh toán",
      message: "Vui lòng chờ trong giây lát...",
      duration: 0, // Persistent until manually dismissed
    });
  }, [addNotification]);

  return {
    notifyPaymentSuccess,
    notifyPaymentFailed,
    notifyPaymentProcessing,
  };
}
