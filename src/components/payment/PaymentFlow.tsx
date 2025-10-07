/**
 * Payment Flow Component
 * Xử lý luồng thanh toán cho các gói thành viên
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  QrCode,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { createVNPayRecurringService } from '../../lib/vnpay/vnpay-recurring-service';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/UnifiedAuthContext';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fee?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
    processingTime: 'Tức thì',
    fee: 'Miễn phí'
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Ví điện tử MoMo',
    processingTime: 'Tức thì',
    fee: 'Miễn phí'
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: <QrCode className="h-5 w-5" />,
    description: 'Chuyển khoản qua QR Code hoặc số tài khoản',
    processingTime: '1-2 phút',
    fee: 'Miễn phí'
  }
];

interface PaymentFlowProps {
  planId: string;
  planName: string;
  planType: 'free' | 'premium' | 'partner';
  amount: number;
  onBack: () => void;
  onPaymentComplete: (paymentResult: any) => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  planId,
  planName,
  planType,
  amount,
  onBack,
  onPaymentComplete
}) => {
  const { user } = useAuth();
  const { createSubscription } = useSubscription();
  const [selectedMethod, setSelectedMethod] = useState<string>('vnpay');
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');
  const [paymentData, setPaymentData] = useState({
    email: user?.email || '',
    phone: '',
    fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  });
  const [error, setError] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinueToDetails = () => {
    setStep('details');
  };

  const handlePayment = async () => {
    if (!user?.id) {
      setError('Vui lòng đăng nhập để tiếp tục');
      setStep('error');
      return;
    }

    setStep('processing');
    setError('');

    try {
      // Tạo subscription record trước
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);

      // Tính toán thời gian hết hạn
      if (planType === 'premium') {
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 tháng
      } else if (planType === 'partner') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 10); // 10 năm cho partner
      }

      const subscriptionData = {
        plan_type: planType,
        status: 'pending_payment' as 'pending_payment',
        amount: amount,
        currency: 'VND',
        billing_cycle: (planType === 'premium' ? 'monthly' : 'one_time') as 'monthly' | 'one_time',
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
        next_billing_date: planType === 'premium' ? periodEnd.toISOString() : undefined,
        auto_renewal: planType === 'premium',
        grace_period_days: 3,
        plan_features: {
          planId: planId,
          planName: planName
        },
        metadata: {
          paymentMethod: selectedMethod,
          userInfo: paymentData
        }
      };

      const subscriptionCreated = await createSubscription(subscriptionData);

      if (!subscriptionCreated) {
        throw new Error('Không thể tạo subscription');
      }

      // Xử lý thanh toán dựa trên phương thức
      if (selectedMethod === 'vnpay') {
        const vnpayService = createVNPayRecurringService();

        const paymentRequest = {
          subscriptionId: '', // Sẽ được lấy từ subscription đã tạo
          amount: amount,
          planType: (planType === 'partner' ? 'partner' : 'premium') as 'premium' | 'partner',
          userInfo: {
            id: user.id,
            email: paymentData.email,
            name: paymentData.fullName
          }
        };

        const result = await vnpayService.setupRecurringPayment(paymentRequest);

        if (result.success && result.paymentUrl) {
          // Chuyển hướng đến VNPay
          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.error || 'Không thể tạo link thanh toán');
        }

      } else if (selectedMethod === 'bank_transfer') {
        // Chuyển đến QR Code payment
        const paymentResult = {
          success: true,
          method: 'bank_transfer',
          amount,
          planId,
          planType,
          requiresManualConfirmation: true,
          timestamp: new Date().toISOString()
        };

        setStep('success');
        setTimeout(() => {
          onPaymentComplete(paymentResult);
        }, 1000);

      } else {
        // Các phương thức khác (MoMo, etc.)
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const paymentResult = {
          success: true,
          transactionId: `TXN_${Date.now()}`,
          method: selectedMethod,
          amount,
          planId,
          planType,
          timestamp: new Date().toISOString()
        };

        setStep('success');
        setTimeout(() => {
          onPaymentComplete(paymentResult);
        }, 2000);
      }

    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(error.message || 'Có lỗi xảy ra trong quá trình thanh toán');
      setStep('error');
    }
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
          <p className="text-gray-600">{planName} - {formatPrice(amount)}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Method Selection */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Chọn phương thức thanh toán</span>
                </CardTitle>
                <CardDescription>
                  Lựa chọn phương thức thanh toán phù hợp với bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedMethod === method.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {method.icon}
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {method.processingTime}
                          </Badge>
                          {method.fee && (
                            <div className="text-sm text-green-600">{method.fee}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  onClick={handleContinueToDetails}
                  className="w-full"
                  disabled={!selectedMethod}
                >
                  Tiếp tục
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Payment Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {selectedMethodData?.icon}
                  <span>Thông tin thanh toán - {selectedMethodData?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={paymentData.fullName}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={paymentData.phone}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Chi tiết đơn hàng</h4>
                  <div className="flex justify-between items-center">
                    <span>{planName}</span>
                    <span className="font-medium">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <span>Phí xử lý</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-medium">
                    <span>Tổng cộng</span>
                    <span className="text-lg">{formatPrice(amount)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Thông tin thanh toán được bảo mật an toàn</span>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full"
                  disabled={!paymentData.fullName || !paymentData.email || !paymentData.phone}
                >
                  Thanh toán {formatPrice(amount)}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                  </div>
                  <h3 className="text-xl font-medium">Đang xử lý thanh toán...</h3>
                  <p className="text-gray-600">Vui lòng đợi trong giây lát. Không đóng trang này.</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Thời gian xử lý: {selectedMethodData?.processingTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h3>
                  <p className="text-gray-600">
                    Cảm ơn bạn đã đăng ký {planName}.
                    {planType === 'premium' && ' Subscription hàng tháng của bạn đã được kích hoạt với tính năng auto-renewal.'}
                    {planType === 'partner' && ' Tài khoản Partner của bạn đã được kích hoạt.'}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-700">
                      <Zap className="h-5 w-5" />
                      <span className="font-medium">Bạn có thể bắt đầu sử dụng ngay bây giờ!</span>
                    </div>
                  </div>
                  {planType === 'premium' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm">
                          Thẻ của bạn đã được lưu để thanh toán tự động hàng tháng
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Error */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 p-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">Có lỗi xảy ra</h3>
                  <p className="text-gray-600">{error}</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setStep('details')}
                      className="w-full"
                    >
                      Thử lại
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="w-full"
                    >
                      Quay lại
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentFlow;