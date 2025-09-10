import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailAuth } from "../contexts/EmailAuthContext";
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
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  XCircle,
  AlertTriangle,
  Key,
  Smartphone,
  Mail,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export default function SecurityPage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useEmailAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);

    const score = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength((score / 5) * 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordStrength < 40) {
      toast.error("Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Simulate password change API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Mật khẩu đã được thay đổi thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thay đổi mật khẩu");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cần đăng nhập
            </h2>
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để truy cập trang bảo mật
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bảo mật tài khoản
              </h1>
              <p className="text-gray-600">
                Quản lý bảo mật và bảo vệ tài khoản của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin tài khoản */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Thông tin tài khoản
              </CardTitle>
              <CardDescription>
                Thông tin cơ bản về tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Họ và tên
                </Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-gray-900">{user.full_name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{user.email}</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Đã xác thực</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Vai trò
                </Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {user.role === "student"
                        ? "H"
                        : user.role === "instructor"
                        ? "G"
                        : "A"}
                    </span>
                  </div>
                  <span className="text-gray-900">
                    {user.role === "student"
                      ? "Học viên"
                      : user.role === "instructor"
                      ? "Giảng viên"
                      : "Quản trị viên"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Ngày tạo tài khoản
                </Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thay đổi mật khẩu */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Thay đổi mật khẩu
              </CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      placeholder="Nhập mật khẩu mới"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength < 40
                              ? "text-red-600"
                              : passwordStrength < 70
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2" />
                      <div className="space-y-1 text-xs">
                        <div
                          className={`flex items-center gap-2 ${
                            passwordRequirements.length
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Ít nhất 8 ký tự</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            passwordRequirements.uppercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Chữ hoa (A-Z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            passwordRequirements.lowercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Chữ thường (a-z)</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            passwordRequirements.number
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Số (0-9)</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            passwordRequirements.special
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>Ký tự đặc biệt (!@#$...)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Xác nhận mật khẩu mới
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        newPassword === confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {newPassword === confirmPassword ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>
                        {newPassword === confirmPassword
                          ? "Mật khẩu khớp"
                          : "Mật khẩu không khớp"}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isChangingPassword || passwordStrength < 40}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang thay đổi...
                    </>
                  ) : (
                    "Thay đổi mật khẩu"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Các biện pháp bảo mật */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Biện pháp bảo mật
            </CardTitle>
            <CardDescription>
              Các tính năng bảo mật đang được áp dụng cho tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Bảo mật đã kích hoạt
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        Xác thực email
                      </p>
                      <p className="text-sm text-green-700">
                        Email đã được xác thực
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        Mật khẩu mạnh
                      </p>
                      <p className="text-sm text-green-700">
                        Mật khẩu đáp ứng yêu cầu bảo mật
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        Mã hóa dữ liệu
                      </p>
                      <p className="text-sm text-green-700">
                        Dữ liệu được mã hóa SSL/TLS
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Khuyến nghị bảo mật
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Xác thực 2 yếu tố
                      </p>
                      <p className="text-sm text-blue-700">
                        Sẽ có sớm - Tăng cường bảo mật
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Thay đổi mật khẩu định kỳ
                      </p>
                      <p className="text-sm text-blue-700">
                        Khuyến nghị 3-6 tháng/lần
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Cảnh báo đăng nhập
                      </p>
                      <p className="text-sm text-blue-700">
                        Sẽ có sớm - Thông báo qua email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mr-4"
          >
            Về trang chủ
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Cài đặt tài khoản
          </Button>
        </div>
      </div>
    </div>
  );
}
