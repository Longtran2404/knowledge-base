/**
 * Order Confirmation Component
 * Shows order status and payment confirmation
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  CheckCircle,
  XCircle,
  Download,
  Printer,
  ArrowRight,
  Package,
  CreditCard,
  Clock,
  Loader2,
} from "lucide-react";
import { orderManager } from "../../lib/order/order-manager";
import { invoiceGenerator } from "../../lib/invoice/invoice-generator";
import { formatPrice, formatDate } from "../../lib/shared/formatters";
import type { Order } from "../../lib/order/order-manager";

interface OrderConfirmationProps {
  orderId?: string;
  className?: string;
}

export function OrderConfirmation({
  orderId,
  className = "",
}: OrderConfirmationProps) {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [error, setError] = useState("");

  // Get order ID from props or URL params
  const finalOrderId = orderId || searchParams.get("orderId");
  const paymentStatus = searchParams.get("status");
  const paymentMessage = searchParams.get("message");

  useEffect(() => {
    if (finalOrderId) {
      loadOrder(finalOrderId);
    }
  }, [finalOrderId]);

  const loadOrder = async (id: string) => {
    try {
      setLoading(true);
      const orderData = await orderManager.getOrder(id);
      if (!orderData) {
        setError("Không tìm thấy đơn hàng");
        return;
      }
      setOrder(orderData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloadingInvoice(true);

      // Create invoice from order
      const invoice = invoiceGenerator.createInvoiceFromOrder(order, {
        name: order.shippingInfo?.recipientName || "Khách hàng",
        email: order.shippingInfo?.email || "",
        phone: order.shippingInfo?.phone,
        address: order.shippingInfo?.address,
      });

      // Download PDF
      await invoiceGenerator.downloadPDF(invoice);
    } catch (err) {
      console.error("Failed to download invoice:", err);
      alert("Lỗi tải hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!order) return;

    try {
      // Create invoice from order
      const invoice = invoiceGenerator.createInvoiceFromOrder(order, {
        name: order.shippingInfo?.recipientName || "Khách hàng",
        email: order.shippingInfo?.email || "",
        phone: order.shippingInfo?.phone,
        address: order.shippingInfo?.address,
      });

      // Print invoice
      invoiceGenerator.printInvoice(invoice);
    } catch (err) {
      console.error("Failed to print invoice:", err);
      alert("Lỗi in hóa đơn. Vui lòng thử lại sau.");
    }
  };

  const getStatusConfig = () => {
    if (
      paymentStatus === "success" ||
      order?.status === "paid" ||
      order?.status === "completed"
    ) {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        title: "Thanh toán thành công!",
        message: "Đơn hàng của bạn đã được thanh toán thành công.",
      };
    } else if (paymentStatus === "failed" || order?.status === "failed") {
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        title: "Thanh toán thất bại",
        message: paymentMessage || "Có lỗi xảy ra trong quá trình thanh toán.",
      };
    } else if (order?.status === "pending") {
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        title: "Chờ thanh toán",
        message: "Đơn hàng đang chờ được thanh toán.",
      };
    } else {
      return {
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        title: "Đang xử lý",
        message: "Đơn hàng đang được xử lý.",
      };
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải thông tin đơn hàng...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600">
              {error || "Không tìm thấy đơn hàng"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${className}`}>
      {/* Status Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div
              className={`inline-flex p-4 rounded-full ${statusConfig.bgColor} mb-4`}
            >
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>
            <h1 className="text-2xl font-bold mb-2">{statusConfig.title}</h1>
            <p className="text-gray-600 mb-4">{statusConfig.message}</p>

            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span>
                Mã đơn hàng: <strong>{order.orderNumber}</strong>
              </span>
              <div className="w-px h-4 bg-gray-300" />
              <span>Ngày tạo: {formatDate(order.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Sản phẩm đã mua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start pb-4 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 mt-2">
                        <span className="inline-flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {item.type === "course"
                              ? "Khóa học"
                              : item.type === "product"
                              ? "Sản phẩm"
                              : "Dịch vụ"}
                          </Badge>
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.discount && item.discount > 0 && (
                        <div className="text-sm text-green-600">
                          Giảm {formatPrice(item.discount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.shippingInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Người nhận:</strong>{" "}
                    {order.shippingInfo.recipientName}
                  </div>
                  <div>
                    <strong>Điện thoại:</strong> {order.shippingInfo.phone}
                  </div>
                  {order.shippingInfo.email && (
                    <div>
                      <strong>Email:</strong> {order.shippingInfo.email}
                    </div>
                  )}
                  <div>
                    <strong>Địa chỉ:</strong> {order.shippingInfo.address}
                  </div>
                  <div>
                    {order.shippingInfo.ward}, {order.shippingInfo.district},{" "}
                    {order.shippingInfo.city}
                  </div>
                  {order.shippingInfo.notes && (
                    <div>
                      <strong>Ghi chú:</strong> {order.shippingInfo.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}

                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                  </div>
                )}

                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Thuế VAT (10%):</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Thông tin thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <Badge variant="outline">
                    {order.paymentMethod === "vnpay"
                      ? "VNPay"
                      : order.paymentMethod === "momo"
                      ? "MoMo"
                      : order.paymentMethod || "Chưa chọn"}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <Badge
                    variant={
                      order.paymentStatus === "completed"
                        ? "default"
                        : order.paymentStatus === "pending"
                        ? "secondary"
                        : order.paymentStatus === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {order.paymentStatus === "completed"
                      ? "Đã thanh toán"
                      : order.paymentStatus === "pending"
                      ? "Chờ thanh toán"
                      : order.paymentStatus === "failed"
                      ? "Thất bại"
                      : order.paymentStatus === "processing"
                      ? "Đang xử lý"
                      : order.paymentStatus}
                  </Badge>
                </div>

                {order.transactionId && (
                  <div className="flex justify-between">
                    <span>Mã giao dịch:</span>
                    <span className="font-mono text-xs">
                      {order.transactionId}
                    </span>
                  </div>
                )}

                {order.paidAt && (
                  <div className="flex justify-between">
                    <span>Thời gian thanh toán:</span>
                    <span>{formatDate(order.paidAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {(order.status === "paid" || order.status === "completed") && (
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full"
                  variant="outline"
                >
                  {downloadingInvoice ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Tải hóa đơn PDF
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePrintInvoice}
                  className="w-full"
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>

                <Separator />

                <Button className="w-full" asChild>
                  <a href="/marketplace">
                    Tiếp tục mua sắm
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
