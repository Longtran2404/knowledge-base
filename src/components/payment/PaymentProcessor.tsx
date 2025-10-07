/**
 * Direct Card Payment Component - READY FOR REAL TESTING
 * Visa/Mastercard payment with Stripe Elements
 */

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Loader2,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  stripeService,
  StripeService,
  STRIPE_CONFIG,
} from "../../lib/payment/stripe";
import { orderManager } from "../../lib/order/order-manager";
import { formatDate } from "../../lib/shared/formatters";
import { usePaymentStatus } from "../../hooks/usePaymentStatus";
import {
  useFadeIn,
  useSlideUp,
  useScale,
  useProgressBar,
} from "../../hooks/useAnimations";
import { usePaymentNotifications } from "../NotificationSystem";
import type { Order } from "../../lib/order/order-manager";

interface PaymentProcessorProps {
  order: Order;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailed?: (error: string) => void;
  className?: string;
}

// Stripe Elements wrapper
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

// Card Payment Form Component
function CardPaymentForm({
  order,
  onPaymentSuccess,
  onPaymentFailed,
}: {
  order: Order;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailed?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
    phone: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Không tìm thấy thông tin thẻ");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create Payment Intent
      const paymentIntent = await stripeService.createPaymentIntent({
        orderId: order.id,
        amount: StripeService.convertToCents(order.total, "USD"),
        currency: "USD",
        orderDescription: `Payment for Order #${order.id}`,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        metadata: {
          order_id: order.id,
          customer_email: customerInfo.email,
        },
      });

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
            },
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        onPaymentFailed?.(confirmError.message || "Payment failed");
      } else {
        onPaymentSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      onPaymentFailed?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Thông tin thẻ</h3>
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !customerInfo.email || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xử lý thanh toán...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán ${(order.total / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

// Main Payment Processor Component
export function PaymentProcessor({
  order,
  onPaymentSuccess,
  onPaymentFailed,
  className = "",
}: PaymentProcessorProps) {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed" | "pending"
  >("idle");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  // Real-time order status updates
  const {
    order: currentOrder,
    isLoading: isStatusLoading,
    paymentStatus: realTimeStatus,
    refreshOrder,
    stopPolling,
  } = usePaymentStatus({
    orderId: order.id,
    pollInterval: 2000, // Check every 2 seconds
    onStatusChange: (updatedOrder) => {
      if (
        updatedOrder.status === "paid" ||
        updatedOrder.status === "completed"
      ) {
        setPaymentStatus("success");
        setTransactionId(updatedOrder.transactionId || "");
        onPaymentSuccess?.(updatedOrder.transactionId || "");
        stopPolling();
      } else if (
        updatedOrder.status === "failed" ||
        updatedOrder.status === "cancelled"
      ) {
        setPaymentStatus("failed");
        onPaymentFailed?.("Payment was cancelled or failed");
        stopPolling();
      }
    },
  });

  // Animation hooks
  const fadeIn = useFadeIn(100);
  const slideUp = useSlideUp(200);
  const scale = useScale(300);
  const progress = useProgressBar(30000); // 30 second progress bar

  // Notification hooks
  const { notifyPaymentSuccess, notifyPaymentFailed, notifyPaymentProcessing } =
    usePaymentNotifications();

  const handlePaymentSuccess = (txId: string) => {
    setTransactionId(txId);
    setPaymentStatus("success");
    notifyPaymentSuccess(txId);
    onPaymentSuccess?.(txId);
  };

  const handlePaymentFailed = (error: string) => {
    setPaymentStatus("failed");
    notifyPaymentFailed(error);
    onPaymentFailed?.(error);
  };

  // Show processing notification when payment starts
  useEffect(() => {
    if (paymentStatus === "processing") {
      notifyPaymentProcessing();
    }
  }, [paymentStatus, notifyPaymentProcessing]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real-time Status Indicator */}
      {(paymentStatus === "processing" || realTimeStatus === "processing") && (
        <Card className="border-blue-200 bg-blue-50" {...fadeIn}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <div className="font-medium text-blue-900">
                    Đang xử lý thanh toán...
                  </div>
                  <div className="text-sm text-blue-700">
                    Vui lòng chờ trong giây lát
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshOrder}
                disabled={isStatusLoading}
                className="text-blue-600 hover:text-blue-800"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isStatusLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>Đang xử lý</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card {...slideUp}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Thông tin đơn hàng</span>
            <Badge
              variant={order.status === "pending" ? "secondary" : "default"}
            >
              {order.status === "pending"
                ? "Chờ thanh toán"
                : order.status === "paid"
                ? "Đã thanh toán"
                : order.status === "completed"
                ? "Hoàn thành"
                : order.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mã đơn hàng:</span>
              <div className="font-semibold">
                {order.orderNumber || order.id}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <div className="font-semibold">{formatDate(order.createdAt)}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              )) || <div className="text-gray-600">Không có sản phẩm nào</div>}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>${((order.subtotal || order.total) / 100).toFixed(2)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>${(order.shippingFee / 100).toFixed(2)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span>Thuế:</span>
                <span>${(order.tax / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Tổng cộng:</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <div>
                <div className="font-semibold">Thanh toán thành công!</div>
                <div className="text-sm">Transaction ID: {transactionId}</div>
                <div className="text-sm">
                  Đơn hàng của bạn đã được xử lý thành công.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "success" && (
        <Card className="border-green-200 bg-green-50" {...scale}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-green-700">
              <CheckCircle className="w-8 h-8 animate-pulse" />
              <div className="font-semibold text-lg">
                🎉 Thanh toán thành công!
              </div>
            </div>
            {transactionId && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">Mã giao dịch:</div>
                <div className="font-mono text-sm text-green-800">
                  {transactionId}
                </div>
              </div>
            )}
            <div className="mt-4 text-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải lại trang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "failed" && (
        <Card className="border-red-200 bg-red-50" {...scale}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="w-6 h-6 animate-pulse" />
              <div>
                <div className="font-semibold">Thanh toán thất bại</div>
                <div className="text-sm">
                  Có lỗi xảy ra trong quá trình thanh toán.
                </div>
              </div>
                  </div>
            {error && (
              <div className="mt-3 text-sm text-red-600 text-center">
                {error}
              </div>
            )}
            <Button
              onClick={() => setPaymentStatus("idle")}
              variant="outline"
              className="w-full mt-4"
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card Payment Form */}
      {paymentStatus === "idle" && order.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thanh toán bằng thẻ Visa/Mastercard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CardPaymentForm
                order={order}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
              />
            </Elements>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "processing" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-blue-700">
              <Loader2 className="w-6 h-6 animate-spin" />
              <div className="font-semibold">Đang xử lý thanh toán...</div>
                      </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "failed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 text-red-700">
              <X className="w-6 h-6" />
              <div className="font-semibold">Thanh toán thất bại</div>
            </div>
            {error && (
              <div className="mt-3 text-sm text-red-600 text-center">
                {error}
              </div>
            )}
            <Button
              onClick={() => setPaymentStatus("pending")}
              variant="outline"
              className="w-full mt-4"
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PaymentProcessor;
