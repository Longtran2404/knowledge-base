/**
 * Account Upgrade Page
 * Premium subscription plans with beautiful pricing cards
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Check,
  Crown,
  Zap,
  Rocket,
  Star,
  Upload,
  Database,
  Headphones,
  Users,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { subscriptionApi } from '../lib/api/subscription-api';
import { paymentMethodsApi } from '../lib/api/cms-api';
import type { SubscriptionPlan, UserSubscription } from '../types/subscription';
import type { PaymentMethod } from '../types/cms';

export default function AccountUpgradePage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    payment_proof_url: '',
    payment_note: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, subData, methodsData] = await Promise.all([
        subscriptionApi.plans.getActivePlans(),
        subscriptionApi.subscriptions.getCurrentSubscription(),
        paymentMethodsApi.getActivePaymentMethods(),
      ]);
      setPlans(plansData);
      setCurrentSubscription(subData);
      setPaymentMethods(methodsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để nâng cấp tài khoản');
      navigate('/auth');
      return;
    }

    // Check if same plan
    if (currentSubscription?.plan?.plan_name === plan.plan_name) {
      toast.info('Bạn đang sử dụng gói này');
      return;
    }

    // Free plan
    if (plan.plan_name === 'free') {
      toast.info('Bạn không thể chuyển về gói miễn phí');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      if (!paymentData.payment_method) {
        toast.error('Vui lòng chọn phương thức thanh toán');
        return;
      }

      await subscriptionApi.subscriptions.upgradeSubscription({
        plan_id: selectedPlan.id,
        payment_method: paymentData.payment_method,
        payment_proof_url: paymentData.payment_proof_url,
        payment_note: paymentData.payment_note,
      });

      toast.success('Đã gửi yêu cầu nâng cấp! Chờ admin xác nhận thanh toán.');
      setShowPaymentDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error upgrading:', error);
      toast.error(error.message || 'Không thể nâng cấp tài khoản');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Shield className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      case 'business':
        return <Rocket className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'from-slate-500 to-gray-600';
      case 'premium':
        return 'from-purple-500 to-pink-500';
      case 'business':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-green-500 to-teal-500';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return currentSubscription?.plan?.plan_name === planName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-5xl font-bold text-white">
              Nâng cấp tài khoản
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu của bạn và trải nghiệm tất cả tính năng cao cấp
          </p>

          {/* Current Plan Badge */}
          {currentSubscription && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-block"
            >
              <Badge className="px-6 py-2 text-lg bg-gradient-to-r from-green-500 to-emerald-500">
                🎯 Gói hiện tại: {currentSubscription.plan?.display_name}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan.plan_name);
            const isPremium = plan.plan_name === 'premium';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${isPremium ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                      🔥 PHỔ BIẾN NHẤT
                    </Badge>
                  </div>
                )}

                <div
                  className={`relative h-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border-2 ${
                    isCurrent
                      ? 'border-green-500'
                      : isPremium
                      ? 'border-purple-500'
                      : 'border-slate-700'
                  } overflow-hidden hover:scale-105 transition-all duration-300`}
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${getPlanColor(plan.plan_name)} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      {getPlanIcon(plan.plan_name)}
                      {isCurrent && (
                        <Badge className="bg-green-500 text-white">
                          ✓ Đang dùng
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{plan.display_name}</h3>
                    <p className="text-white/80 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="p-8 border-b border-slate-700">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString('vi-VN')}đ`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-slate-400 ml-2">
                          /{plan.billing_period === 'monthly' ? 'tháng' : 'năm'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-8 space-y-4">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      Tính năng:
                    </h4>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}

                    {/* Limits */}
                    <div className="pt-4 border-t border-slate-700 space-y-2">
                      <div className="flex items-center text-slate-400 text-sm">
                        <Database className="w-4 h-4 mr-2" />
                        {plan.limits.storage_gb}GB dung lượng
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        {plan.limits.max_files === -1 ? 'Không giới hạn' : `${plan.limits.max_files}`} files
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                        <Headphones className="w-4 h-4 mr-2" />
                        Hỗ trợ {plan.limits.support}
                      </div>
                      {plan.limits.team_members && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          {plan.limits.team_members} thành viên
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="p-8 pt-0">
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={`w-full py-6 text-lg font-semibold ${
                        isCurrent
                          ? 'bg-slate-700 cursor-not-allowed'
                          : `bg-gradient-to-r ${getPlanColor(plan.plan_name)} hover:opacity-90`
                      }`}
                    >
                      {isCurrent ? 'Gói hiện tại' : plan.price === 0 ? 'Sử dụng miễn phí' : 'Nâng cấp ngay'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            So sánh chi tiết các gói
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-300">Tính năng</th>
                  <th className="text-center py-4 px-4 text-slate-300">Free</th>
                  <th className="text-center py-4 px-4 text-purple-400">Premium</th>
                  <th className="text-center py-4 px-4 text-blue-400">Business</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700/50">
                  <td className="py-4 px-4">Dung lượng</td>
                  <td className="text-center py-4 px-4">1GB</td>
                  <td className="text-center py-4 px-4">10GB</td>
                  <td className="text-center py-4 px-4">100GB</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-4 px-4">Upload files</td>
                  <td className="text-center py-4 px-4">5 files</td>
                  <td className="text-center py-4 px-4">Không giới hạn</td>
                  <td className="text-center py-4 px-4">Không giới hạn</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-4 px-4">Workflows</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4">50</td>
                  <td className="text-center py-4 px-4">Không giới hạn</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-4 px-4">Hỗ trợ</td>
                  <td className="text-center py-4 px-4">Email</td>
                  <td className="text-center py-4 px-4">Ưu tiên</td>
                  <td className="text-center py-4 px-4">Dedicated</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-4 px-4">API Access</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Team Members</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-8 text-slate-400"
        >
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            <span>Bảo mật cao</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            <span>Nâng cấp bất cứ lúc nào</span>
          </div>
          <div className="flex items-center">
            <Headphones className="w-5 h-5 mr-2 text-purple-400" />
            <span>Hỗ trợ 24/7</span>
          </div>
        </motion.div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Nâng cấp lên {selectedPlan?.display_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Tổng thanh toán: <span className="text-green-400 font-bold text-xl">
                {selectedPlan?.price.toLocaleString('vi-VN')}đ
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Method */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Phương thức thanh toán *
              </label>
              <Select
                value={paymentData.payment_method}
                onValueChange={(value) =>
                  setPaymentData({ ...paymentData, payment_method: value })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.method_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Payment Method Details */}
            {paymentData.payment_method && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
              >
                {(() => {
                  const method = paymentMethods.find(m => m.id === paymentData.payment_method);
                  if (!method) return null;

                  return (
                    <div>
                      <h4 className="font-semibold text-white mb-3">
                        Thông tin thanh toán:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Tên tài khoản:</span>{' '}
                          <span className="font-mono">{method.account_holder}</span>
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Số tài khoản:</span>{' '}
                          <span className="font-mono text-lg">{method.account_number}</span>
                        </p>
                        {method.bank_name && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">Ngân hàng:</span> {method.bank_name}
                          </p>
                        )}
                        {method.instructions && (
                          <p className="text-yellow-400 mt-3">
                            💡 {method.instructions}
                          </p>
                        )}
                        {method.qr_code_url && (
                          <div className="mt-3">
                            <p className="text-slate-400 mb-2">Quét mã QR:</p>
                            <img
                              src={method.qr_code_url}
                              alt="QR Code"
                              className="w-48 h-48 bg-white p-2 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Payment Proof URL */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Link ảnh chứng từ (optional)
              </label>
              <Input
                value={paymentData.payment_proof_url}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, payment_proof_url: e.target.value })
                }
                placeholder="https://..."
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Ghi chú
              </label>
              <Textarea
                value={paymentData.payment_note}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, payment_note: e.target.value })
                }
                placeholder="Mã giao dịch, thời gian chuyển khoản..."
                rows={3}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                ℹ️ Sau khi thanh toán, vui lòng chờ admin xác nhận. Bạn sẽ nhận được thông báo khi tài khoản được nâng cấp.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="border-slate-700"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Xác nhận nâng cấp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
