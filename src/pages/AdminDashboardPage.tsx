import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading } from "../components/ui/loading";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ShoppingBag,
  Crown,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase-config";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  verifiedPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalFiles: number;
  totalCourses: number;
  totalWorkflows: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface PaymentData {
  amount: number | string;
  payment_status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalFiles: 0,
    totalCourses: 0,
    totalWorkflows: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

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
      loadDashboardData();
    }
  }, [userProfile, authLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel queries for better performance
      const [
        usersResult,
        activeUsersResult,
        suspendedUsersResult,
        subscriptionsResult,
        activeSubscriptionsResult,
        pendingPaymentsResult,
        verifiedPaymentsResult,
        allPaymentsResult,
        filesResult,
        activitiesResult,
      ] = await Promise.all([
        // Total users
        supabase.from("nlc_accounts").select("*", { count: "exact", head: true }),

        // Active users
        supabase.from("nlc_accounts").select("*", { count: "exact", head: true }).eq("account_status", "active"),

        // Suspended users
        supabase.from("nlc_accounts").select("*", { count: "exact", head: true }).eq("account_status", "suspended"),

        // Total subscriptions
        supabase.from("nlc_user_subscriptions").select("*", { count: "exact", head: true }),

        // Active subscriptions
        supabase.from("nlc_user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),

        // Pending payments
        supabase.from("nlc_subscription_payments").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),

        // Verified payments
        supabase.from("nlc_subscription_payments").select("*", { count: "exact", head: true }).eq("payment_status", "verified"),

        // All payments for revenue calculation
        supabase.from("nlc_subscription_payments").select("amount, payment_status, created_at").eq("payment_status", "verified"),

        // Total files
        supabase.from("nlc_user_files").select("*", { count: "exact", head: true }),

        // Recent activities
        supabase.from("user_activities").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      // Calculate revenue - Type cast the data to PaymentData[]
      const paymentData = (allPaymentsResult.data as unknown as PaymentData[]) || [];
      const totalRevenue = paymentData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRevenue = paymentData
        .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        suspendedUsers: suspendedUsersResult.count || 0,
        totalSubscriptions: subscriptionsResult.count || 0,
        activeSubscriptions: activeSubscriptionsResult.count || 0,
        pendingPayments: pendingPaymentsResult.count || 0,
        verifiedPayments: verifiedPaymentsResult.count || 0,
        totalRevenue,
        monthlyRevenue,
        totalFiles: filesResult.count || 0,
        totalCourses: 0, // TODO: Add courses table
        totalWorkflows: 0, // TODO: Add workflows table
      });

      // Format recent activities
      const formattedActivities: RecentActivity[] = (activitiesResult.data || []).map((activity) => ({
        id: activity.id,
        type: activity.action_type,
        description: activity.description,
        timestamp: activity.created_at,
        user: activity.user_id,
      }));

      setRecentActivities(formattedActivities);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Có lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 text-blue-400" />
              Dashboard Admin
            </h1>
            <p className="text-gray-400 mt-2">
              Tổng quan và thống kê hệ thống
            </p>
          </div>
          <Button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Activity className="h-5 w-5 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer"
              onClick={() => navigate("/admin/users")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-green-500/20 text-green-400">
                    {stats.activeUsers} hoạt động
                  </Badge>
                  {stats.suspendedUsers > 0 && (
                    <Badge className="bg-red-500/20 text-red-400">
                      {stats.suspendedUsers} bị chặn
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Subscriptions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer"
              onClick={() => navigate("/admin/subscriptions")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Crown className="h-6 w-6 text-purple-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Subscriptions</p>
                <p className="text-3xl font-bold text-white mb-2">{stats.activeSubscriptions}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {stats.totalSubscriptions} tổng số
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/20 transition-all cursor-pointer"
              onClick={() => navigate("/admin/subscriptions")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-white mb-2">{stats.pendingPayments}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-green-500/20 text-green-400">
                    {stats.verifiedPayments} đã duyệt
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:shadow-xl hover:shadow-green-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-green-500/20 text-green-400">
                    {formatCurrency(stats.monthlyRevenue)} / tháng
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <FileText className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tổng Files</p>
                  <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-pink-500/20">
                  <ShoppingBag className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Workflows</p>
                  <p className="text-2xl font-bold text-white">{stats.totalWorkflows}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <FileText className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Khóa học</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Thao tác nhanh</CardTitle>
              <CardDescription className="text-gray-400">
                Các chức năng quản trị thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => navigate("/admin/users")}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
              >
                <Users className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-white">Quản lý Users</span>
              </Button>

              <Button
                onClick={() => navigate("/admin/subscriptions")}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
              >
                <CreditCard className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-white">Subscriptions</span>
              </Button>

              <Button
                onClick={() => navigate("/admin/cms")}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
              >
                <FileText className="h-6 w-6 text-cyan-400" />
                <span className="text-sm text-white">CMS</span>
              </Button>

              <Button
                onClick={() => navigate("/admin/payment-methods")}
                className="h-24 flex flex-col items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20"
              >
                <DollarSign className="h-6 w-6 text-green-400" />
                <span className="text-sm text-white">Thanh toán</span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Hoạt động gần đây</CardTitle>
              <CardDescription className="text-gray-400">
                10 hoạt động mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Chưa có hoạt động nào
                  </p>
                ) : (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Activity className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
