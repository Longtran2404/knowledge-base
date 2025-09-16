/**
 * Payment Processor Component
 * Handles payment flow for orders
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, CreditCard, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { orderManager } from '../../lib/order/order-manager';
import { vnPayService } from '../../lib/payment/vnpay';
import { momoService } from '../../lib/payment/momo';
import { formatPrice, formatDate } from '../../lib/shared/formatters';
import type { Order, PaymentMethod } from '../../lib/order/order-manager';

interface PaymentProcessorProps {
  order: Order;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailed?: (error: string) => void;
  className?: string;
}

export function PaymentProcessor({
  order,
  onPaymentSuccess,
  onPaymentFailed,
  className = ''
}: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Available payment methods
  const paymentMethods = [
    {
      id: 'vnpay' as PaymentMethod,
      name: 'VNPay',
      description: 'Thanh toán qua cổng VNPay',
      icon: CreditCard,
      color: 'bg-blue-500',
      fees: '0₫ phí giao dịch'
    },
    {
      id: 'momo' as PaymentMethod,
      name: 'MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: Smartphone,
      color: 'bg-pink-500',
      fees: '0₫ phí giao dịch'
    }
  ];

  const handlePayment = async () => {
    if (order.status !== 'pending') {
      setErrorMessage('Đơn hàng không ở trạng thái chờ thanh toán');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create payment request
      const paymentResponse = await orderManager.createPayment({
        orderId: order.id,
        paymentMethod: selectedMethod,
        returnUrl: `${window.location.origin}/payment/${selectedMethod}/return`,
        customerInfo: {
          name: order.shippingInfo?.recipientName || 'Khách hàng',
          email: order.shippingInfo?.email || '',
          phone: order.shippingInfo?.phone || '',
        }
      });

      // Redirect to payment gateway
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khởi tạo thanh toán');
      onPaymentFailed?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check payment status from URL params (when returning from gateway)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderId = urlParams.get('orderId');
    const transactionId = urlParams.get('transactionId');

    if (status && orderId === order.id) {
      if (status === 'success' && transactionId) {
        setPaymentStatus('success');
        onPaymentSuccess?.(transactionId);
      } else if (status === 'failed') {
        setPaymentStatus('failed');
        setErrorMessage(urlParams.get('message') || 'Thanh toán thất bại');
        onPaymentFailed?.(urlParams.get('message') || 'Payment failed');
      }
    }
  }, [order.id, onPaymentSuccess, onPaymentFailed]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Thông tin đơn hàng</span>
            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
              {order.status === 'pending' ? 'Chờ thanh toán' :
               order.status === 'paid' ? 'Đã thanh toán' :
               order.status === 'completed' ? 'Hoàn thành' : order.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mã đơn hàng:</span>
              <div className="font-semibold">{order.orderNumber}</div>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <div className="font-semibold">{formatDate(order.createdAt)}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                    <div className="text-sm text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
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
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <Card>
          <CardContent className="pt-6">
            {paymentStatus === 'processing' && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang chuyển hướng đến cổng thanh toán...</span>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Thanh toán thành công!</span>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>Thanh toán thất bại</span>
                </div>
                {errorMessage && (
                  <div className="text-center text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Methods - Only show if order is pending */}
      {order.status === 'pending' && paymentStatus !== 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>Chọn phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${method.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                        <div className="text-xs text-green-600">{method.fees}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || paymentStatus === 'processing'}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh toán {formatPrice(order.total)}
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Bằng cách nhấn "Thanh toán", bạn đồng ý với{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                điều khoản dịch vụ
              </a>{' '}
              của chúng tôi.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}