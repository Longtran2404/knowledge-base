import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Key,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase-config";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyToken = useCallback(async () => {
    try {
      // Check if token exists and is valid in nlc_password_resets table
      const { data, error } = await (supabase as any)
        .from('nlc_password_resets')
        .select('*')
        .eq('reset_token', token)
        .eq('is_used', false)
        .single();

      if (error || !data) {
        toast.error("Token không hợp lệ hoặc đã hết hạn");
        navigate('/tai-khoan');
        return;
      }

      // Check if token is expired (valid for 1 hour)
      if (new Date(data.expires_at) < new Date()) {
        toast.error("Token đã hết hạn");
        navigate('/tai-khoan');
        return;
      }

      setIsValidToken(true);
      setIsVerified(true);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xác thực token");
      navigate("/tai-khoan");
    }
  }, [token, navigate]);

  useEffect(() => {
    // Verify token when component mounts
    if (token) {
      verifyToken();
    } else {
      toast.error("Token không hợp lệ");
      navigate("/tai-khoan");
    }
  }, [token, navigate, verifyToken]);

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) {
        toast.error("Không thể đổi mật khẩu");
        return;
      }

      // Mark token as used
      await (supabase as any)
        .from('nlc_password_resets')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('reset_token', token);

      // Update password_changed_at in nlc_accounts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any)
          .from('nlc_accounts')
          .update({ password_changed_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      toast.success("Đổi mật khẩu thành công");
      navigate("/tai-khoan");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Token không hợp lệ
            </h2>
            <p className="text-gray-600 mb-4">
              Token xác thực không hợp lệ hoặc đã hết hạn
            </p>
            <Button onClick={() => navigate("/tai-khoan")} className="w-full">
              Quay lại tài khoản
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/tai-khoan")}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đổi mật khẩu</h1>
              <p className="text-gray-600">
                Tạo mật khẩu mới cho tài khoản của bạn
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Xác thực thành công
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Đang xác thực...
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isVerified
                ? "Bạn có thể tạo mật khẩu mới cho tài khoản"
                : "Đang xác thực token..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVerified ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email đã được xác thực thành công. Bạn có thể tạo mật khẩu
                    mới.
                  </AlertDescription>
                </Alert>

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

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Yêu cầu mật khẩu:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li
                        className={`flex items-center gap-2 ${
                          passwordForm.newPassword.length >= 6
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Ít nhất 6 ký tự
                      </li>
                      <li
                        className={`flex items-center gap-2 ${
                          passwordForm.newPassword ===
                            passwordForm.confirmPassword &&
                          passwordForm.confirmPassword
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Mật khẩu xác nhận khớp
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      isLoading ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Đổi mật khẩu
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang xác thực token...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
