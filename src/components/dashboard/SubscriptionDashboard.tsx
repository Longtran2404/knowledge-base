/**
 * Subscription Dashboard Component
 * Dashboard để quản lý subscription và payment của user
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  History,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Crown,
  Building2,
  Star,
  Clock,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useSubscription, usePaymentHistory, useAutoPayment, useSubscriptionStatus } from '../../hooks/useSubscription';

const SubscriptionDashboard: React.FC = () => {
  const { subscription, updateSubscription, cancelSubscription, loading: subLoading } = useSubscription();
  const { paymentHistory, loading: historyLoading } = usePaymentHistory();
  const { defaultPaymentMethod, removePaymentMethod, loading: paymentLoading } = useAutoPayment();
  const { isPremium, isPartner, planType, status } = useSubscriptionStatus();
  const [showCardDetails, setShowCardDetails] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleToggleAutoRenewal = async () => {
    if (!subscription) return;

    const success = await updateSubscription({
      auto_renewal: !subscription.auto_renewal
    });

    if (success) {
      // Subscription sẽ được refresh tự động qua hook
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hủy subscription? Bạn vẫn có thể sử dụng dịch vụ đến hết kỳ hiện tại.'
    );

    if (confirmed) {
      const success = await cancelSubscription('User requested cancellation');
      if (success) {
        // Show success message
      }
    }
  };

  const handleRemovePaymentMethod = async () => {
    if (!defaultPaymentMethod) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa phương thức thanh toán này? Auto-renewal sẽ bị tắt.'
    );

    if (confirmed) {
      const success = await removePaymentMethod(defaultPaymentMethod.id!);
      if (success) {
        // Auto-renewal sẽ bị tắt tự động
        await updateSubscription({ auto_renewal: false });
      }
    }
  };

  const getPlanIcon = () => {
    if (isPremium) return <Crown className="h-5 w-5 text-yellow-600" />;
    if (isPartner) return <Building2 className="h-5 w-5 text-purple-600" />;
    return <Star className="h-5 w-5 text-gray-600" />;
  };

  const getPlanColor = () => {
    if (isPremium) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (isPartner) return 'bg-gradient-to-r from-purple-400 to-indigo-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
      expired: { color: 'bg-red-100 text-red-800', text: 'Đã hết hạn' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Đã hủy' },
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ thanh toán' },
      suspended: { color: 'bg-orange-100 text-orange-800', text: 'Tạm ngưng' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Subscription</h1>
          <p className="text-gray-600">Theo dõi và quản lý gói thành viên của bạn</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Subscription Overview */}
      <Card className="overflow-hidden">
        <div className={`h-32 ${getPlanColor()}`}>
          <div className="h-full flex items-center justify-between p-6 text-white">
            <div className="flex items-center space-x-3">
              {getPlanIcon()}
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {planType === 'free' ? 'Miễn phí' :
                   planType === 'premium' ? 'Premium' : 'Partner'}
                </h2>
                <p className="opacity-90">
                  {subscription ? formatPrice(subscription.amount) : 'Miễn phí'}
                  {subscription?.billing_cycle === 'monthly' && '/tháng'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Ngày bắt đầu</Label>
                <p className="text-lg font-medium">{formatDate(subscription.started_at!)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Ngày hết hạn</Label>
                <p className="text-lg font-medium">{formatDate(subscription.current_period_end)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Thanh toán tiếp theo</Label>
                <p className="text-lg font-medium">
                  {subscription.next_billing_date
                    ? formatDate(subscription.next_billing_date)
                    : 'Không áp dụng'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Bạn chưa có subscription nào. Hãy nâng cấp để trải nghiệm các tính năng cao cấp!</p>
              <Button className="mt-4" onClick={() => window.location.href = '/pricing'}>
                Xem các gói
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {subscription && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="payment">Thanh toán</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Tính năng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subscription.plan_features && Array.isArray(subscription.plan_features) &&
                      subscription.plan_features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Thống kê sử dụng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ngày còn lại</span>
                      <span className="font-medium">
                        {Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} ngày
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Auto-renewal</span>
                      <span className={`font-medium ${subscription.auto_renewal ? 'text-green-600' : 'text-gray-600'}`}>
                        {subscription.auto_renewal ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Thao tác nhanh</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Xuất hóa đơn
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Gia hạn ngay
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/pricing'}>
                    Nâng cấp gói
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Phương thức thanh toán</span>
                  </CardTitle>
                  <CardDescription>
                    Quản lý thẻ và phương thức thanh toán tự động
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : defaultPaymentMethod ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">
                              {defaultPaymentMethod.card_brand} •••• {defaultPaymentMethod.card_last_4}
                            </p>
                            <p className="text-sm text-gray-600">
                              Hết hạn {defaultPaymentMethod.card_exp_month}/{defaultPaymentMethod.card_exp_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCardDetails(!showCardDetails)}
                          >
                            {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemovePaymentMethod}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {showCardDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-gray-50 p-4 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Token:</span>
                            <span className="font-mono">{defaultPaymentMethod.payment_method_token.slice(0, 20)}...</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Gateway:</span>
                            <span>VNPay</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Trạng thái:</span>
                            <Badge variant={defaultPaymentMethod.is_active ? 'default' : 'secondary'}>
                              {defaultPaymentMethod.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
                            </Badge>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Chưa có phương thức thanh toán nào được lưu</p>
                      <Button onClick={() => window.location.href = '/pricing'}>
                        Thêm thẻ thanh toán
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Thanh toán tiếp theo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription.next_billing_date ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ngày thanh toán:</span>
                        <span className="font-medium">{formatDate(subscription.next_billing_date)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-medium text-lg">{formatPrice(subscription.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-medium">
                          {defaultPaymentMethod ? `${defaultPaymentMethod.card_brand} •••• ${defaultPaymentMethod.card_last_4}` : 'Chưa thiết lập'}
                        </span>
                      </div>

                      <Separator />

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <strong>Lưu ý:</strong> Thanh toán sẽ được thực hiện tự động vào ngày {formatDate(subscription.next_billing_date)}.
                            Bạn sẽ nhận được email thông báo trước 3 ngày.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Gói hiện tại không có thanh toán định kỳ</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Lịch sử thanh toán</span>
                </CardTitle>
                <CardDescription>
                  Theo dõi tất cả các giao dịch thanh toán của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100' :
                            payment.status === 'failed' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            {payment.status === 'completed' && <Check className="h-4 w-4 text-green-600" />}
                            {payment.status === 'failed' && <X className="h-4 w-4 text-red-600" />}
                            {payment.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{payment.description || 'Thanh toán subscription'}</p>
                            <p className="text-sm text-gray-600">
                              {payment.payment_date ? formatDate(payment.payment_date) : 'Chưa thanh toán'} •
                              {payment.payment_method?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(payment.amount)}</p>
                          <Badge
                            variant={
                              payment.status === 'completed' ? 'default' :
                              payment.status === 'failed' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {payment.status === 'completed' && 'Thành công'}
                            {payment.status === 'failed' && 'Thất bại'}
                            {payment.status === 'pending' && 'Đang xử lý'}
                            {payment.status === 'cancelled' && 'Đã hủy'}
                            {payment.status === 'refunded' && 'Đã hoàn tiền'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có lịch sử thanh toán nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auto Renewal */}
              <Card>
                <CardHeader>
                  <CardTitle>Tự động gia hạn</CardTitle>
                  <CardDescription>
                    Quản lý tính năng tự động gia hạn subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-renewal</Label>
                      <p className="text-sm text-gray-600">
                        Tự động gia hạn subscription khi hết hạn
                      </p>
                    </div>
                    <Switch
                      checked={subscription.auto_renewal}
                      onCheckedChange={handleToggleAutoRenewal}
                      disabled={!defaultPaymentMethod || subscription.billing_cycle === 'one_time'}
                    />
                  </div>

                  {!defaultPaymentMethod && subscription.auto_renewal && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <strong>Cảnh báo:</strong> Auto-renewal đã bật nhưng chưa có phương thức thanh toán.
                          Hãy thêm thẻ thanh toán để tránh gián đoạn dịch vụ.
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Nguy hiểm</CardTitle>
                  <CardDescription>
                    Các thao tác không thể hoàn tác
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hủy subscription</Label>
                    <p className="text-sm text-gray-600">
                      Hủy subscription hiện tại. Bạn vẫn có thể sử dụng đến hết kỳ hiện tại.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={subscription.status === 'cancelled'}
                    >
                      {subscription.status === 'cancelled' ? 'Đã hủy' : 'Hủy subscription'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SubscriptionDashboard;