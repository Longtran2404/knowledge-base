/**
 * Payment Demo Component - Test all payment features
 */

import React, { useState } from "react";
import { PaymentProcessor } from "./PaymentProcessor";
import { AutoRefresh } from "../AutoRefresh";
import { NotificationProvider, useNotifications } from "../NotificationSystem";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useFadeIn, useSlideUp } from "../../hooks/useAnimations";
import { orderManager } from "../../lib/order/order-manager";
import type { Order } from "../../lib/order/order-manager";

// Mock order for testing
const mockOrder: Order = {
  id: "demo-order-123",
  orderNumber: "NLC2501001",
  userId: "demo-user-123",
  items: [
    {
      id: "item-1",
      type: "course",
      refId: "course-123",
      title: "React Development Course",
      description: "Learn React from basics to advanced",
      price: 500000, // $500.00 in cents
      quantity: 1,
      discount: 0,
    },
    {
      id: "item-2",
      type: "product",
      refId: "product-456",
      title: "Development Tools Package",
      description: "Essential tools for developers",
      price: 200000, // $200.00 in cents
      quantity: 2,
      discount: 50000, // $50.00 discount
    },
  ],
  subtotal: 900000, // $900.00
  discount: 50000, // $50.00
  shippingFee: 25000, // $25.00
  tax: 87500, // $87.50
  total: 962500, // $962.50
  currency: "USD",
  status: "pending",
  paymentStatus: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function PaymentDemoContent() {
  const [currentOrder, setCurrentOrder] = useState<Order>(mockOrder);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { addNotification } = useNotifications();

  // Animation hooks
  const fadeIn = useFadeIn(100);
  const slideUp = useSlideUp(200);

  const createNewOrder = async () => {
    setIsCreatingOrder(true);
    try {
      // Simulate creating a new order
      const newOrder: Order = {
        ...mockOrder,
        id: `demo-order-${Date.now()}`,
        orderNumber: `NLC${Date.now()}`,
        total: Math.floor(Math.random() * 1000000) + 100000, // Random amount
      };

      setCurrentOrder(newOrder);

      addNotification({
        type: "success",
        title: "Đơn hàng mới đã được tạo",
        message: `Đơn hàng ${newOrder.orderNumber} đã sẵn sàng để thanh toán.`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Lỗi tạo đơn hàng",
        message: "Không thể tạo đơn hàng mới. Vui lòng thử lại.",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    // Update order status
    setCurrentOrder((prev) => ({
      ...prev,
      status: "paid",
      paymentStatus: "completed",
      transactionId,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePaymentFailed = (error: string) => {
    console.error("Payment failed:", error);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto" {...fadeIn}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              💳 Payment System Demo
            </h1>
            <p className="text-gray-600 mt-2">
              Test Stripe payment integration with real-time updates and
              animations
            </p>
          </div>

          {/* Auto-refresh controls */}
          <div className="flex items-center gap-4">
            <AutoRefresh
              interval={30000}
              enabled={true}
              onRefresh={() => {
                addNotification({
                  type: "info",
                  title: "Trang đã được cập nhật",
                  message: "Dữ liệu mới nhất đã được tải.",
                });
              }}
            />
          </div>
        </div>

        {/* Demo Controls */}
        <Card className="mb-6" {...slideUp}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Demo Controls</span>
              <Badge variant="secondary">Test Mode</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={createNewOrder}
                disabled={isCreatingOrder}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreatingOrder ? "Đang tạo..." : "Tạo đơn hàng mới"}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reset Demo
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Test Cards:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  <strong>Success:</strong> 4242 4242 4242 4242
                </div>
                <div>
                  <strong>Decline:</strong> 4000 0000 0000 0002
                </div>
                <div>
                  <strong>Insufficient funds:</strong> 4000 0000 0000 9995
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Processor */}
        <PaymentProcessor
          order={currentOrder}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
          className="animate-in slide-in-from-bottom-4 duration-500"
        />

        {/* Features List */}
        <Card className="mt-8" {...slideUp}>
          <CardHeader>
            <CardTitle>✨ Tính năng đã triển khai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">
                  💳 Payment Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Stripe Direct Card Payments</li>
                  <li>✅ Visa/Mastercard Support</li>
                  <li>✅ Real-time Payment Status</li>
                  <li>✅ Commission System</li>
                  <li>✅ Error Handling</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">🎨 UI/UX Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Smooth Animations</li>
                  <li>✅ Auto-refresh</li>
                  <li>✅ Real-time Notifications</li>
                  <li>✅ Progress Indicators</li>
                  <li>✅ Responsive Design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PaymentDemo() {
  return (
    <NotificationProvider>
      <PaymentDemoContent />
    </NotificationProvider>
  );
}
