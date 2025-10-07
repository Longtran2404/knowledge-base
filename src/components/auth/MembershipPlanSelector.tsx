/**
 * Membership Plan Selector Component
 * Cho phép chọn gói thành viên: Miễn phí, Hội viên Premium, Đối tác
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Star,
  Zap,
  Crown,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MEMBERSHIP_PRICES, formatPrice } from '../../config/pricing';

export interface MembershipPlan {
  id: 'free' | 'premium' | 'partner';
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  icon: React.ReactNode;
  badge?: string;
  popular?: boolean;
  color: string;
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Miễn Phí',
    description: 'Bắt đầu học tập với các tính năng cơ bản',
    price: MEMBERSHIP_PRICES.FREE,
    features: [
      'Truy cập khóa học miễn phí',
      'Tài liệu học tập cơ bản',
      'Cộng đồng học viên',
      'Hỗ trợ qua email'
    ],
    icon: <GraduationCap className="h-6 w-6" />,
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Hội Viên Premium',
    description: 'Nâng cao kỹ năng với đầy đủ tính năng',
    price: MEMBERSHIP_PRICES.PREMIUM,
    features: [
      'Tất cả khóa học Premium',
      'Tài liệu chuyên sâu',
      'Chứng chỉ hoàn thành',
      'Hỗ trợ 1-1 với giảng viên',
      'Truy cập sớm nội dung mới',
      'Tải về offline'
    ],
    icon: <Crown className="h-6 w-6" />,
    badge: 'Phổ biến',
    popular: true,
    color: 'gradient'
  },
  {
    id: 'partner',
    name: 'Đối Tác',
    description: 'Hợp tác kinh doanh và phát triển chung',
    price: 1999000,
    features: [
      'Tất cả tính năng Premium',
      'API tích hợp hệ thống',
      'Báo cáo chi tiết',
      'Quản lý nhóm/doanh nghiệp',
      'Hỗ trợ kỹ thuật 24/7',
      'Customization theo yêu cầu'
    ],
    icon: <Building2 className="h-6 w-6" />,
    badge: 'Doanh nghiệp',
    color: 'purple'
  }
];

interface MembershipPlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onContinue: () => void;
  loading?: boolean;
}

export const MembershipPlanSelector: React.FC<MembershipPlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
  onContinue,
  loading = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCardClasses = (plan: MembershipPlan) => {
    const baseClasses = "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105";

    if (selectedPlan === plan.id) {
      if (plan.color === 'gradient') {
        return `${baseClasses} ring-2 ring-purple-500 shadow-xl scale-105`;
      }
      return `${baseClasses} ring-2 ring-blue-500 shadow-xl scale-105`;
    }

    return baseClasses;
  };

  const getHeaderClasses = (plan: MembershipPlan) => {
    if (plan.color === 'gradient') {
      return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
    }
    if (plan.color === 'purple') {
      return "bg-purple-600 text-white";
    }
    return "bg-blue-600 text-white";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Chọn Gói Thành Viên</h2>
        <p className="text-gray-600">Lựa chọn gói phù hợp với nhu cầu học tập của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={getCardClasses(plan)}
              onClick={() => onPlanSelect(plan.id)}
            >
              <CardHeader className={`${getHeaderClasses(plan)} relative`}>
                {plan.badge && (
                  <Badge
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 border-yellow-500"
                  >
                    {plan.badge}
                  </Badge>
                )}

                <div className="flex items-center justify-center space-x-2">
                  {plan.icon}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>

                <CardDescription className="text-center text-white/90">
                  {plan.description}
                </CardDescription>

                <div className="text-center pt-4">
                  {plan.price === 0 ? (
                    <div className="text-2xl font-bold">Miễn Phí</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {formatPrice(plan.price)}
                      </div>
                      {plan.originalPrice && (
                        <div className="text-sm line-through text-white/70">
                          {formatPrice(plan.originalPrice)}
                        </div>
                      )}
                      <div className="text-sm text-white/90">/tháng</div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedPlan === plan.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Đã chọn</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={onContinue}
          disabled={!selectedPlan || loading}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Đang xử lý...
            </>
          ) : (
            <>
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {selectedPlan === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-purple-700 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Ưu đãi đặc biệt!</span>
          </div>
          <p className="text-sm text-purple-600">
            Tiết kiệm 25% so với giá gốc. Tặng kèm 1 tháng học thử miễn phí.
          </p>
        </motion.div>
      )}

      {selectedPlan === 'partner' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-purple-700 mb-2">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Gói Đối Tác</span>
          </div>
          <p className="text-sm text-purple-600">
            Liên hệ với đội ngũ kinh doanh để được tư vấn gói phù hợp nhất cho doanh nghiệp.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MembershipPlanSelector;