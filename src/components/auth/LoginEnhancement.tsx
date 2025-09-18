import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { supabase } from "../../lib/supabase-config";

interface LoginStepStatus {
  step: number;
  title: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
}

export default function LoginEnhancement() {
  const { signIn, signUp, isLoading, error, isAuthenticated, userProfile } =
    useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [loginSteps, setLoginSteps] = useState<LoginStepStatus[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Check account existence when email changes
  useEffect(() => {
    const checkAccount = async () => {
      if (formData.email && formData.email.includes("@")) {
        setCheckingAccount(true);
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("id, email, full_name, role, is_active")
            .eq("email", formData.email)
            .single();

          if (data && !error) {
            setAccountExists(true);
            console.log("Account found:", data);
          } else {
            setAccountExists(false);
          }
        } catch (error) {
          setAccountExists(false);
        }
        setCheckingAccount(false);
      } else {
        setAccountExists(null);
      }
    };

    const debounceTimer = setTimeout(checkAccount, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  // Initialize login steps
  const initializeLoginSteps = useCallback(() => {
    const steps: LoginStepStatus[] = [
      { step: 1, title: "Kiểm tra thông tin đăng nhập", status: "pending" },
      { step: 2, title: "Xác thực tài khoản", status: "pending" },
      { step: 3, title: "Tải thông tin người dùng", status: "pending" },
      { step: 4, title: "Khởi tạo phiên làm việc", status: "pending" },
    ];
    setLoginSteps(steps);
    setCurrentStep(0);
  }, []);

  const updateLoginStep = useCallback(
    (
      stepIndex: number,
      status: LoginStepStatus["status"],
      message?: string
    ) => {
      setLoginSteps((prev) =>
        prev.map((step, index) =>
          index === stepIndex ? { ...step, status, message } : step
        )
      );
      if (status === "processing") {
        setCurrentStep(stepIndex);
      }
    },
    []
  );

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (mode === "register") {
      if (!formData.fullName.trim()) {
        errors.fullName = "Họ tên là bắt buộc";
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === "login") {
      // Initialize login process with steps
      initializeLoginSteps();

      // Step 1: Validate credentials
      updateLoginStep(0, "processing", "Đang kiểm tra thông tin...");

      try {
        // Step 2: Authenticate
        updateLoginStep(0, "success");
        updateLoginStep(1, "processing", "Đang xác thực...");

        const result = await signIn(formData.email, formData.password);

        if (result.success) {
          updateLoginStep(1, "success");
          updateLoginStep(2, "processing", "Đang tải thông tin người dùng...");

          // Wait a bit for user profile to load
          setTimeout(() => {
            updateLoginStep(2, "success");
            updateLoginStep(3, "processing", "Đang khởi tạo phiên làm việc...");

            setTimeout(() => {
              updateLoginStep(3, "success", "Đăng nhập thành công!");
              // Login completed successfully

              // Show enhanced notification
              showSuccess(
                "🎉 Đăng nhập thành công!",
                `Chào mừng bạn quay trở lại!`
              );
            }, 500);
          }, 1000);
        } else {
          updateLoginStep(1, "error", result.error || "Đăng nhập thất bại");

          // Show enhanced error notification
          showError(
            "❌ Đăng nhập thất bại",
            result.error || "Vui lòng kiểm tra lại email và mật khẩu."
          );
        }
      } catch (error) {
        updateLoginStep(1, "error", "Có lỗi xảy ra khi đăng nhập");
      }
    } else {
      // Register mode
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );
      if (result.success) {
        setMode("login");
        // Clear form except email
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
          fullName: "",
        }));
      }
    }
  };

  const getAccountStatusBadge = useCallback(() => {
    if (checkingAccount) {
      return (
        <Badge variant="outline" className="animate-pulse">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Đang kiểm tra...
        </Badge>
      );
    }

    if (accountExists === true) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Tài khoản tồn tại
        </Badge>
      );
    }

    if (accountExists === false && formData.email.includes("@")) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Tài khoản chưa tồn tại
        </Badge>
      );
    }

    return null;
  }, [checkingAccount, accountExists, formData.email]);

  // Show success screen if authenticated
  if (isAuthenticated && userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Đăng nhập thành công!
            </CardTitle>
            <CardDescription>
              Chào mừng bạn trở lại,{" "}
              {userProfile.full_name || userProfile.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.full_name || userProfile.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {userProfile.full_name || "Người dùng"}
                  </p>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                </div>
              </div>
              <Badge variant="outline">
                {userProfile.role === "student"
                  ? "Học viên"
                  : userProfile.role === "instructor"
                  ? "Giảng viên"
                  : userProfile.role === "admin"
                  ? "Quản trị viên"
                  : "Người dùng"}
              </Badge>
            </div>

            <Button
              onClick={() => (window.location.href = "/trang-chu")}
              className="w-full"
            >
              Tiếp tục vào trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Đăng nhập vào tài khoản Nam Long Center của bạn"
              : "Tạo tài khoản mới để bắt đầu học tập"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Show login steps if in progress */}
          {loginSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Tiến trình đăng nhập</span>
                <span>
                  {Math.round(((currentStep + 1) / loginSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / loginSteps.length) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="space-y-1">
                {loginSteps.map((step, index) => (
                  <div
                    key={step.step}
                    className="flex items-center gap-2 text-sm"
                  >
                    {step.status === "processing" && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                    {step.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {step.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {step.status === "pending" && (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}

                    <span
                      className={
                        step.status === "success"
                          ? "text-green-700"
                          : step.status === "error"
                          ? "text-red-700"
                          : step.status === "processing"
                          ? "text-blue-700"
                          : "text-gray-500"
                      }
                    >
                      {step.title}
                    </span>
                    {step.message && (
                      <span className="text-xs text-gray-500">
                        - {step.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
              {formData.email && getAccountStatusBadge()}
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Full name for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="text-sm text-red-600">
                    {validationErrors.fullName}
                  </p>
                )}
              </div>
            )}

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm password for register */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || checkingAccount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."}
                </>
              ) : mode === "login" ? (
                "Đăng nhập"
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setLoginSteps([]);
                setValidationErrors({});
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {mode === "login"
                ? "Chưa có tài khoản? Đăng ký ngay"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
