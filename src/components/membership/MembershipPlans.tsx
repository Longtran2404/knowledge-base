/**
 * Membership Plans Component - Đơn giản
 * Hiển thị các gói membership: Free → Member → Premium
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Star,
  Zap,
  Check,
  ArrowRight,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { usePlans, useMembershipStatus } from '../../hooks/useMembership';
import { formatPrice } from '../../config/pricing';

const MembershipPlans: React.FC = () => {
  const { plans, loading: plansLoading } = usePlans();
  const { profile, isFree, isMember, isPremium, canUpgrade, loading: statusLoading } = useMembershipStatus();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Use centralized formatPrice from config

  const getPlanIcon = (planCode: string) => {
    switch (planCode) {
      case 'free': return <Star className="h-6 w-6 text-gray-600" />;
      case 'member': return <Zap className="h-6 w-6 text-blue-600" />;
      case 'premium': return <Crown className="h-6 w-6 text-yellow-600" />;
      default: return <Star className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPlanColor = (planCode: string) => {
    switch (planCode) {
      case 'free': return 'border-gray-200 bg-gray-50';
      case 'member': return 'border-blue-200 bg-blue-50';
      case 'premium': return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const isCurrentPlan = (planCode: string) => {
    return profile?.membership_type === planCode;
  };

  const canSelectPlan = (planCode: string) => {
    if (isCurrentPlan(planCode)) return false;
    if (!canUpgrade()) return false;

    // Free user có thể upgrade lên member hoặc premium
    if (isFree) return planCode === 'member' || planCode === 'premium';

    // Member có thể upgrade lên premium
    if (isMember) return planCode === 'premium';

    return false;
  };

  const handleSelectPlan = (planCode: string) => {
    if (canSelectPlan(planCode)) {
      setSelectedPlan(planCode);
      // Redirect to payment flow
      window.location.href = `/payment?plan=${planCode}`;
    }
  };

  if (plansLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Chọn gói thành viên phù hợp</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nâng cấp tài khoản để truy cập đầy đủ tính năng và nội dung cao cấp của Knowledge Base
        </p>

        {profile && (
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              {getPlanIcon(profile.membership_type)}
              <span className="font-medium">
                Gói hiện tại: {profile.membership_type === 'free' ? 'Miễn phí' :
                              profile.membership_type === 'member' ? 'Hội viên' : 'Premium'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plans.indexOf(plan) * 0.1 }}
          >
            <Card className={`relative h-full ${getPlanColor(plan.code)} ${
              plan.isPopular ? 'ring-2 ring-blue-500' : ''
            } ${isCurrentPlan(plan.code) ? 'ring-2 ring-green-500' : ''}`}>

              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Phổ biến</Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.code) && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white">Gói hiện tại</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.code)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="pt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Miễn phí' : formatPrice(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-gray-600">
                      /{plan.billingCycle === 'monthly' ? 'tháng' : 'năm'}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-600">Tính năng sẽ được cập nhật</div>
                  )}
                </div>

                {/* Limits */}
                {plan.limits && Object.keys(plan.limits).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Giới hạn:</div>
                    <div className="space-y-1">
                      {Object.entries(plan.limits).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-6">
                  {isCurrentPlan(plan.code) ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Đang sử dụng
                    </Button>
                  ) : canSelectPlan(plan.code) ? (
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.code)}
                      variant={plan.isPopular ? 'default' : 'outline'}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Nâng cấp ngay
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {!canUpgrade() ? 'Không thể nâng cấp' : 'Đã đạt cấp độ cao hơn'}
                    </Button>
                  )}
                </div>

                {/* Auto-renewal info for premium */}
                {plan.code === 'premium' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <RefreshCw className="h-4 w-4" />
                      <span>Tự động gia hạn hàng tháng</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upgrade Path Info */}
      {profile && canUpgrade() && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-900">Sẵn sàng nâng cấp?</h3>
            </div>
            <p className="text-blue-700 max-w-2xl mx-auto">
              {isFree && 'Nâng cấp lên Hội viên để truy cập nhiều khóa học hơn, hoặc chọn Premium để có trải nghiệm tốt nhất.'}
              {isMember && 'Nâng cấp lên Premium để không giới hạn khóa học và tính năng auto-renewal.'}
            </p>
            <div className="flex justify-center space-x-4">
              {isFree && (
                <>
                  <Button onClick={() => handleSelectPlan('member')} variant="outline">
                    Chọn gói Hội viên
                  </Button>
                  <Button onClick={() => handleSelectPlan('premium')}>
                    Chọn gói Premium
                  </Button>
                </>
              )}
              {isMember && (
                <Button onClick={() => handleSelectPlan('premium')}>
                  Nâng cấp lên Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="text-center text-sm text-gray-600 space-y-2">
        <p>💳 Hỗ trợ thanh toán qua VNPay, MoMo, và chuyển khoản ngân hàng</p>
        <p>🔒 Thanh toán an toàn và bảo mật</p>
        <p>📞 Hỗ trợ 24/7: <a href="mailto:support@knowledgebase.com" className="text-blue-600 hover:underline">support@knowledgebase.com</a></p>
      </div>
    </div>
  );
};

export default MembershipPlans;