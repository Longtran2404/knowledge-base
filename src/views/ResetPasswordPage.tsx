import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword, isLoading } = useAuth();

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Token đặt lại mật khẩu không hợp lệ");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Validation
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await updatePassword(newPassword);

      if (result.success) {
        setStatus("success");
        setMessage("Mật khẩu đã được đặt lại thành công!");

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        setStatus("error");
        setError(result.error || "Có lỗi xảy ra khi đặt lại mật khẩu");
      }
    } catch (error: any) {
      setStatus("error");
      setError(error.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/auth");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={handleGoToLogin} className="w-full">
                Đăng nhập ngay
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu thất bại
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full"
              >
                Thử lại
              </Button>
              <Button onClick={handleGoHome} variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đặt lại mật khẩu
              </h2>
              <p className="text-gray-600">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleGoToLogin}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription>Knowledge Base</CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ? Liên hệ{" "}
            <a
              href="mailto:info@knowledgebase.com"
              className="text-blue-600 hover:underline"
            >
              info@knowledgebase.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
