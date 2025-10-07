/**
 * Notification Center Component
 * Real-time notification display and management
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  BellRing,
  Check,
  CheckCircle,
  Clock,
  X,
  Settings,
  Filter,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNLCRealtime";
import { nlcApi } from "../../lib/api/nlc-database-api";
import type { NLCNotification } from "../../types/database";

// Import missing icons
import { BookOpen, CreditCard, UserCheck, Heart } from "lucide-react";

interface NotificationCenterProps {
  compact?: boolean;
  maxHeight?: string;
  showHeader?: boolean;
  onNotificationClick?: (notification: NLCNotification) => void;
}

export function NotificationCenter({
  compact = false,
  maxHeight = "400px",
  showHeader = true,
  onNotificationClick,
}: NotificationCenterProps) {
  const { notifications, unreadCount, requestNotificationPermission } =
    useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Permission request on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      (filter === "read" && notification.is_read);

    const matchesTypeFilter =
      selectedType === "all" || notification.notification_type === selectedType;

    return matchesReadFilter && matchesTypeFilter;
  });

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setIsLoading(true);
      const response = await nlcApi.notifications.markAsRead(notificationId);
      if (!response.success) {
        console.error("Failed to mark notification as read:", response.error);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      if (unreadNotifications.length === 0) return;

      // Mark all as read in parallel
      await Promise.all(
        unreadNotifications.map((notification) =>
          nlcApi.notifications.markAsRead(notification.id)
        )
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NLCNotification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Call external handler
    onNotificationClick?.(notification);

    // Navigate to action URL if available
    if (notification.action_url) {
      window.open(notification.action_url, "_blank");
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const className = `w-4 h-4 ${
      priority === "high" || priority === "urgent"
        ? "text-red-500"
        : priority === "normal"
        ? "text-blue-500"
        : "text-gray-500"
    }`;

    switch (type) {
      case "course":
        return <BookOpen className={className} />;
      case "payment":
        return <CreditCard className={className} />;
      case "approval":
        return <UserCheck className={className} />;
      case "system":
        return <Settings className={className} />;
      case "welcome":
        return <Heart className={className} />;
      case "reminder":
        return <Clock className={className} />;
      default:
        return <Bell className={className} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="text-xs">
            Khẩn cấp
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-800"
          >
            Quan trọng
          </Badge>
        );
      case "normal":
        return (
          <Badge variant="outline" className="text-xs">
            Thường
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-xs text-gray-500">
            Thấp
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Get unique notification types
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.notification_type))
  );

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5 text-blue-600" />
              ) : (
                <Bell className="w-5 h-5 text-gray-500" />
              )}
              Thông báo
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Đọc tất cả
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          {!compact && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1">
                {["all", "unread", "read"].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(filterType as any)}
                  >
                    {filterType === "all"
                      ? "Tất cả"
                      : filterType === "unread"
                      ? "Chưa đọc"
                      : "Đã đọc"}
                  </Button>
                ))}
              </div>

              {notificationTypes.length > 1 && (
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tất cả loại</option>
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "course"
                        ? "Khóa học"
                        : type === "payment"
                        ? "Thanh toán"
                        : type === "approval"
                        ? "Phê duyệt"
                        : type === "system"
                        ? "Hệ thống"
                        : type === "welcome"
                        ? "Chào mừng"
                        : type === "reminder"
                        ? "Nhắc nhở"
                        : type}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : filter === "read"
                  ? "Không có thông báo đã đọc"
                  : "Chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(
                        notification.notification_type,
                        notification.notification_priority
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4
                            className={`font-medium text-sm ${
                              !notification.is_read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {getPriorityBadge(notification.notification_priority)}
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.notification_type === "course"
                              ? "Khóa học"
                              : notification.notification_type === "payment"
                              ? "Thanh toán"
                              : notification.notification_type === "admin"
                              ? "Quản trị"
                              : notification.notification_type === "system"
                              ? "Hệ thống"
                              : "Chung"}
                          </Badge>

                          {notification.action_url && (
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          )}
                        </div>

                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3" />
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
