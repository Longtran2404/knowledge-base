import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmailAuth } from "../contexts/EmailAuthContext";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading } = useEmailAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "instructor" | "admin",
  });
  useEffect(() => {
    const err = localStorage.getItem("nlc_auth_error");
    if (err) {
      toast.error(err);
      localStorage.removeItem("nlc_auth_error");
    }
  }, []);

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

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        toast.success("Đăng nhập thành công!");
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Đăng nhập thất bại");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !registerForm.fullName ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordStrength < 40) {
      toast.error("Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn");
      return;
    }

    // Consent required
    if (!agreeTerms) {
      toast.error("Bạn cần đồng ý Điều khoản & Chính sách.");
      return;
    }

    try {
      const result = await register(
        registerForm.email,
        registerForm.password,
        registerForm.fullName,
        registerForm.role
      );

      if (result.success) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
        );
        navigate("/verify-email");
      } else {
        toast.error(result.error || "Đăng ký thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Trang chủ
        </Button>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NL</span>
              </div>
              <div className="text-left">
                <CardTitle className="text-xl">Nam Long Center</CardTitle>
                <CardDescription>Xây dựng tương lai</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/resend-verification"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Gửi lại email xác thực
                    </Link>
                  </div>

                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={registerForm.fullName}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            fullName: e.target.value,
                          })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Vai trò</Label>
                    <Select
                      value={registerForm.role}
                      onValueChange={(value) =>
                        setRegisterForm({
                          ...registerForm,
                          role: value as "student" | "instructor" | "admin",
                        })
                      }
                    >
                      <SelectTrigger id="register-role" className="w-full">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Học viên</SelectItem>
                        <SelectItem value="instructor">Giảng viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          });
                          checkPasswordStrength(e.target.value);
                        }}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {registerForm.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Độ mạnh mật khẩu:
                          </span>
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
                    <Label htmlFor="register-confirm-password">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {registerForm.confirmPassword && (
                      <div
                        className={`flex items-center gap-2 text-xs ${
                          registerForm.password === registerForm.confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {registerForm.password ===
                        registerForm.confirmPassword ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>
                          {registerForm.password ===
                          registerForm.confirmPassword
                            ? "Mật khẩu khớp"
                            : "Mật khẩu không khớp"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="agree"
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      Tôi đã đọc và đồng ý với{" "}
                      <Link
                        to="/terms"
                        className="text-blue-600 hover:underline font-medium"
                        target="_blank"
                      >
                        Điều khoản sử dụng
                      </Link>{" "}
                      và{" "}
                      <Link
                        to="/privacy"
                        className="text-blue-600 hover:underline font-medium"
                        target="_blank"
                      >
                        Chính sách bảo mật
                      </Link>{" "}
                      của Nam Long Center
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading || !agreeTerms || passwordStrength < 40}
                  >
                    {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Bằng việc đăng ký, bạn đồng ý với{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      Điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link
                      to="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Chính sách bảo mật
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="text-center text-sm text-gray-600">
              Bạn cần hỗ trợ?{" "}
              <Link to="/contact" className="text-blue-600 hover:underline">
                Liên hệ với chúng tôi
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
