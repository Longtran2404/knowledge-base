import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/UnifiedAuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

function formatExpiry(isoDate: string | undefined): string {
  if (!isoDate) return "trong vòng 30 ngày (đang cập nhật)";
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return "trong vòng 30 ngày (đang cập nhật)";
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "trong vòng 30 ngày (đang cập nhật)";
  }
}

const SuccessPremiumPage: React.FC = () => {
  const { userProfile } = useAuth();
  const expiryText = useMemo(
    () => formatExpiry(userProfile?.membership_expires_at),
    [userProfile?.membership_expires_at]
  );

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center">
      <Card className="max-w-lg w-full border-green-200 dark:border-green-800 bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" aria-hidden />
          </div>
          <CardTitle className="text-2xl text-foreground">Thanh toán Premium thành công</CardTitle>
          <p className="text-muted-foreground mt-1">
            Cảm ơn bạn! Quyền truy cập Premium đã được kích hoạt.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Gói của bạn có hiệu lực đến: <strong className="text-foreground">{expiryText}</strong>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link to="/">Vào trang chủ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/khoa-hoc">Xem khóa học</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/quan-ly-tai-khoan">Quản lý tài khoản</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SuccessPremiumPage;
