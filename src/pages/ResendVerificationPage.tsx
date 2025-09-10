import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailAuth } from "../contexts/EmailAuthContext";
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
  Mail,
  ArrowLeft,
  Send,
} from "lucide-react";

export default function ResendVerificationPage() {
  const navigate = useNavigate();
  const { resendVerification, loading } = useEmailAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Địa chỉ email không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await resendVerification(email);

      if (result.success) {
        setStatus("success");
        setMessage(
          result.message || "Email xác thực đã được gửi lại thành công!"
        );
      } else {
        setStatus("error");
        setError(result.error || "Có lỗi xảy ra khi gửi lại email xác thực");
      }
    } catch (error: any) {
      setStatus("error");
      setError(error.message || "Có lỗi xảy ra khi gửi lại email xác thực");
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

  const handleResendAgain = () => {
    setStatus("idle");
    setMessage("");
    setError("");
    setEmail("");
  };

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gửi email thành công!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendAgain}
                variant="outline"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi lại email khác
              </Button>
              <Button onClick={handleGoToLogin} className="w-full">
                Đăng nhập
              </Button>
              <Button onClick={handleGoHome} variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gửi email thất bại
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendAgain}
                variant="outline"
                className="w-full"
              >
                Thử lại
              </Button>
              <Button
                onClick={handleGoToLogin}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gửi lại email xác thực
              </h2>
              <p className="text-gray-600">
                Nhập địa chỉ email để gửi lại email xác thực
              </p>
            </div>

            <div>
              <Label htmlFor="email">Địa chỉ email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                required
              />
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
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi email xác thực
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleGoToLogin}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </Button>
              <div className="text-xs text-gray-500">
                Không nhận được email? Kiểm tra thư mục spam hoặc liên hệ hỗ trợ
              </div>
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
              Gửi lại email xác thực
            </CardTitle>
            <CardDescription>Nam Long Center</CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ? Liên hệ{" "}
            <a
              href="mailto:info@namlongcenter.com"
              className="text-blue-600 hover:underline"
            >
              info@namlongcenter.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
