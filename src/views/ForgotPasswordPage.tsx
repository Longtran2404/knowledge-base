import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { AlertDescription } from "../components/ui/alert";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading } from "../components/ui/loading";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isLoading, resetPassword: sendResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const result = await sendResetEmail(email.trim());
      if (result?.success) {
        setEmailSent(true);
        toast.success("Email đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư (và thư mục spam).");
      } else {
        const msg = result?.error ?? "Có lỗi xảy ra khi gửi email";
        if (/rate limit|too many/i.test(String(msg))) {
          toast.error("Gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.");
        } else {
          toast.error(msg);
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi email";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white rounded-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">NL</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Quên mật khẩu?
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {emailSent
                ? "Kiểm tra email để đặt lại mật khẩu"
                : "Nhập email để nhận liên kết đặt lại mật khẩu"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">
                    Chúng tôi đã gửi email chứa liên kết đặt lại mật khẩu đến <strong>{email}</strong>
                  </p>

                  <AlertDescription className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                    <strong>Lưu ý:</strong> Hãy kiểm tra cả thư mục spam nếu bạn không thấy email trong hộp thư chính.
                  </AlertDescription>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                  >
                    Gửi lại email
                  </Button>

                  <Button
                    onClick={() => navigate("/auth")}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 rounded-xl"
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loading variant="spinner" size="sm" />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    "Gửi email đặt lại"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/auth"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}