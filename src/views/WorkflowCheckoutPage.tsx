import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  CheckCircle2,
  Upload,
  Clock,
  AlertCircle,
  QrCode,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import { workflowApi, orderApi } from '../lib/api/workflow-api';
import { supabase } from '../lib/supabase-config';
import { toast } from 'sonner';
import type { Workflow, WorkflowOrder } from '../types/workflow';
import { PAYMENT_INFO } from '../types/workflow';
import { sendAdminPaymentNotification } from '../lib/email-service';

// Type-safe wrapper
const db = supabase as any;

export default function WorkflowCheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [order, setOrder] = useState<WorkflowOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'info' | 'payment' | 'confirmation'>('info');

  // Form data
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  // Payment proof
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [copied, setCopied] = useState(false);

  const loadWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getWorkflowBySlug(slug!);
      setWorkflow(data);

      // Load user info if logged in
      const { data: { user } } = await db.auth.getUser();
      if (user) {
        const { data: account } = await db
          .from('nlc_accounts')
          .select('full_name, email, phone')
          .eq('user_id', user.id)
          .single();

        if (account) {
          setBuyerName(account.full_name);
          setBuyerEmail(account.email);
          setBuyerPhone(account.phone || '');
        }
      }
    } catch (error: any) {
      console.error('Error loading workflow:', error);
      toast.error('Không thể tải thông tin workflow');
      navigate('/workflows');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (slug) {
      loadWorkflow();
    }
  }, [slug, loadWorkflow]);

  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handleCreateOrder = async () => {
    if (!buyerName || !buyerEmail) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const newOrder = await orderApi.createOrder({
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        buyer_notes: buyerNotes,
        workflow_id: workflow!.id,
      });

      setOrder(newOrder);
      setStep('payment');
      toast.success('Đơn hàng đã được tạo!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file tối đa 5MB');
        return;
      }

      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofImage || !order) {
      toast.error('Vui lòng chọn ảnh chứng từ');
      return;
    }

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileName = `${order.order_code}_${Date.now()}.${proofImage.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await db.storage
        .from('payment-proofs')
        .upload(fileName, proofImage);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = db.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update order
      await orderApi.uploadPaymentProof({
        order_id: order.id,
        payment_proof_image: publicUrl,
      });

      setStep('confirmation');
      toast.success('Đã gửi chứng từ thanh toán!');

      // Send email notification to admin
      try {
        await sendAdminPaymentNotification({
          order_code: order.order_code,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          buyer_phone: order.buyer_phone || '',
          workflow_name: workflow.workflow_name,
          total_amount: order.total_amount.toLocaleString('vi-VN') + 'đ',
          payment_proof_url: publicUrl,
          created_at: new Date(order.created_at).toLocaleString('vi-VN'),
          notes: order.buyer_notes || '',
          verify_url: `${window.location.origin}/admin/workflows?tab=orders`,
        });
        console.log('✅ Admin notification sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send admin email, but order updated:', emailError);
      }
    } catch (error: any) {
      console.error('Error uploading proof:', error);
      toast.error('Không thể tải lên chứng từ');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Thanh toán</h1>
          <p className="text-slate-300">Mua workflow: {workflow.workflow_name}</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-blue-400' : step === 'payment' || step === 'confirmation' ? 'text-green-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-blue-500' : step === 'payment' || step === 'confirmation' ? 'bg-green-500' : 'bg-slate-600'}`}>
                1
              </div>
              <span>Thông tin</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-600" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-400' : step === 'confirmation' ? 'text-green-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-500' : step === 'confirmation' ? 'bg-green-500' : 'bg-slate-600'}`}>
                2
              </div>
              <span>Thanh toán</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-600" />
            <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-green-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-green-500' : 'bg-slate-600'}`}>
                3
              </div>
              <span>Xác nhận</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === 'info' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Thông tin người mua</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Họ và tên *</Label>
                      <Input
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Email *</Label>
                      <Input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        File workflow sẽ được gửi đến email này
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-300">Số điện thoại</Label>
                      <Input
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="0123456789"
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Ghi chú</Label>
                      <Textarea
                        value={buyerNotes}
                        onChange={(e) => setBuyerNotes(e.target.value)}
                        placeholder="Thêm ghi chú cho đơn hàng..."
                        className="bg-slate-900/50 border-slate-600 text-white"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleCreateOrder}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Quét mã QR để thanh toán</CardTitle>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <img
                          src={PAYMENT_INFO.qr_code_image}
                          alt="QR Code"
                          className="w-64 h-64 object-contain"
                          onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                        />
                      </div>
                    </div>

                    {/* Payment info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-4 h-4" />
                          <span>Số điện thoại:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">{PAYMENT_INFO.phone}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(PAYMENT_INFO.phone)}
                            className="h-8 w-8"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-slate-300 mb-2">Nội dung chuyển khoản:</p>
                        <div className="flex items-center justify-between">
                          <code className="text-white font-mono text-sm">
                            {order?.payment_content}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(order?.payment_content || '')}
                            className="h-8 w-8"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Upload proof */}
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6">
                      <Label className="text-white mb-2 block">
                        Tải lên ảnh chứng từ thanh toán *
                      </Label>

                      {proofPreview ? (
                        <div className="space-y-3">
                          <img
                            src={proofPreview}
                            alt="Preview"
                            className="w-full h-48 object-contain rounded-lg bg-slate-900/50"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setProofImage(null);
                                setProofPreview('');
                              }}
                              className="flex-1 border-slate-600"
                            >
                              Chọn lại
                            </Button>
                            <Button
                              onClick={handleUploadProof}
                              disabled={uploading}
                              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                            >
                              {uploading ? 'Đang gửi...' : 'Xác nhận đã chuyển khoản'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="proof-upload"
                          />
                          <label
                            htmlFor="proof-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="w-12 h-12 text-slate-400" />
                            <p className="text-slate-300">Click để chọn ảnh</p>
                            <p className="text-xs text-slate-500">JPG, PNG (tối đa 5MB)</p>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <p className="font-semibold text-blue-400 mb-1">Lưu ý:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Chuyển khoản đúng nội dung để xử lý nhanh hơn</li>
                          <li>Chụp ảnh chứng từ rõ ràng, đầy đủ thông tin</li>
                          <li>Đơn hàng sẽ tự động hủy sau 30 phút nếu không upload chứng từ</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6 text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Đã gửi chứng từ thành công!
                      </h3>
                      <p className="text-slate-300">
                        Mã đơn hàng: <span className="font-mono text-blue-400">{order?.order_code}</span>
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-slate-300 text-sm">
                        Chúng tôi sẽ xác nhận thanh toán trong vòng <strong className="text-blue-400">1-2 giờ</strong>.
                        <br />
                        File workflow sẽ được gửi đến email: <strong className="text-blue-400">{buyerEmail}</strong>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/workflows')}
                        className="flex-1 border-slate-600"
                      >
                        Quay về Marketplace
                      </Button>
                      <Button
                        onClick={() => navigate('/profile?tab=orders')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        Xem đơn hàng của tôi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <img
                    src={workflow.workflow_thumbnail}
                    alt={workflow.workflow_name}
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-white">{workflow.workflow_name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{workflow.workflow_category}</p>
                </div>

                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Giá workflow:</span>
                    <span>{formatPrice(workflow.workflow_price)}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-white border-t border-slate-700 pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-400">{formatPrice(workflow.workflow_price)}</span>
                  </div>
                </div>

                {order && (
                  <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Mã đơn:</span>
                      <span className="font-mono text-blue-400">{order.order_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      <Badge variant="outline" className="text-xs">
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
