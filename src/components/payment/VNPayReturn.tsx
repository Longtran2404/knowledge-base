/**
 * VNPay Payment Return Handler
 * Xử lý kết quả thanh toán từ VNPay
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { createVNPayRecurringService } from '../../lib/vnpay/vnpay-recurring-service';
import { useSubscription } from '../../hooks/useSubscription';

interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
  planType?: string;
}

export const VNPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        setLoading(true);

        // Lấy tất cả parameters từ VNPay
        const vnpParams: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
          if (key.startsWith('vnp_')) {
            vnpParams[key] = value;
          }
        }

        // Kiểm tra có parameters VNPay không
        if (Object.keys(vnpParams).length === 0) {
          setPaymentResult({
            success: false,
            message: 'Không tìm thấy thông tin thanh toán từ VNPay',
            error: 'MISSING_PARAMS'
          });
          return;
        }

        // Xử lý kết quả thanh toán
        const vnpayService = createVNPayRecurringService();
        const result = await vnpayService.handlePaymentReturn(vnpParams);

        if (result.success) {
          // Refresh subscription data để cập nhật UI
          await refreshSubscription();

          setPaymentResult({
            success: true,
            message: 'Thanh toán thành công! Tài khoản của bạn đã được kích hoạt.',
            transactionId: result.transactionId,
            planType: determinePlanType(vnpParams.vnp_OrderInfo || '')
          });
        } else {
          setPaymentResult({
            success: false,
            message: result.error || 'Thanh toán thất bại',
            error: 'PAYMENT_FAILED'
          });
        }

      } catch (error: any) {
        console.error('Error processing VNPay return:', error);
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
          error: error.message || 'PROCESSING_ERROR'
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams, refreshSubscription]);

  const determinePlanType = (orderInfo: string): string => {
    if (orderInfo.toLowerCase().includes('premium')) return 'premium';
    if (orderInfo.toLowerCase().includes('partner')) return 'partner';
    return 'unknown';
  };

  const handleContinue = () => {
    if (paymentResult?.success) {
      // Chuyển đến dashboard hoặc trang chủ
      navigate('/dashboard');
    } else {
      // Quay lại trang pricing
      navigate('/pricing');
    }
  };

  const handleRetry = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-medium">Đang xử lý kết quả thanh toán...</h3>
              <p className="text-gray-600 text-sm">
                Vui lòng đợi trong giây lát. Không đóng trang này.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Đang xác thực với VNPay...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                {paymentResult?.success ? (
                  <div className="rounded-full bg-green-100 p-4">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-100 p-4">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className={`text-2xl font-bold ${
                  paymentResult?.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h2>
                <p className="text-gray-600">
                  {paymentResult?.message}
                </p>
              </div>

              {/* Transaction Details */}
              {paymentResult?.success && paymentResult.transactionId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-mono">{paymentResult.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span>{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Extra Info */}
              {paymentResult?.success && (
                <div className="space-y-3">
                  {paymentResult.planType === 'premium' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-700">
                        <strong>Subscription Premium đã được kích hoạt!</strong>
                        <br />
                        Thẻ của bạn đã được lưu để thanh toán tự động hàng tháng.
                      </div>
                    </div>
                  )}

                  {paymentResult.planType === 'partner' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm text-purple-700">
                        <strong>Tài khoản Partner đã được kích hoạt!</strong>
                        <br />
                        Bạn có thể truy cập tất cả tính năng dành cho đối tác.
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700">
                      <strong>Bạn có thể bắt đầu sử dụng ngay bây giờ!</strong>
                      <br />
                      Truy cập dashboard để khám phá các tính năng mới.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {paymentResult?.success ? (
                  <Button onClick={handleContinue} className="w-full">
                    Đi đến Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleRetry} className="w-full">
                      Thử lại
                    </Button>
                    <Button onClick={handleContinue} variant="outline" className="w-full">
                      Quay lại trang chủ
                    </Button>
                  </>
                )}
              </div>

              {/* Support Info */}
              <div className="text-xs text-gray-500 border-t pt-4">
                Cần hỗ trợ? Liên hệ{' '}
                <a href="mailto:support@knowledgebase.com" className="text-blue-600 hover:underline">
                  support@knowledgebase.com
                </a>
                {paymentResult?.transactionId && (
                  <>
                    <br />
                    Mã tham chiếu: {paymentResult.transactionId}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VNPayReturn;