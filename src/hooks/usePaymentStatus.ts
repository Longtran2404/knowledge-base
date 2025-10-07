/**
 * Custom hook for real-time payment status updates
 */

import { useState, useEffect, useCallback } from "react";
import { orderManager } from "../lib/order/order-manager";
import type { Order } from "../lib/order/order-manager";

interface UsePaymentStatusOptions {
  orderId: string;
  pollInterval?: number; // milliseconds
  maxPollingTime?: number; // milliseconds
  onStatusChange?: (order: Order) => void;
  onPaymentSuccess?: (order: Order) => void;
  onPaymentFailed?: (order: Order) => void;
}

interface PaymentStatusResult {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  paymentStatus:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";
  refreshOrder: () => Promise<void>;
  stopPolling: () => void;
}

export function usePaymentStatus({
  orderId,
  pollInterval = 3000, // 3 seconds
  maxPollingTime = 300000, // 5 minutes
  onStatusChange,
  onPaymentSuccess,
  onPaymentFailed,
}: UsePaymentStatusOptions): PaymentStatusResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [startTime] = useState(Date.now());

  const fetchOrder = useCallback(async () => {
    try {
      const orderData = await orderManager.getOrder(orderId);
      if (orderData) {
        setOrder(orderData);
        setError(null);
        onStatusChange?.(orderData);

        // Check for status changes
        if (orderData.status === "paid" || orderData.status === "completed") {
          onPaymentSuccess?.(orderData);
        } else if (
          orderData.status === "failed" ||
          orderData.status === "cancelled"
        ) {
          onPaymentFailed?.(orderData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, onStatusChange, onPaymentSuccess, onPaymentFailed]);

  const refreshOrder = useCallback(async () => {
    setIsLoading(true);
    await fetchOrder();
  }, [fetchOrder]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Start polling when order is pending or processing
  useEffect(() => {
    if (
      !order ||
      order.status === "paid" ||
      order.status === "completed" ||
      order.status === "failed" ||
      order.status === "cancelled"
    ) {
      return;
    }

    // Check if max polling time has been reached
    if (Date.now() - startTime > maxPollingTime) {
      stopPolling();
      return;
    }

    const interval = setInterval(fetchOrder, pollInterval);
    setPollingInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [order, fetchOrder, pollInterval, maxPollingTime, startTime, stopPolling]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const paymentStatus =
    (order?.status as
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "cancelled") || "pending";

  return {
    order,
    isLoading,
    error,
    paymentStatus,
    refreshOrder,
    stopPolling,
  };
}
