/**
 * Auto-refresh component for automatic page updates
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { RefreshCw, Clock, Wifi, WifiOff } from "lucide-react";
import { Badge } from "./ui/badge";

interface AutoRefreshProps {
  interval?: number; // milliseconds
  enabled?: boolean;
  onRefresh?: () => void;
  showStatus?: boolean;
  className?: string;
}

export function AutoRefresh({
  interval = 30000, // 30 seconds default
  enabled = true,
  onRefresh,
  showStatus = true,
  className = "",
}: AutoRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [nextRefresh, setNextRefresh] = useState<Date>(
    new Date(Date.now() + interval)
  );

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (isRefreshing || !isOnline) return;

    setIsRefreshing(true);
    try {
      // Trigger custom refresh callback
      onRefresh?.();

      // Update timestamps
      setLastRefresh(new Date());
      setNextRefresh(new Date(Date.now() + interval));
    } catch (error) {
      console.error("Auto-refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isOnline, onRefresh, interval]);

  // Auto-refresh timer
  useEffect(() => {
    if (!enabled || !isOnline) return;

    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [enabled, isOnline, refresh, interval]);

  // Update next refresh time display
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefresh(new Date(Date.now() + interval));
    }, 1000);

    return () => clearInterval(timer);
  }, [interval]);

  const formatTimeUntilRefresh = (nextRefreshTime: Date) => {
    const now = new Date();
    const diff = nextRefreshTime.getTime() - now.getTime();

    if (diff <= 0) return "0s";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!showStatus) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </Badge>

      {/* Auto-refresh Status */}
      {enabled && isOnline && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Auto-refresh: {formatTimeUntilRefresh(nextRefresh)}</span>
        </Badge>
      )}

      {/* Manual Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={refresh}
        disabled={isRefreshing || !isOnline}
        className="flex items-center gap-2"
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        {isRefreshing ? "Đang tải..." : "Tải lại"}
      </Button>

      {/* Last Refresh Time */}
      <span className="text-xs text-gray-500">
        Cập nhật lần cuối: {lastRefresh.toLocaleTimeString("vi-VN")}
      </span>
    </div>
  );
}

// Hook for auto-refresh functionality
export function useAutoRefresh(
  interval: number = 30000,
  enabled: boolean = true
) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(triggerRefresh, interval);
    return () => clearInterval(timer);
  }, [enabled, interval, triggerRefresh]);

  return {
    refreshKey,
    triggerRefresh,
  };
}
