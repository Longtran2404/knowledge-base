import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading } from "../components/ui/loading";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Crown,
  Briefcase,
  GraduationCap,
  Shield,
  Mail,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase-config";
import { toast } from "sonner";

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  account_role: "sinh_vien" | "giang_vien" | "quan_ly" | "admin";
  account_status: "active" | "inactive" | "suspended" | "pending_approval";
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  last_login_at?: string;
}

const ROLE_LABELS = {
  sinh_vien: "Học viên",
  giang_vien: "Giảng viên",
  quan_ly: "Quản lý",
  admin: "Admin",
};

const ROLE_COLORS = {
  sinh_vien: "bg-blue-500",
  giang_vien: "bg-green-500",
  quan_ly: "bg-purple-500",
  admin: "bg-red-500",
};

const ROLE_ICONS = {
  sinh_vien: GraduationCap,
  giang_vien: Briefcase,
  quan_ly: Shield,
  admin: Crown,
};

const STATUS_COLORS = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  suspended: "bg-red-500",
  pending_approval: "bg-yellow-500",
};

export default function AdminUsersPage() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    account_role: "",
    account_status: "",
  });

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
      loadUsers();
    }
  }, [userProfile, authLoading, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("nlc_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Có lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== "all") {
      filtered = filtered.filter((u) => u.account_role === filterRole);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((u) => u.account_status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, filterStatus, users]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      account_role: user.account_role,
      account_status: user.account_status,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      // Fixed TypeScript error by casting to any
      const { error } = await (supabase as any)
        .from("nlc_accounts")
        .update({
          full_name: editForm.full_name,
          account_role: editForm.account_role,
          account_status: editForm.account_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Cập nhật thành công!");
      setShowEditDialog(false);
      loadUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Có lỗi khi cập nhật người dùng");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("nlc_accounts")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Xóa người dùng thành công!");
      setShowDeleteDialog(false);
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Có lỗi khi xóa người dùng");
    }
  };

  const handleSuspendUser = async (user: User) => {
    try {
      const newStatus = user.account_status === "suspended" ? "active" : "suspended";
      const { error } = await (supabase as any)
        .from("nlc_accounts")
        .update({
          account_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success(
        newStatus === "suspended"
          ? "Đã đình chỉ tài khoản"
          : "Đã kích hoạt lại tài khoản"
      );
      loadUsers();
    } catch (error: any) {
      console.error("Error suspending user:", error);
      toast.error("Có lỗi khi cập nhật trạng thái");
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.account_status === "active").length,
    suspended: users.filter((u) => u.account_status === "suspended").length,
    admins: users.filter((u) => u.account_role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-400" />
              Quản lý Người dùng
            </h1>
            <p className="text-gray-400 mt-2">
              Quản lý tài khoản, phân quyền và trạng thái người dùng
            </p>
          </div>
          <Button
            onClick={() => navigate("/dang-ky")}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Thêm người dùng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tổng số</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Hoạt động</p>
                  <p className="text-3xl font-bold text-white">{stats.active}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bị đình chỉ</p>
                  <p className="text-3xl font-bold text-white">{stats.suspended}</p>
                </div>
                <Ban className="h-12 w-12 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Quản trị viên</p>
                  <p className="text-3xl font-bold text-white">{stats.admins}</p>
                </div>
                <Crown className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo email hoặc tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="sinh_vien">Học viên</SelectItem>
                  <SelectItem value="giang_vien">Giảng viên</SelectItem>
                  <SelectItem value="quan_ly">Quản lý</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="suspended">Đình chỉ</SelectItem>
                  <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Danh sách người dùng ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Người dùng</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Vai trò</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Trạng thái</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Gói</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Ngày tạo</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = ROLE_ICONS[user.account_role];
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${ROLE_COLORS[user.account_role]} flex items-center justify-center`}>
                              <span className="text-white font-bold">
                                {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.full_name}</p>
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${ROLE_COLORS[user.account_role]} text-white`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {ROLE_LABELS[user.account_role]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`${STATUS_COLORS[user.account_status]} text-white`}
                          >
                            {user.account_status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300">{user.subscription_plan || "free"}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSuspendUser(user)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            >
                              {user.account_status === "suspended" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Không tìm thấy người dùng nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cập nhật thông tin và phân quyền người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Họ và tên</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Vai trò</Label>
              <Select
                value={editForm.account_role}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, account_role: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sinh_vien">Học viên</SelectItem>
                  <SelectItem value="giang_vien">Giảng viên</SelectItem>
                  <SelectItem value="quan_ly">Quản lý</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Trạng thái</Label>
              <Select
                value={editForm.account_status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, account_status: value })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="suspended">Đình chỉ</SelectItem>
                  <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowEditDialog(false)}
              className="text-gray-400"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.email}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-gray-400"
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
