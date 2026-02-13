/**
 * Payment Methods Management Page
 * Manage personal payment accounts for manual payment processing
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  QrCode,
  Building2,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { paymentMethodsApi } from '../lib/api/cms-api';
import type { PaymentMethod, CreatePaymentMethodDTO, UpdatePaymentMethodDTO } from '../types/cms';

export default function PaymentMethodsManagementPage() {
  const { userProfile } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePaymentMethodDTO>>({
    method_type: 'bank_transfer',
    method_name: '',
    account_holder: '',
    account_number: '',
    bank_name: '',
    qr_code_url: '',
    instructions: '',
    is_active: true,
    display_order: 0,
  });

  const isAdmin = userProfile?.account_role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    loadMethods();
  }, [isAdmin]);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodsApi.getAllPaymentMethods();
      setMethods(data);
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      toast.error('Không thể tải phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({
      method_type: 'bank_transfer',
      method_name: '',
      account_holder: '',
      account_number: '',
      bank_name: '',
      qr_code_url: '',
      instructions: '',
      is_active: true,
      display_order: methods.length,
    });
    setShowDialog(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_type: method.method_type,
      method_name: method.method_name,
      account_holder: method.account_holder,
      account_number: method.account_number,
      bank_name: method.bank_name || '',
      qr_code_url: method.qr_code_url || '',
      instructions: method.instructions || '',
      is_active: method.is_active,
      display_order: method.display_order,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.method_name || !formData.account_holder || !formData.account_number) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (editingMethod) {
        await paymentMethodsApi.updatePaymentMethod({
          id: editingMethod.id,
          ...formData,
        } as UpdatePaymentMethodDTO);
        toast.success('Đã cập nhật phương thức thanh toán');
      } else {
        await paymentMethodsApi.createPaymentMethod(formData as CreatePaymentMethodDTO);
        toast.success('Đã tạo phương thức thanh toán mới');
      }

      setShowDialog(false);
      loadMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast.error(error.message || 'Không thể lưu phương thức thanh toán');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) return;

    try {
      await paymentMethodsApi.deletePaymentMethod(id);
      toast.success('Đã xóa phương thức thanh toán');
      loadMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast.error('Không thể xóa phương thức thanh toán');
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      await paymentMethodsApi.togglePaymentMethod(method.id, !method.is_active);
      toast.success(method.is_active ? 'Đã tắt phương thức' : 'Đã bật phương thức');
      loadMethods();
    } catch (error: any) {
      console.error('Error toggling payment method:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building2 className="w-5 h-5" />;
      case 'momo':
      case 'zalopay':
        return <Smartphone className="w-5 h-5" />;
      case 'vnpay':
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return 'from-blue-500 to-cyan-500';
      case 'momo':
        return 'from-pink-500 to-rose-500';
      case 'zalopay':
        return 'from-blue-600 to-indigo-600';
      case 'vnpay':
        return 'from-orange-500 to-red-500';
      case 'paypal':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                💳 Quản lý Thanh toán
              </h1>
              <p className="text-slate-300">
                Cấu hình tài khoản thanh toán cá nhân cho hệ thống
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phương thức
            </Button>
          </div>
        </motion.div>

        {/* Payment Methods Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Đang tải...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {methods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${getMethodColor(method.method_type)} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        {getMethodIcon(method.method_type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {method.method_name}
                        </h3>
                        <Badge
                          variant={method.is_active ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {method.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(method)}
                        className="text-white hover:bg-white/20"
                      >
                        {method.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(method)}
                        className="text-white hover:bg-white/20"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(method.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Tên tài khoản</p>
                    <p className="text-white font-semibold">{method.account_holder}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Số tài khoản</p>
                    <p className="text-white font-mono text-lg">{method.account_number}</p>
                  </div>

                  {method.bank_name && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Ngân hàng</p>
                      <p className="text-white">{method.bank_name}</p>
                    </div>
                  )}

                  {method.qr_code_url && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Mã QR</p>
                      <div className="bg-white p-2 rounded-lg inline-block">
                        <img
                          src={method.qr_code_url}
                          alt="QR Code"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {method.instructions && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Hướng dẫn</p>
                      <p className="text-slate-300 text-sm">{method.instructions}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700 text-sm text-slate-500">
                    Thứ tự hiển thị: {method.display_order}
                  </div>
                </div>
              </motion.div>
            ))}

            {methods.length === 0 && (
              <div className="col-span-full text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Chưa có phương thức thanh toán nào</p>
                <Button
                  onClick={handleCreate}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Thêm phương thức đầu tiên
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Chỉnh sửa phương thức' : 'Thêm phương thức mới'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cấu hình thông tin tài khoản thanh toán
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Loại phương thức *</label>
              <Select
                value={formData.method_type}
                onValueChange={(value: any) => setFormData({ ...formData, method_type: value })}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                  <SelectItem value="momo">Ví MoMo</SelectItem>
                  <SelectItem value="zalopay">ZaloPay</SelectItem>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Tên hiển thị *</label>
              <Input
                value={formData.method_name}
                onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
                placeholder="VD: Chuyển khoản Vietcombank"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Tên tài khoản *</label>
              <Input
                value={formData.account_holder}
                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                placeholder="TRAN MINH LONG"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Số tài khoản *</label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="0123456789"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            {(formData.method_type === 'bank_transfer') && (
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Tên ngân hàng</label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Vietcombank, Techcombank..."
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300 mb-2 block">URL mã QR (tùy chọn)</label>
              <Input
                value={formData.qr_code_url}
                onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                placeholder="https://..."
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Hướng dẫn thanh toán</label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="VD: Vui lòng ghi rõ mã đơn hàng khi chuyển khoản..."
                rows={3}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Kích hoạt ngay</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-slate-700">
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
