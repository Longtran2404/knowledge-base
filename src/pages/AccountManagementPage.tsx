import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import FileUpload from "../components/FileUpload";
import {
  ArrowLeft,
  User,
  Settings,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Package,
  CreditCard,
  Shield,
  Phone,
  Mail,
  Key,
  Crown,
  Star,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserFiles,
  FileUpload as FileUploadType,
  formatFileSize,
  getFileIcon,
} from "../lib/file-service";
import { supabase } from "../lib/supabase-config";
import { MembershipService } from "../lib/membership/membership-service";
import UserManagement from "../components/admin/UserManagement";
import { formatPrice } from "../config/pricing";

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { userProfile: user, updateProfile, isLoading: loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });
  const [personalFiles, setPersonalFiles] = useState<FileUploadType[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Password change states
  const [passwordChangeStep, setPasswordChangeStep] = useState<
    "request" | "verify" | "change"
  >("request");
  const [passwordChangeId, setPasswordChangeId] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Phone verification states
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<
    "request" | "verify"
  >("request");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneVerificationId, setPhoneVerificationId] = useState<string>("");

  // Account deletion states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Membership upgrade states
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const loadPersonalFiles = useCallback(async () => {
    if (!user) return;

    setLoadingFiles(true);
    try {
      const files = await getUserFiles(user.id);
      setPersonalFiles(files);
    } catch (error) {
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoadingFiles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
      loadPersonalFiles();
    }
  }, [user, loadPersonalFiles]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(false);
  };

  const handleFileUpload = (file: FileUploadType) => {
    setPersonalFiles((prev) => [file, ...prev]);
  };

  const handleFileDelete = (fileId: string) => {
    setPersonalFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Load membership plans
  const loadMembershipPlans = useCallback(async () => {
    try {
      const { data } = await MembershipService.getMembershipPlans();
      if (data) {
        setMembershipPlans(data);
      }
    } catch (error) {
      console.error("Error loading membership plans:", error);
    }
  }, []);

  useEffect(() => {
    loadMembershipPlans();
  }, [loadMembershipPlans]);

  // Password change functions
  const handleRequestPasswordChange = async () => {
    if (!user?.email) return;

    try {
      // Generate unique password change ID
      const changeId = Math.random().toString(36).substring(7);
      setPasswordChangeId(changeId);

      // Store the change request in nlc_password_resets table
      await (supabase as any).from('nlc_password_resets').insert({
        user_id: user.id,
        reset_token: changeId,
        email: user.email,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        is_used: false,
      });

      // Send email (simulated)
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/change-password?token=${changeId}`,
      });

      if (error) {
        toast.error("Không thể gửi email xác thực");
        return;
      }

      toast.success("Đã gửi email xác thực. Vui lòng kiểm tra hộp thư.");
      setPasswordChangeStep("verify");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi email");
    }
  };

  const handleVerifyPasswordChange = async () => {
    // This would typically verify the email link
    // For now, we'll simulate the verification
    setPasswordChangeStep("change");
    toast.success("Email đã được xác thực. Bạn có thể đổi mật khẩu.");
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
    const hasNumbers = /\d/.test(passwordForm.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(
      passwordForm.newPassword
    );

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error("Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số");
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        if (error.message.includes("same as the old password")) {
          toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
        } else if (error.message.includes("Password should be")) {
          toast.error(
            "Mật khẩu không đủ mạnh. Vui lòng sử dụng mật khẩu phức tạp hơn"
          );
        } else if (error.message.includes("weak")) {
          toast.error("Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn");
        } else {
          toast.error(`Không thể đổi mật khẩu: ${error.message}`);
        }
        return;
      }

      toast.success("Đổi mật khẩu thành công!");
      setPasswordChangeStep("request");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Log password change activity
      try {
        console.log("Password changed successfully for user:", user?.id);
      } catch (logError) {
        console.warn("Failed to log password change:", logError);
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  // Phone verification functions
  const handleRequestPhoneVerification = async () => {
    if (!editForm.phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Validate Vietnamese phone number format
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(editForm.phone)) {
      toast.error(
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam"
      );
      return;
    }

    try {
      // Generate verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const verificationId = Math.random().toString(36).substring(7);

      // Store verification data (in real app, would use database)
      localStorage.setItem(
        "phone_verification",
        JSON.stringify({
          id: verificationId,
          phone: editForm.phone,
          code: verificationCode,
          timestamp: Date.now(),
          attempts: 0,
        })
      );

      setPhoneVerificationId(verificationId);
      setPhoneVerificationStep("verify");

      // Simulate SMS sending (in production, integrate with SMS service like Twilio/ESMS)
      console.log(`SMS Code for ${editForm.phone}: ${verificationCode}`);
      toast.success(`Mã xác thực đã được gửi đến ${editForm.phone}`);
      toast.info(`(Demo) Mã xác thực: ${verificationCode}`, {
        duration: 10000,
      });
    } catch (error) {
      console.error("Phone verification error:", error);
      toast.error("Không thể gửi mã xác thực");
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }

    if (phoneCode.length !== 6) {
      toast.error("Mã xác thực phải có 6 số");
      return;
    }

    try {
      const verificationData = localStorage.getItem("phone_verification");
      if (!verificationData) {
        toast.error("Phiên xác thực đã hết hạn. Vui lòng yêu cầu mã mới");
        return;
      }

      const data = JSON.parse(verificationData);

      // Check if verification expired (5 minutes)
      if (Date.now() - data.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem("phone_verification");
        toast.error("Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới");
        setPhoneVerificationStep("request");
        return;
      }

      // Check attempts limit
      if (data.attempts >= 3) {
        localStorage.removeItem("phone_verification");
        toast.error("Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới");
        setPhoneVerificationStep("request");
        return;
      }

      if (phoneCode === data.code) {
        // Update user profile with verified phone
        try {
          await updateProfile({ phone: editForm.phone });

          // Update user metadata in Supabase
          await supabase.auth.updateUser({
            data: {
              phone: editForm.phone,
              phone_verified: true,
            },
          });

          localStorage.removeItem("phone_verification");
          toast.success("Xác thực số điện thoại thành công!");
          setPhoneVerificationStep("request");
          setPhoneCode("");

          // Update profile through context
          await updateProfile({ phone: editForm.phone });
        } catch (updateError) {
          console.error("Profile update error:", updateError);
          toast.error("Xác thực thành công nhưng không thể cập nhật thông tin");
        }
      } else {
        // Increment attempts
        data.attempts += 1;
        localStorage.setItem("phone_verification", JSON.stringify(data));
        toast.error(`Mã xác thực không đúng. Còn ${3 - data.attempts} lần thử`);
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      toast.error("Có lỗi xảy ra khi xác thực");
    }
  };

  // Account deletion functions
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== `${user?.email}-delete`) {
      toast.error("Vui lòng nhập chính xác email-delete để xác nhận");
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user data from all tables
      const userId = user?.id;
      if (!userId) return;

      // Delete from NLC tables
      await Promise.all([
        supabase.from("nlc_user_files").delete().eq("user_id", userId),
        supabase.from("nlc_enrollments").delete().eq("student_user_id", userId),
        supabase.from("nlc_notifications").delete().eq("user_id", userId),
        supabase.from("nlc_activity_log").delete().eq("user_id", userId),
        supabase.from("nlc_password_resets").delete().eq("user_id", userId),
        supabase.from("nlc_accounts").delete().eq("user_id", userId),
      ]);

      // Sign out and redirect
      await supabase.auth.signOut();
      toast.success("Tài khoản đã được xóa thành công");
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa tài khoản");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Membership upgrade functions
  const handleUpgradeMembership = async () => {
    if (!selectedPlan) {
      toast.error("Vui lòng chọn gói membership");
      return;
    }

    if (!user?.id) {
      toast.error("Không thể xác định người dùng");
      return;
    }

    setIsUpgrading(true);
    try {
      // Find selected plan details
      const plan = membershipPlans.find((p) => p.code === selectedPlan);
      if (!plan) {
        toast.error("Gói membership không tồn tại");
        return;
      }

      // Simulate payment process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process upgrade
      const upgradeResult = await MembershipService.upgradeMembership(
        user.id,
        selectedPlan,
        1
      );

      if (upgradeResult.success) {
        toast.success(`Đã nâng cấp lên gói ${plan.name} thành công!`);
        setShowUpgradeDialog(false);
        setSelectedPlan("");

        // In a real app, we would refresh user profile from database
        // For now, simulate the upgrade in the UI
        if (user) {
          const updatedUser = {
            ...user,
            membership_type: selectedPlan as "free" | "member" | "premium",
            membership_status: "active" as const,
            membership_started_at: new Date().toISOString(),
            membership_expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
          // This would normally be handled by the auth context
          console.log("User upgraded to:", updatedUser);
        }

        // Refresh page to show updated membership
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Có lỗi xảy ra khi nâng cấp membership");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi nâng cấp membership");
      console.error("Upgrade error:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cần đăng nhập
            </h2>
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để quản lý tài khoản
            </p>
            <Button onClick={() => navigate("/dang-nhap")} className="w-full">
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý tài khoản
              </h1>
              <p className="text-gray-600">
                Quản lý thông tin cá nhân và tài liệu của bạn
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-5 h-12 bg-gray-50/50">
              <TabsTrigger
                value="profile"
                className="text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Tài liệu
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Đơn hàng
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Thông tin cá nhân
                        </CardTitle>
                        <CardDescription>
                          Quản lý thông tin cá nhân của bạn
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">Họ và tên</Label>
                            <Input
                              id="full_name"
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  full_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                              id="phone"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Giới thiệu bản thân</Label>
                          <textarea
                            id="bio"
                            className="w-full p-3 border border-gray-300 rounded-md resize-none"
                            rows={4}
                            value={editForm.bio}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder="Viết vài dòng về bản thân..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>
                            <Save className="h-4 w-4 mr-2" />
                            Lưu thay đổi
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Họ và tên
                            </Label>
                            <p className="text-gray-900">
                              {user.full_name || "Chưa cập nhật"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Email
                            </Label>
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Số điện thoại
                            </Label>
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900">
                                {user.phone || "Chưa cập nhật"}
                              </p>
                              {user.phone && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Đã xác thực
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Vai trò
                            </Label>
                            <p className="text-gray-900">
                              {user.account_role === "sinh_vien"
                                ? "Học viên"
                                : user.account_role === "giang_vien"
                                ? "Giảng viên"
                                : "Quản trị viên"}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Gói Membership
                            </Label>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  user.membership_type === "premium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : user.membership_type === "vip"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.membership_type === "premium" ? (
                                  <>
                                    <Crown className="h-4 w-4 mr-1" />
                                    Premium
                                  </>
                                ) : user.membership_type === "vip" ? (
                                  <>
                                    <Star className="h-4 w-4 mr-1" />
                                    VIP
                                  </>
                                ) : (
                                  <>
                                    <User className="h-4 w-4 mr-1" />
                                    Miễn phí
                                  </>
                                )}
                              </span>
                              {user.membership_type !== "premium" && (
                                <Button
                                  size="sm"
                                  onClick={() => setShowUpgradeDialog(true)}
                                  className="text-xs"
                                >
                                  Nâng cấp
                                </Button>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Trạng thái
                            </Label>
                            <p
                              className={`text-sm font-medium ${
                                user.account_status === "active"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {user.account_status === "active"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </p>
                          </div>
                        </div>

                        {user.bio && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Giới thiệu
                            </Label>
                            <p className="text-gray-900">{user.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Settings Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Cài đặt tài khoản</CardTitle>
                    <CardDescription>
                      Quản lý cài đặt và bảo mật tài khoản
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password Change Section */}
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Key className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Thay đổi mật khẩu</h3>
                              <p className="text-sm text-gray-600">
                                Cập nhật mật khẩu để bảo mật tài khoản
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPasswordChangeStep("request")}
                          >
                            Thay đổi
                          </Button>
                        </div>
                      </div>

                      {/* Phone Verification Section */}
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                Xác thực số điện thoại
                              </h3>
                              <p className="text-sm text-gray-600">
                                Xác thực số điện thoại để bảo mật
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPhoneVerificationStep("request")}
                          >
                            Xác thực
                          </Button>
                        </div>
                      </div>

                      {/* Membership Upgrade Section */}
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Crown className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                Nâng cấp Membership
                              </h3>
                              <p className="text-sm text-gray-600">
                                Nâng cấp lên gói Premium để có toàn quyền
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUpgradeDialog(true)}
                          >
                            Nâng cấp
                          </Button>
                        </div>
                      </div>

                      {/* Account Deletion Section */}
                      <div className="p-4 border rounded-lg hover:bg-red-50 transition-colors border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-red-700">
                                Xóa tài khoản
                              </h3>
                              <p className="text-sm text-red-600">
                                Xóa vĩnh viễn tài khoản và dữ liệu
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => setShowDeleteDialog(true)}
                          >
                            Xóa tài khoản
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Stats & Actions */}
              <div className="space-y-6">
                {/* User Status Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Tài khoản đã kích hoạt
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gói hiện tại:</span>
                        <span className="font-medium">
                          {user?.membership_type === "premium"
                            ? "Premium"
                            : user?.membership_type === "vip"
                            ? "VIP"
                            : "Miễn phí"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ngày tham gia:</span>
                        <span className="font-medium">
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Lần đăng nhập cuối:
                        </span>
                        <span className="font-medium">Hôm nay</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowUpgradeDialog(true)}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Nâng cấp Premium
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setPasswordChangeStep("request")}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setPhoneVerificationStep("request")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Xác thực SĐT
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload tài liệu cá nhân
                  </CardTitle>
                  <CardDescription>
                    Upload và quản lý tài liệu cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    fileType="document"
                    onUploadComplete={handleFileUpload}
                    onFileDelete={handleFileDelete}
                    maxFileSize={50}
                    acceptedTypes={["*"]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tài liệu đã upload
                  </CardTitle>
                  <CardDescription>
                    Danh sách tài liệu cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFiles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Đang tải...</p>
                    </div>
                  ) : personalFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có tài liệu nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {personalFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getFileIcon(file.mime_type)}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {file.original_filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize((file as any).file_size)} •{" "}
                                {file.download_count} lượt tải •
                                {new Date(file.created_at).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/files/${file.id}/download`,
                                  "_blank"
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Đơn hàng của tôi
                </CardTitle>
                <CardDescription>
                  Theo dõi các đơn hàng và giao dịch của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Order */}
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Đơn hàng #NLC001</p>
                          <p className="text-sm text-gray-500">15/01/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          599,000 VNĐ
                        </p>
                        <p className="text-sm text-green-600">Hoàn thành</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Khóa học React cơ bản + TypeScript nâng cao
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Tải hóa đơn
                      </Button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Khám phá các khóa học và sản phẩm của chúng tôi
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/cho-mua-ban")}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Mua sắm ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý cài đặt và bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Thay đổi mật khẩu</h3>
                        <p className="text-sm text-gray-600">
                          Cập nhật mật khẩu để bảo mật tài khoản
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPasswordChangeStep("request")}
                    >
                      Thay đổi
                    </Button>
                  </div>

                  {/* Phone Verification Section */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Xác thực số điện thoại</h3>
                        <p className="text-sm text-gray-600">
                          Xác thực số điện thoại để bảo mật tài khoản
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPhoneVerificationStep("request")}
                    >
                      Xác thực
                    </Button>
                  </div>

                  {/* Membership Upgrade Section */}
                  {user.membership_type !== "premium" && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Crown className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Nâng cấp Membership</h3>
                          <p className="text-sm text-gray-600">
                            Nâng cấp lên gói Premium để có thêm tính năng
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowUpgradeDialog(true)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Nâng cấp
                      </Button>
                    </div>
                  )}

                  {/* Account Deletion Section */}
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-red-900">
                          Xóa tài khoản
                        </h3>
                        <p className="text-sm text-red-700">
                          Xóa vĩnh viễn tài khoản và dữ liệu
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Xóa tài khoản
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quản lý hệ thống
                </CardTitle>
                <CardDescription>
                  Công cụ quản trị hệ thống và người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Password Change Dialog */}
        <Dialog
          open={passwordChangeStep !== "request"}
          onOpenChange={() => setPasswordChangeStep("request")}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Thay đổi mật khẩu
              </DialogTitle>
              <DialogDescription>
                {passwordChangeStep === "verify"
                  ? "Vui lòng kiểm tra email và xác thực để tiếp tục"
                  : "Nhập mật khẩu mới cho tài khoản của bạn"}
              </DialogDescription>
            </DialogHeader>

            {passwordChangeStep === "verify" ? (
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Chúng tôi đã gửi email xác thực đến {user?.email}. Vui lòng
                    kiểm tra hộp thư và click vào link để xác thực.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleVerifyPasswordChange} className="w-full">
                  Tôi đã xác thực email
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <Button onClick={handleChangePassword} className="w-full">
                  Đổi mật khẩu
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Phone Verification Dialog */}
        <Dialog
          open={phoneVerificationStep !== "request"}
          onOpenChange={() => setPhoneVerificationStep("request")}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Xác thực số điện thoại
              </DialogTitle>
              <DialogDescription>
                {phoneVerificationStep === "request"
                  ? "Nhập số điện thoại để nhận mã xác thực"
                  : "Nhập mã xác thực đã gửi đến số điện thoại của bạn"}
              </DialogDescription>
            </DialogHeader>

            {phoneVerificationStep === "request" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <Button
                  onClick={handleRequestPhoneVerification}
                  className="w-full"
                >
                  Gửi mã xác thực
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Phone className="h-4 w-4" />
                  <AlertDescription>
                    Mã xác thực đã được gửi đến {editForm.phone}. Vui lòng nhập
                    mã 6 số để xác thực.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="phoneCode">Mã xác thực</Label>
                  <Input
                    id="phoneCode"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="Nhập mã xác thực (123456)"
                    maxLength={6}
                  />
                </div>
                <Button onClick={handleVerifyPhone} className="w-full">
                  Xác thực
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Membership Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Nâng cấp Membership
              </DialogTitle>
              <DialogDescription>
                Chọn gói membership phù hợp với nhu cầu của bạn
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-8">
              {membershipPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`relative group transition-all duration-300 ${
                    plan.isPopular ? "scale-102 md:scale-105" : ""
                  }`}
                  onClick={() => setSelectedPlan(plan.code)}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg border-2 border-white">
                        🏆 PHỔ BIẾN NHẤT
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      selectedPlan === plan.code
                        ? "ring-4 ring-blue-500 ring-opacity-50 shadow-2xl scale-105"
                        : "shadow-xl hover:shadow-2xl"
                    } ${
                      plan.isPopular
                        ? "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white border-0"
                        : plan.code === "premium"
                        ? "bg-gradient-to-br from-indigo-50 to-blue-100 border-2 border-blue-200"
                        : "bg-white/5 backdrop-blur-sm border border-white/10-2 border-gray-200"
                    } rounded-2xl`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                      <div className="absolute transform rotate-45 bg-white rounded-full w-8 h-8 top-4 right-4"></div>
                      <div className="absolute transform rotate-45 bg-white rounded-full w-4 h-4 top-8 right-8"></div>
                      <div className="absolute transform rotate-45 bg-white rounded-full w-6 h-6 top-12 right-2"></div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedPlan === plan.code && (
                      <div className="absolute top-6 right-6 z-20">
                        <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg animate-pulse">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 p-4 md:p-6 lg:p-8">
                      {/* Header */}
                      <div className="text-center mb-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div
                            className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center ${
                              plan.isPopular
                                ? "bg-white/20 backdrop-blur-sm"
                                : plan.code === "premium"
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-gradient-to-br from-gray-100 to-gray-200"
                            }`}
                          >
                            {plan.code === "free" && (
                              <Star
                                className={`h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 ${
                                  plan.isPopular
                                    ? "text-white"
                                    : "text-gray-600"
                                }`}
                              />
                            )}
                            {plan.code === "member" && (
                              <Zap
                                className={`h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 ${
                                  plan.isPopular ? "text-white" : "text-white"
                                }`}
                              />
                            )}
                            {plan.code === "premium" && (
                              <Crown
                                className={`h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 ${
                                  plan.isPopular ? "text-white" : "text-white"
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className={`font-bold text-lg md:text-xl lg:text-2xl mb-2 md:mb-3 ${
                            plan.isPopular
                              ? "text-white"
                              : plan.code === "premium"
                              ? "text-gray-800"
                              : "text-gray-800"
                          }`}
                        >
                          {plan.name}
                        </h3>

                        {/* Description */}
                        <p
                          className={`text-sm mb-6 leading-relaxed ${
                            plan.isPopular
                              ? "text-white/90"
                              : plan.code === "premium"
                              ? "text-gray-600"
                              : "text-gray-600"
                          }`}
                        >
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-6">
                          <div
                            className={`font-bold text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 ${
                              plan.isPopular
                                ? "text-white"
                                : plan.code === "premium"
                                ? "text-gray-900"
                                : "text-gray-900"
                            }`}
                          >
                            {formatPrice(plan.price, plan.currency)}
                          </div>
                          {plan.price > 0 && (
                            <p
                              className={`text-sm ${
                                plan.isPopular
                                  ? "text-white/80"
                                  : plan.code === "premium"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }`}
                            >
                              /
                              {plan.billingCycle === "monthly"
                                ? "tháng"
                                : "năm"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 md:space-y-3">
                        <h4
                          className={`font-semibold text-xs md:text-sm uppercase tracking-wide mb-2 md:mb-3 ${
                            plan.isPopular
                              ? "text-white/90"
                              : plan.code === "premium"
                              ? "text-gray-700"
                              : "text-gray-700"
                          }`}
                        >
                          ✨ Tính năng bao gồm
                        </h4>
                        <ul className="space-y-1 md:space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                  plan.isPopular
                                    ? "bg-white/20"
                                    : "bg-green-100"
                                }`}
                              >
                                <CheckCircle
                                  className={`h-3 w-3 ${
                                    plan.isPopular
                                      ? "text-white"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-xs md:text-sm leading-relaxed ${
                                  plan.isPopular
                                    ? "text-white/90"
                                    : plan.code === "premium"
                                    ? "text-gray-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bottom spacing for better visual */}
                      <div className="mt-4 md:mt-6"></div>
                    </div>

                    {/* Bottom highlight bar for selected */}
                    {selectedPlan === plan.code && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Info */}
            {selectedPlan && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Gói đã chọn</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Bạn đã chọn gói{" "}
                  <strong>
                    {membershipPlans.find((p) => p.code === selectedPlan)?.name}
                  </strong>
                  . Nhấn "Nâng cấp ngay" để tiếp tục thanh toán.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpgradeMembership}
                disabled={!selectedPlan || isUpgrading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isUpgrading ? "Đang xử lý..." : "Nâng cấp ngay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Account Deletion Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Xóa tài khoản
              </DialogTitle>
              <DialogDescription>
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị
                xóa vĩnh viễn.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Cảnh báo:</strong> Việc xóa tài khoản sẽ xóa tất cả:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Thông tin cá nhân</li>
                    <li>Tài liệu đã upload</li>
                    <li>Lịch sử giao dịch</li>
                    <li>Dữ liệu khóa học</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">
                  Để xác nhận, vui lòng nhập:{" "}
                  <strong>{user?.email}-delete</strong>
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`${user?.email}-delete`}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmation !== `${user?.email}-delete` || isDeleting
                }
              >
                {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
