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
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isLoading } = useAuth();
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
      // Mock password reset functionality
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setEmailSent(true);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-2xl bg-white/98 backdrop-blur-md rounded-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <motion.span
                className="text-white font-bold text-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                NL
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Quên mật khẩu?
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                {emailSent
                  ? "Kiểm tra email để đặt lại mật khẩu"
                  : "Nhập email để nhận liên kết đặt lại mật khẩu"
                }
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8">
            {emailSent ? (
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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
              </motion.form>
            )}
          </CardContent>
        </Card>

        {/* Back button */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trang chủ
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}