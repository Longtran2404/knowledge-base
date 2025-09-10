import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEmailAuth } from "../contexts/EmailAuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmailToken, loading } = useEmailAuth();

  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error" | "idle"
  >("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  const handleVerification = useCallback(async () => {
    if (!token) return;

    setVerificationStatus("verifying");
    setError("");
    setMessage("");

    try {
      const result = await verifyEmailToken(token);

      if (result.success) {
        setVerificationStatus("success");
        setMessage(result.message || "Email đã được xác thực thành công!");

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setError(result.error || "Có lỗi xảy ra khi xác thực email");
      }
    } catch (error: any) {
      setVerificationStatus("error");
      setError(error.message || "Có lỗi xảy ra khi xác thực email");
    }
  }, [token, verifyEmailToken, navigate]);

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerificationStatus("error");
      setError("Token xác thực không hợp lệ");
    }
  }, [token, handleVerification]);

  const handleResendVerification = () => {
    navigate("/resend-verification");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang xác thực email...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực thành công!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={handleGoHome} className="w-full">
                Về trang chủ
              </Button>
              <p className="text-sm text-gray-500">
                Bạn sẽ được chuyển hướng tự động sau 3 giây...
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực thất bại
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Gửi lại email xác thực
              </Button>
              <Button onClick={handleGoHome} variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Xác thực Email
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
