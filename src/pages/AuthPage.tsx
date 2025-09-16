import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Loading, ButtonLoading } from "../components/ui/loading";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  XCircle,
  Shield,
  Star,
  Zap,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { motion } from "framer-motion";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading } = useAuth();

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
      const { user, error } = await signIn(loginForm.email, loginForm.password);
      if (user) {
        toast.success("Đăng nhập thành công!");
        navigate(from, { replace: true });
      } else {
        toast.error(error || "Đăng nhập thất bại");
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
      const { user, error } = await signUp(
        registerForm.email,
        registerForm.password,
        registerForm.fullName,
        registerForm.role
      );

      if (user) {
        toast.success("Đăng ký thành công!");
        navigate(from, { replace: true });
      } else {
        toast.error(error || "Đăng ký thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
    }
  };

  // Background Animation Component
  const BackgroundAnimation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-blue-400/30 rounded-full"
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-green-400/40 to-teal-400/40 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-xl"
        animate={{
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 360],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <BackgroundAnimation />

      {/* Back button */}
      <motion.div
        className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="hover:bg-white/50 backdrop-blur-sm text-sm lg:text-base"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Trang chủ</span>
          <span className="sm:hidden">Về</span>
        </Button>
      </motion.div>

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
                <span className="text-4xl font-bold">NL</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Nam Long Center</h1>
              <p className="text-xl text-white/90 mb-8">
                Xây dựng tương lai với công nghệ BIM
              </p>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bảo mật cao</h3>
                  <p className="text-white/80">Dữ liệu được mã hóa an toàn</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Học nhanh</h3>
                  <p className="text-white/80">Khóa học được tối ưu hóa</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Miễn phí</h3>
                  <p className="text-white/80">Bắt đầu ngay hôm nay</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-6 lg:p-12 min-h-screen lg:min-h-0">
          <motion.div
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-2xl bg-white/98 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6">
                {/* Mobile Logo */}
                <div className="lg:hidden">
                  <motion.div
                    className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.span
                      className="text-white font-bold text-lg sm:text-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      NL
                    </motion.span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                    Chào mừng trở lại!
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base sm:text-lg">
                    Đăng nhập để tiếp tục học tập
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
                <Tabs defaultValue="login" className="w-full">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl">
                      <TabsTrigger
                        value="login"
                        className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      >
                        <motion.div
                          className="flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden xs:inline">Đăng nhập</span>
                          <span className="xs:hidden">Nhập</span>
                        </motion.div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      >
                        <motion.div
                          className="flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden xs:inline">Đăng ký</span>
                          <span className="xs:hidden">Ký</span>
                        </motion.div>
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-6 mt-8">
                    <motion.form
                      onSubmit={handleLogin}
                      className="space-y-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <Label
                          htmlFor="login-email"
                          className="text-sm font-semibold text-foreground"
                        >
                          Email
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Label
                          htmlFor="login-password"
                          className="text-sm font-semibold text-foreground"
                        >
                          Mật khẩu
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                            className="pl-12 pr-14 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-accent rounded-lg"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg relative overflow-hidden"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loading variant="spinner" size="sm" className="text-white" />
                              <span>Đang đăng nhập...</span>
                            </div>
                          ) : (
                            "Đăng nhập"
                          )}
                        </Button>
                      </motion.div>

                      <div className="text-center space-y-2">
                        <Link
                          to="/resend-verification"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          Gửi lại email xác thực
                        </Link>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          Quên mật khẩu?
                        </Link>
                      </div>
                    </motion.form>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-6 mt-8">
                    <motion.form
                      onSubmit={handleRegister}
                      className="space-y-6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-name"
                          className="text-sm font-semibold text-foreground"
                        >
                          Họ và tên
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                            className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="register-role"
                          className="text-sm font-semibold text-foreground"
                        >
                          Vai trò
                        </Label>
                        <Select
                          value={registerForm.role}
                          onValueChange={(value) =>
                            setRegisterForm({
                              ...registerForm,
                              role: value as "student" | "instructor" | "admin",
                            })
                          }
                        >
                          <SelectTrigger
                            id="register-role"
                            className="w-full h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground border-border hover:bg-accent"
                          >
                            <SelectValue
                              placeholder="Chọn vai trò"
                              className="text-foreground"
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg rounded-xl">
                            <SelectItem
                              value="student"
                              className="hover:bg-accent cursor-pointer text-foreground"
                            >
                              Học viên
                            </SelectItem>
                            <SelectItem
                              value="instructor"
                              className="hover:bg-accent cursor-pointer text-foreground"
                            >
                              Giảng viên
                            </SelectItem>
                            <SelectItem
                              value="admin"
                              className="hover:bg-accent cursor-pointer text-foreground"
                            >
                              Quản trị viên
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="register-email"
                          className="text-sm font-semibold text-foreground"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                            className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="register-password"
                          className="text-sm font-semibold text-foreground"
                        >
                          Mật khẩu
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                            className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-lg"
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
                            <Progress
                              value={passwordStrength}
                              className="h-2"
                            />
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
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                            className="pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground border-border hover:bg-accent pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-lg"
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
                              registerForm.password ===
                              registerForm.confirmPassword
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

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg relative overflow-hidden"
                          disabled={
                            isLoading || !agreeTerms || passwordStrength < 40
                          }
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loading variant="dots" size="sm" className="text-white" />
                              <span>Đang đăng ký...</span>
                            </div>
                          ) : (
                            "Đăng ký tài khoản"
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
