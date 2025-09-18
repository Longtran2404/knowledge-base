import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { activityService } from "../lib/activity-service";
import type { UserActivity } from "../lib/supabase-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Activity,
  Clock,
  FileText,
  LogIn,
  LogOut,
  ShoppingCart,
  User,
  BookOpen,
  Upload,
  Download,
  Lock,
  CreditCard,
  Search,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ActivityStats {
  total: number;
  byType: Record<string, number>;
  byDay: Record<string, number>;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "login":
      return <LogIn className="w-4 h-4" />;
    case "logout":
      return <LogOut className="w-4 h-4" />;
    case "register":
      return <User className="w-4 h-4" />;
    case "course_purchase":
      return <ShoppingCart className="w-4 h-4" />;
    case "course_start":
    case "course_complete":
      return <BookOpen className="w-4 h-4" />;
    case "file_upload":
      return <Upload className="w-4 h-4" />;
    case "file_download":
      return <Download className="w-4 h-4" />;
    case "profile_update":
      return <User className="w-4 h-4" />;
    case "password_change":
      return <Lock className="w-4 h-4" />;
    case "payment":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case "login":
      return "bg-green-100 text-green-800";
    case "logout":
      return "bg-gray-100 text-gray-800";
    case "register":
      return "bg-blue-100 text-blue-800";
    case "course_purchase":
    case "payment":
      return "bg-purple-100 text-purple-800";
    case "course_start":
      return "bg-yellow-100 text-yellow-800";
    case "course_complete":
      return "bg-green-100 text-green-800";
    case "file_upload":
      return "bg-blue-100 text-blue-800";
    case "file_download":
      return "bg-indigo-100 text-indigo-800";
    case "profile_update":
      return "bg-orange-100 text-orange-800";
    case "password_change":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getActionText = (actionType: string) => {
  switch (actionType) {
    case "login":
      return "Đăng nhập";
    case "logout":
      return "Đăng xuất";
    case "register":
      return "Đăng ký";
    case "course_purchase":
      return "Mua khóa học";
    case "course_start":
      return "Bắt đầu khóa học";
    case "course_complete":
      return "Hoàn thành khóa học";
    case "file_upload":
      return "Tải lên tệp";
    case "file_download":
      return "Tải xuống tệp";
    case "profile_update":
      return "Cập nhật hồ sơ";
    case "password_change":
      return "Đổi mật khẩu";
    case "payment":
      return "Thanh toán";
    default:
      return "Hoạt động khác";
  }
};

export default function ActivityDashboard() {
  const { userProfile, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    byType: {},
    byDay: {},
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: "",
    startDate: "",
    endDate: "",
    limit: 50,
  });

  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      loadActivities();
      loadStats();
    }
  }, [isAuthenticated, userProfile, filters, loadActivities, loadStats]);

  const loadActivities = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const data = await activityService.getUserActivities(userProfile.id, {
        limit: filters.limit,
        actionType: filters.actionType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!userProfile?.id) return;

    try {
      const data = await activityService.getActivityStats(userProfile.id, 30);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      actionType: "",
      startDate: "",
      endDate: "",
      limit: 50,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Vui lòng đăng nhập để xem lịch sử hoạt động.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử hoạt động</h1>
          <p className="text-muted-foreground">
            Theo dõi các hoạt động của bạn trên hệ thống
          </p>
        </div>
        <Button variant="outline" onClick={loadActivities}>
          <Activity className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Hoạt động</TabsTrigger>
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="actionType">Loại hoạt động</Label>
                  <Select
                    value={filters.actionType}
                    onValueChange={(value) => handleFilterChange("actionType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="login">Đăng nhập</SelectItem>
                      <SelectItem value="logout">Đăng xuất</SelectItem>
                      <SelectItem value="course_purchase">Mua khóa học</SelectItem>
                      <SelectItem value="file_upload">Tải lên tệp</SelectItem>
                      <SelectItem value="profile_update">Cập nhật hồ sơ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Từ ngày</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Đến ngày</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={loadActivities}>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách hoạt động</CardTitle>
              <CardDescription>
                Hiển thị {activities.length} hoạt động gần đây nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Đang tải...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p>Không có hoạt động nào được tìm thấy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getActionColor(activity.action_type)}`}>
                        {getActionIcon(activity.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">
                            {getActionText(activity.action_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.metadata && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <details>
                              <summary className="cursor-pointer">Chi tiết</summary>
                              <pre className="mt-1 whitespace-pre-wrap">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{format(new Date(activity.created_at), "dd/MM/yyyy")}</div>
                        <div>{format(new Date(activity.created_at), "HH:mm:ss")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Trong 30 ngày qua
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loại hoạt động</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.byType).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Loại hoạt động khác nhau
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoạt động hàng ngày</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(stats.total / 30)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trung bình mỗi ngày
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Phân tích theo loại hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${getActionColor(type)}`}>
                          {getActionIcon(type)}
                        </div>
                        <span className="text-sm">{getActionText(type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}