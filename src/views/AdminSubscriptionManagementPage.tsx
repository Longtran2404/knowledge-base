import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading } from "../components/ui/loading";
import {
  Crown,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  User,
  Calendar,
  FileText,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase-config";
import { toast } from "sonner";
import { SubscriptionPayment, SubscriptionPlan } from "../types/subscription";

interface PaymentWithDetails extends Omit<SubscriptionPayment, 'plan'> {
  user?: {
    email: string;
    full_name: string;
  };
  plan?: SubscriptionPlan;
}

interface SePayPendingOrder {
  order_invoice_number: string;
  user_id: string;
  plan: string;
  amount_cents: number;
  created_at: string;
  email?: string;
}

export default function AdminSubscriptionManagementPage() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sepayPending, setSepayPending] = useState<SePayPendingOrder[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [filterSePayOnly, setFilterSePayOnly] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!userProfile) {
        navigate("/auth");
        return;
      }
      if (userProfile.account_role !== "admin") {
        toast.error("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }
      loadPayments();
      loadPendingSePay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, authLoading, navigate]);

  useEffect(() => {
    filterPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterSePayOnly, payments]);

  const loadPendingSePay = async () => {
    try {
      setLoadingPending(true);
      const { data: rows, error } = await supabase
        .from("nlc_sepay_pending_orders")
        .select("order_invoice_number, user_id, plan, amount_cents, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const withEmail: SePayPendingOrder[] = await Promise.all(
        (rows || []).map(async (r: any) => {
          const { data: acc } = await supabase
            .from("nlc_accounts")
            .select("email")
            .eq("user_id", r.user_id)
            .single();
          const email = acc && typeof acc === "object" && "email" in acc ? (acc as { email: string }).email : undefined;
          return { ...r, email };
        })
      );
      setSepayPending(withEmail);
    } catch (e: any) {
      console.error("Load SePay pending failed:", e);
      toast.error(e.message || "Không tải được đơn SePay đang chờ");
    } finally {
      setLoadingPending(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);

      // Get payments first
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("nlc_subscription_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Get user info and plan info separately
      const paymentsWithDetails: PaymentWithDetails[] = await Promise.all(
        (paymentsData || []).map(async (payment: any) => {
          // Get user info from nlc_accounts
          const { data: userData } = await supabase
            .from("nlc_accounts")
            .select("email, full_name")
            .eq("user_id", payment.user_id)
            .single();

          // Get plan info
          const { data: planData } = await supabase
            .from("nlc_subscription_plans")
            .select("*")
            .eq("id", payment.plan_id)
            .single();

          return {
            ...payment,
            user: userData || undefined,
            plan: planData || undefined,
          };
        })
      );

      setPayments(paymentsWithDetails);
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error(error.message || "Có lỗi khi tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (filterSePayOnly) {
      filtered = filtered.filter(p => (p as any).payment_method === "sepay");
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.payment_status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.user?.email?.toLowerCase().includes(term) ||
        p.user?.full_name?.toLowerCase().includes(term) ||
        p.transaction_id?.toLowerCase().includes(term) ||
        p.plan?.display_name?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleVerifyPayment = async (payment: PaymentWithDetails, approve: boolean) => {
    try {
      setVerifying(true);
      const db = supabase as any;

      if (approve) {
        // Approve payment
        const { error: paymentError } = await db
          .from("nlc_subscription_payments")
          .update({
            payment_status: "completed",
            verified_by: userProfile?.id,
            verified_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (paymentError) throw paymentError;

        // Update subscription status to active
        const { error: subError } = await db
          .from("nlc_user_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.subscription_id);

        if (subError) throw subError;

        toast.success("Đã xác nhận thanh toán và kích hoạt subscription!");
      } else {
        // Reject payment
        const { error } = await db
          .from("nlc_subscription_payments")
          .update({
            payment_status: "failed",
            verified_by: userProfile?.id,
            verified_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (error) throw error;

        // Cancel subscription
        const { error: subError } = await db
          .from("nlc_user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: "Thanh toán bị từ chối",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.subscription_id);

        if (subError) throw subError;

        toast.success("Đã từ chối thanh toán");
      }

      setShowDetailDialog(false);
      loadPayments();
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error(error.message || "Có lỗi khi xác minh thanh toán");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Chờ xác nhận</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quản lý Subscription
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Xác nhận thanh toán và quản lý gói dịch vụ
              </p>
            </div>
          </div>

          {/* SePay pending orders */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Đơn SePay đang chờ
              </CardTitle>
              <CardDescription>
                Các đơn thanh toán qua SePay chưa hoàn tất (sẽ tự cập nhật khi IPN nhận callback)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="py-6 text-center text-muted-foreground">Đang tải...</div>
              ) : sepayPending.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Không có đơn nào đang chờ.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-4 font-medium">Mã đơn</th>
                        <th className="pb-2 pr-4 font-medium">Email</th>
                        <th className="pb-2 pr-4 font-medium">Gói</th>
                        <th className="pb-2 pr-4 font-medium">Số tiền</th>
                        <th className="pb-2 pr-4 font-medium">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sepayPending.map((row) => (
                        <tr key={row.order_invoice_number} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono text-xs">{row.order_invoice_number}</td>
                          <td className="py-3 pr-4">{row.email || row.user_id}</td>
                          <td className="py-3 pr-4">{row.plan}</td>
                          <td className="py-3 pr-4">{row.amount_cents?.toLocaleString("vi-VN")}đ</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {new Date(row.created_at).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo email, tên, mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterSePayOnly ? "default" : "outline"}
                onClick={() => setFilterSePayOnly(!filterSePayOnly)}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                SePay
              </Button>
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                Tất cả ({payments.length})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                Chờ ({payments.filter(p => p.payment_status === "pending").length})
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
              >
                Đã duyệt ({payments.filter(p => p.payment_status === "completed").length})
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thanh toán nào</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Không tìm thấy thanh toán phù hợp với bộ lọc"
                    : "Chưa có thanh toán nào được tạo"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: User & Plan Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {payment.user?.full_name?.charAt(0) || payment.user?.email?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{payment.user?.full_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{payment.user?.email}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Crown className="w-3 h-3 mr-1" />
                            {payment.plan?.display_name || "N/A"}
                          </Badge>
                          <span className="text-gray-500">•</span>
                          <span className="font-semibold text-gray-900">
                            {payment.amount?.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {payment.transaction_id && (
                          <div className="text-xs text-gray-500">
                            Mã GD: {payment.transaction_id}
                          </div>
                        )}
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-3">
                        <div>{getStatusBadge(payment.payment_status)}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail Dialog */}
        {selectedPayment && (
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết thanh toán</DialogTitle>
                <DialogDescription>
                  Xem thông tin và xác minh thanh toán
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-2">{getStatusBadge(selectedPayment.payment_status)}</div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Người dùng
                    </Label>
                    <div className="mt-2 text-sm">
                      <div className="font-medium">{selectedPayment.user?.full_name || "N/A"}</div>
                      <div className="text-gray-500">{selectedPayment.user?.email}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Gói dịch vụ
                    </Label>
                    <div className="mt-2 text-sm">
                      <div className="font-medium">{selectedPayment.plan?.display_name}</div>
                      <div className="text-gray-500">{selectedPayment.plan?.price?.toLocaleString("vi-VN")}đ</div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Số tiền
                    </Label>
                    <div className="mt-2 text-lg font-bold text-purple-600">
                      {selectedPayment.amount?.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Phương thức
                    </Label>
                    <div className="mt-2 text-sm font-medium">
                      {selectedPayment.payment_method || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                {selectedPayment.transaction_id && (
                  <div>
                    <Label className="text-sm font-medium">Mã giao dịch</Label>
                    <div className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedPayment.transaction_id}
                    </div>
                  </div>
                )}

                {/* Payment Proof */}
                {selectedPayment.payment_proof_url && (
                  <div>
                    <Label className="text-sm font-medium">Ảnh chứng từ</Label>
                    <div className="mt-2">
                      <img
                        src={selectedPayment.payment_proof_url}
                        alt="Payment proof"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  </div>
                )}

                {/* Note */}
                {selectedPayment.payment_note && (
                  <div>
                    <Label className="text-sm font-medium">Ghi chú</Label>
                    <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
                      {selectedPayment.payment_note}
                    </div>
                  </div>
                )}

                {/* Verification Info */}
                {selectedPayment.verified_at && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Thông tin xác minh</Label>
                    <div className="mt-2 text-sm text-gray-600">
                      Xác minh lúc: {new Date(selectedPayment.verified_at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedPayment.payment_status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleVerifyPayment(selectedPayment, true)}
                      disabled={verifying}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {verifying ? <Loading variant="spinner" size="sm" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Xác nhận thanh toán
                    </Button>
                    <Button
                      onClick={() => handleVerifyPayment(selectedPayment, false)}
                      disabled={verifying}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
 
