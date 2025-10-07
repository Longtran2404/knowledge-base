import React from "react";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const SubscriptionStatus: React.FC = () => {
  const { userProfile: user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Trạng thái tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Đang tải...</Badge>
        </CardContent>
      </Card>
    );
  }

  const plan = user.membership_plan || "free";
  const isActive = user.account_status === "active";

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "free":
        return "Miễn phí";
      case "student_299":
        return "Sinh viên";
      case "business":
        return "Doanh nghiệp";
      default:
        return plan;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "secondary";
      case "student_299":
        return "default";
      case "business":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Trạng thái tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Gói dịch vụ:</span>
          <Badge variant={getPlanColor(plan) as any}>
            {getPlanLabel(plan)}
          </Badge>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Trạng thái:</span>
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Hoạt động</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">Tạm ngưng</span>
              </>
            )}
          </div>
        </div>

        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Thông tin:</span>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Tài khoản {plan === "free" ? "miễn phí" : "trả phí"}
            </span>
          </div>
        </div>

        {/* Upgrade Button */}
        {plan === "free" && (
          <div className="pt-2">
            <Button asChild className="w-full">
              <Link to="/goi-dich-vu">Nâng cấp tài khoản</Link>
            </Button>
          </div>
        )}

        {/* Renew Button */}
        {!isActive && plan !== "free" && (
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/goi-dich-vu">Gia hạn ngay</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
