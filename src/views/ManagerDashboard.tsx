import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { safeParseJson } from "../lib/safe-json";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { DocumentApproval } from "../components/admin/document-approval";
import { DocumentUpload } from "../components/upload/document-upload";
import { FloatingScrollToTop } from "../components/ui/scroll-to-top";
import {
  BarChart3,
  FileText,
  Users,
  Upload,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  Download,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalDocuments: number;
  pendingApprovals: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyUploads: number;
  downloadCount: number;
}

export default function ManagerDashboard() {
  const { userProfile: user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    pendingApprovals: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    totalUsers: 0,
    totalRevenue: 0,
    monthlyUploads: 0,
    downloadCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.account_role !== "admin")) {
      navigate("/auth");
      return;
    }

    if (user?.account_role === "admin") {
      loadDashboardData();
    }
  }, [user, isLoading, navigate]);

  const loadDashboardData = () => {
    try {
      // Load documents data
      const documentsData = localStorage.getItem("nlc_uploaded_documents");
      const docsParsed = safeParseJson(documentsData, [] as unknown[]);
      const documents: unknown[] = Array.isArray(docsParsed) ? docsParsed : [];

      // Load users data
      const usersData = localStorage.getItem("kb_users_data");
      const usersParsed = safeParseJson(usersData, [] as unknown[]);
      const users: unknown[] = Array.isArray(usersParsed) ? usersParsed : [];

      // Calculate stats
      const pendingApprovals = documents.filter(
        (doc: any) => doc.status === "pending_approval"
      ).length;
      const approvedDocuments = documents.filter(
        (doc: any) => doc.status === "approved"
      ).length;
      const rejectedDocuments = documents.filter(
        (doc: any) => doc.status === "rejected"
      ).length;

      // Calculate revenue (mock data for demonstration)
      const totalRevenue = documents
        .filter((d: unknown) => (d as { status?: string; price?: number })?.status === "approved" && ((d as { price?: number })?.price ?? 0) > 0)
        .reduce((sum: number, d: unknown) => sum + ((d as { price?: number })?.price ?? 0) * ((d as { downloads?: number })?.downloads ?? 0), 0) as number;

      // Monthly uploads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyUploads = documents.filter(
        (d: unknown) => new Date((d as { uploadedAt?: string })?.uploadedAt ?? 0) > thirtyDaysAgo
      ).length;

      // Total downloads (mock data)
      const downloadCount = documents.reduce(
        (sum: number, d: unknown) => sum + ((d as { downloads?: number })?.downloads ?? 0),
        0
      ) as number;

      setStats({
        totalDocuments: documents.length,
        pendingApprovals,
        approvedDocuments,
        rejectedDocuments,
        totalUsers: users.length,
        totalRevenue,
        monthlyUploads,
        downloadCount,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Có lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadDashboardData();
    toast.success("Đã cập nhật dữ liệu");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.account_role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Không có quyền truy cập
            </h3>
            <p className="text-gray-500 mb-4">
              Bạn cần quyền quản trị để truy cập trang này
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Manager Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Quản lý tài liệu, người dùng và hệ thống
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tài liệu</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <Upload className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cài đặt</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tổng tài liệu</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalDocuments}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Chờ duyệt</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {stats.pendingApprovals}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Đã duyệt</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.approvedDocuments}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Từ chối</p>
                        <p className="text-2xl font-bold text-red-600">
                          {stats.rejectedDocuments}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Người dùng</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.totalUsers}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doanh thu</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Upload tháng</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats.monthlyUploads}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lượt tải</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {stats.downloadCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>
                    Các tác vụ thường dùng trong quản trị hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setActiveTab("documents")}
                      className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Eye className="w-6 h-6" />
                      <span>Duyệt tài liệu</span>
                      {stats.pendingApprovals > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {stats.pendingApprovals}
                        </Badge>
                      )}
                    </Button>

                    <Button
                      onClick={() => setActiveTab("upload")}
                      variant="outline"
                      className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Tải lên tài liệu</span>
                    </Button>

                    <Button
                      onClick={() => setActiveTab("settings")}
                      variant="outline"
                      className="h-20 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                    >
                      <Settings className="w-6 h-6" />
                      <span>Cài đặt hệ thống</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              {stats.pendingApprovals > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            Có {stats.pendingApprovals} tài liệu đang chờ duyệt
                          </p>
                          <p className="text-sm text-yellow-700">
                            Hãy kiểm tra và duyệt các tài liệu để người dùng có
                            thể truy cập
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("documents")}
                          className="ml-auto bg-yellow-600 hover:bg-yellow-700"
                        >
                          Xem ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DocumentApproval />
            </motion.div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DocumentUpload />
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Settings className="w-6 h-6" />
                    Cài đặt hệ thống
                  </CardTitle>
                  <CardDescription>
                    Quản lý cấu hình và thiết lập hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Đang phát triển
                    </h3>
                    <p className="text-gray-500">
                      Tính năng cài đặt hệ thống sẽ được bổ sung trong phiên bản
                      tiếp theo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Scroll to Top */}
      <FloatingScrollToTop />
    </div>
  );
}
