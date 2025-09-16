import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Github,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "../../lib/stores/app-store";
import {
  validateData,
  LoginSchema,
  RegisterSchema,
  getValidationErrors,
} from "../../lib/schemas/validation";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Checkbox } from "../../components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface AuthModalProps {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}

export function AuthModal({ children, defaultTab = "login" }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    company: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const { setUser } = useAppStore();

  // Animation effects
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateForm = (data: Record<string, unknown>, schema: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validation = validateData(schema as any, data);
    if (!validation.success) {
      setErrors(getValidationErrors(validation.errors!));
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(loginForm, LoginSchema)) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      const mockUser = {
        id: "1",
        name: "Nguyễn Văn A",
        email: loginForm.email,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        role: "student" as const,
      };

      setUser(mockUser);
      toast.success(`Chào mừng trở lại, ${mockUser.name}!`);
      setIsOpen(false);

      // Reset form
      setLoginForm({ email: "", password: "", rememberMe: false });
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(registerForm, RegisterSchema)) return;

    if (!registerForm.agreeToTerms) {
      setErrors({ agreeToTerms: "Bạn phải đồng ý với điều khoản sử dụng" });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful registration
      const mockUser = {
        id: "2",
        name: registerForm.name,
        email: registerForm.email,
        avatar: `https://images.unsplash.com/photo-1494790108755-2616b332c3ec?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
        role: "student" as const,
      };

      setUser(mockUser);
      toast.success(
        `Đăng ký thành công! Chào mừng ${mockUser.name} đến với Nam Long Center!`
      );
      setIsOpen(false);

      // Reset form
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        role: "student",
        company: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      });
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    toast.info(
      `Đang chuyển hướng đến ${provider === "google" ? "Google" : "GitHub"}...`
    );

    // Simulate social login
    setTimeout(() => {
      const mockUser = {
        id: "3",
        name: `User from ${provider}`,
        email: `user@${provider}.com`,
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        role: "student" as const,
      };

      setUser(mockUser);
      toast.success(`Đăng nhập thành công với ${provider}!`);
      setIsOpen(false);
      setIsLoading(false);
    }, 1500);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-6xl w-full h-[90vh] p-0 overflow-hidden relative">
        <BackgroundAnimation />
        <div className="flex h-full">
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
                  <div className="w-12 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Bảo mật cao</h3>
                    <p className="text-white/80">Dữ liệu được mã hóa an toàn</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Học nhanh</h3>
                    <p className="text-white/80">Khóa học được tối ưu hóa</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
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
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center space-y-6 pb-8">
                {/* Mobile Logo */}
                <div className="lg:hidden">
                  <motion.div
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mb-6"
                    animate={
                      isAnimating
                        ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.span
                      className="text-white font-bold text-2xl"
                      animate={
                        isAnimating
                          ? {
                              scale: [1, 1.2, 1],
                            }
                          : {}
                      }
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
                  <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {activeTab === "login"
                      ? "Chào mừng trở lại!"
                      : "Bắt đầu hành trình"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-lg">
                    {activeTab === "login"
                      ? "Đăng nhập để tiếp tục học tập"
                      : "Tạo tài khoản miễn phí để khám phá"}
                  </DialogDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-8">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "login" | "register")
                  }
                >
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1.5 rounded-2xl">
                      <TabsTrigger
                        value="login"
                        className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-300 rounded-2xl"
                      >
                        <motion.div
                          className="flex items-center space-x-2 py-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <User className="h-5 w-5" />
                          <span>Đăng nhập</span>
                        </motion.div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 transition-all duration-300 rounded-2xl"
                      >
                        <motion.div
                          className="flex items-center space-x-2 py-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Sparkles className="h-5 w-5" />
                          <span>Đăng ký</span>
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
                          className="text-sm font-semibold text-gray-900"
                        >
                          Email
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className={`pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                              errors.email
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                            }`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Label
                          htmlFor="login-password"
                          className="text-sm font-semibold text-gray-900"
                        >
                          Mật khẩu
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            className={`pl-12 pr-14 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                              errors.password
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                            }`}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-gray-100 rounded-lg"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={loginForm.rememberMe}
                            onCheckedChange={(checked) =>
                              setLoginForm((prev) => ({
                                ...prev,
                                rememberMe: !!checked,
                              }))
                            }
                          />
                          <Label
                            htmlFor="remember"
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            Ghi nhớ đăng nhập
                          </Label>
                        </div>

                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm text-blue-600"
                        >
                          Quên mật khẩu?
                        </Button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              className="flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                              <span>Đang đăng nhập...</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center justify-center"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>Đăng nhập</span>
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
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
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="register-name"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Họ và tên *
                          </Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                              id="register-name"
                              type="text"
                              placeholder="Nguyễn Văn A"
                              value={registerForm.name}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className={`pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                errors.name
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                              }`}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="register-phone"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Số điện thoại
                          </Label>
                          <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                              id="register-phone"
                              type="tel"
                              placeholder="0123 456 789"
                              value={registerForm.phone}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className={`pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                errors.phone
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                              }`}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Label
                          htmlFor="register-email"
                          className="text-sm font-semibold text-gray-900"
                        >
                          Email *
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className={`pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                              errors.email
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:bg-white hover:border-gray-400"
                            }`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="register-role"
                            className="text-sm font-medium"
                          >
                            Vai trò *
                          </Label>
                          <Select
                            value={registerForm.role}
                            onValueChange={(value) =>
                              setRegisterForm((prev) => ({
                                ...prev,
                                role: value,
                              }))
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger
                              className={`${
                                errors.role ? "border-red-500" : ""
                              }`}
                            >
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  Học viên
                                </div>
                              </SelectItem>
                              <SelectItem value="business">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  Doanh nghiệp
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.role && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.role}
                            </p>
                          )}
                        </div>

                        {registerForm.role === "business" && (
                          <div className="space-y-2">
                            <Label
                              htmlFor="register-company"
                              className="text-sm font-medium"
                            >
                              Tên công ty
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="register-company"
                                type="text"
                                placeholder="Tên công ty của bạn"
                                value={registerForm.company}
                                onChange={(e) =>
                                  setRegisterForm((prev) => ({
                                    ...prev,
                                    company: e.target.value,
                                  }))
                                }
                                className={`pl-12 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-500 ${
                                  errors.company
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-300"
                                }`}
                                disabled={isLoading}
                              />
                            </div>
                            {errors.company && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.company}
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="register-password"
                            className="text-sm font-medium"
                          >
                            Mật khẩu *
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={registerForm.password}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className={`pl-12 pr-14 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-500 ${
                                errors.password
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-300"
                              }`}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="confirm-password"
                            className="text-sm font-medium"
                          >
                            Xác nhận mật khẩu *
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={registerForm.confirmPassword}
                              onChange={(e) =>
                                setRegisterForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className={`pl-12 pr-14 h-14 border-2 rounded-2xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-500 ${
                                errors.confirmPassword
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-300"
                              }`}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="terms"
                            checked={registerForm.agreeToTerms}
                            onCheckedChange={(checked) =>
                              setRegisterForm((prev) => ({
                                ...prev,
                                agreeToTerms: !!checked,
                              }))
                            }
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor="terms"
                              className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                            >
                              Tôi đồng ý với{" "}
                              <Button
                                variant="link"
                                className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                              >
                                Điều khoản sử dụng
                              </Button>{" "}
                              và{" "}
                              <Button
                                variant="link"
                                className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                              >
                                Chính sách bảo mật
                              </Button>{" "}
                              của Nam Long Center
                            </Label>
                            <p className="text-xs text-gray-500">
                              Bằng cách đăng ký, bạn đồng ý nhận thông tin về
                              khóa học và cập nhật từ chúng tôi.
                            </p>
                          </div>
                        </div>
                        {errors.agreeToTerms && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.agreeToTerms}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                      >
                        {/* Password Strength Indicator */}
                        {registerForm.password && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Độ mạnh mật khẩu:
                              </span>
                              <span
                                className={`font-medium ${
                                  registerForm.password.length < 6
                                    ? "text-red-500"
                                    : registerForm.password.length < 8
                                    ? "text-yellow-500"
                                    : "text-green-500"
                                }`}
                              >
                                {registerForm.password.length < 6
                                  ? "Yếu"
                                  : registerForm.password.length < 8
                                  ? "Trung bình"
                                  : "Mạnh"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  registerForm.password.length < 6
                                    ? "bg-red-500 w-1/3"
                                    : registerForm.password.length < 8
                                    ? "bg-yellow-500 w-2/3"
                                    : "bg-green-500 w-full"
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                            disabled={isLoading || !registerForm.agreeToTerms}
                          >
                            {isLoading ? (
                              <motion.div
                                className="flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                                <span>Đang tạo tài khoản...</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                className="flex items-center justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                <span>Tạo tài khoản miễn phí</span>
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <div className="px-8 pb-8">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-500 font-medium">
                        Hoặc đăng nhập với
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                      className="h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 rounded-2xl font-semibold"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("github")}
                      disabled={isLoading}
                      className="h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 rounded-2xl font-semibold"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Đã có tài khoản?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                        onClick={() => setActiveTab("login")}
                      >
                        Đăng nhập ngay
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
