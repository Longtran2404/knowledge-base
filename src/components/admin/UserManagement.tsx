/**
 * Component quản lý người dùng cho admin
 * Cho phép cấp quyền admin cho tài khoản cụ thể
 */

import React, { useState } from "react";
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
import {
  Crown,
  UserPlus,
  Shield,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase-config";
import { nlcApi } from "../../lib/api/nlc-database-api";
import { useAuth } from "../../contexts/UnifiedAuthContext";

export default function UserManagement() {
  const { userProfile } = useAuth();
  const [email, setEmail] = useState("tranminhlong2404@gmail.com");
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoGranted, setAutoGranted] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check if current user is manager/admin
  React.useEffect(() => {
    const checkManagerStatus = async () => {
      if (!userProfile) return;

      try {
        const managerResponse = await nlcApi.managers.isManager(
          userProfile.user_id
        );
        if (managerResponse.success) {
          setIsManager(managerResponse.data || false);
        }
      } catch (error) {
        console.error("Error checking manager status:", error);
      }
    };

    checkManagerStatus();
  }, [userProfile]);

  const handleGrantAdminAccess = React.useCallback(async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      console.log(`Granting admin access to: ${email}`);

      // First, try to get existing account
      const existingAccountResponse = await nlcApi.accounts.getAccountByEmail(
        email
      );

      if (existingAccountResponse.success && existingAccountResponse.data) {
        // Update existing account to admin
        const updateResponse = await nlcApi.accounts.updateAccount(
          existingAccountResponse.data.user_id,
          {
            account_role: "admin",
            membership_plan: "business",
            is_paid: true,
            account_status: "active",
            approved_by: userProfile?.user_id || "system",
            approved_at: new Date().toISOString(),
          }
        );

        if (updateResponse.success) {
          // Create manager record
          await nlcApi.managers.createManager(
            existingAccountResponse.data.user_id,
            email,
            existingAccountResponse.data.full_name,
            "admin"
          );

          setResult({
            success: true,
            message: `Đã cập nhật quyền admin cho ${email} thành công!`,
          });
        } else {
          throw new Error(updateResponse.error || "Failed to update account");
        }
      } else {
        // Create new account
        const createResponse = await nlcApi.accounts.createAccount({
          email: email,
          full_name: email.split("@")[0],
        });

        if (createResponse.success && createResponse.data) {
          // Update to admin role
          const updateResponse = await nlcApi.accounts.updateAccount(
            createResponse.data.user_id,
            {
              account_role: "admin",
              membership_plan: "business",
              is_paid: true,
              account_status: "active",
              approved_by: userProfile?.user_id || "system",
              approved_at: new Date().toISOString(),
            }
          );

          if (updateResponse.success) {
            // Create manager record
            await nlcApi.managers.createManager(
              createResponse.data.user_id,
              email,
              createResponse.data.full_name,
              "admin"
            );

            setResult({
              success: true,
              message: `Đã tạo tài khoản admin cho ${email} thành công!`,
            });
          } else {
            throw new Error(
              updateResponse.error || "Failed to update new account"
            );
          }
        } else {
          throw new Error(createResponse.error || "Failed to create account");
        }
      }

      // Log admin grant activity
      if (userProfile) {
        await nlcApi.activityLog.logActivity(
          userProfile.user_id,
          userProfile.email,
          userProfile.account_role,
          "admin_action",
          `Granted admin access to ${email}`,
          {
            resourceType: "user",
            resourceId: email,
            metadata: {
              granted_to: email,
              granted_by: userProfile.email,
              role_granted: "admin",
              timestamp: new Date().toISOString(),
              impactLevel: "high",
            },
          }
        );
      }

      toast.success("Cấp quyền admin thành công!");
    } catch (error: any) {
      console.error("Error granting admin access:", error);
      setResult({
        success: false,
        message: `Có lỗi xảy ra: ${error.message}. Có thể cần setup database trước.`,
      });
      toast.error("Có lỗi xảy ra khi cấp quyền");
    } finally {
      setIsProcessing(false);
    }
  }, [email, userProfile]);

  // Auto-grant admin on component mount for the specific email
  React.useEffect(() => {
    const autoGrant = async () => {
      if (!autoGranted && email === "tranminhlong2404@gmail.com") {
        console.log("Auto-granting admin access to:", email);
        setAutoGranted(true);
        await handleGrantAdminAccess();
      }
    };

    // Only run once when component mounts
    if (email === "tranminhlong2404@gmail.com" && !autoGranted) {
      autoGrant();
    }
  }, [email, autoGranted, handleGrantAdminAccess]); // Include dependencies

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Quản lý người dùng
          </CardTitle>
          <CardDescription>
            Cấp quyền admin cho tài khoản người dùng
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Grant Admin Access Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Crown className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Cấp quyền Admin</h3>
                <p className="text-sm text-blue-700">
                  Cấp quyền admin và gói premium cho tài khoản
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email tài khoản</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email người dùng"
              />
            </div>

            <Button
              onClick={handleGrantAdminAccess}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cấp quyền Admin
                </>
              )}
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <Alert
              className={
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={result.success ? "text-green-800" : "text-red-800"}
              >
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Instructions */}
          {result && !result.success && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-yellow-800">
                  Hướng dẫn setup thủ công
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-yellow-700 space-y-2">
                  <p className="font-medium">
                    Thực hiện các bước sau trong Supabase Dashboard:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Truy cập Supabase Dashboard</li>
                    <li>Vào Database → Tables → account_nam_long_center</li>
                    <li>Thêm/sửa record với thông tin:</li>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>email: {email}</li>
                      <li>role: admin</li>
                      <li>plan: premium</li>
                      <li>status: active</li>
                      <li>provider: email</li>
                    </ul>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Target Account */}
          <Card
            className={`border-2 ${
              result?.success
                ? "border-green-200 bg-green-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {result?.success ? (
                  <Crown className="h-5 w-5 text-green-600" />
                ) : (
                  <Mail className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      result?.success ? "text-green-900" : "text-blue-900"
                    }`}
                  >
                    {result?.success ? "Tài khoản Admin" : "Tài khoản đích"}
                  </p>
                  <p
                    className={`text-sm ${
                      result?.success ? "text-green-700" : "text-blue-700"
                    }`}
                  >
                    {email}
                  </p>
                </div>
              </div>
              <div
                className={`mt-3 text-sm ${
                  result?.success ? "text-green-700" : "text-blue-700"
                }`}
              >
                <p>
                  {result?.success
                    ? "Quyền đã được cấp:"
                    : "Quyền sẽ được cấp:"}
                </p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Role: Admin tổng quản lý</li>
                  <li>Plan: Premium lifetime</li>
                  <li>Truy cập tất cả tính năng</li>
                  <li>Quản lý toàn bộ hệ thống</li>
                  <li>Cấp quyền cho người dùng khác</li>
                </ul>
              </div>
              {result?.success && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Tài khoản đã được nâng cấp thành Admin tổng quản lý!
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
