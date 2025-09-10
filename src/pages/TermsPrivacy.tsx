import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TermsPrivacy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Điều khoản sử dụng & Chính sách bảo mật</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Giới thiệu</h2>
            <p>
              Văn bản dài mô tả điều khoản dịch vụ, quyền và nghĩa vụ người
              dùng...
            </p>
            <h2>2. Thu thập và sử dụng dữ liệu</h2>
            <p>
              Mục đích, phạm vi, cách thức xử lý dữ liệu cá nhân, cookie, phân
              tích...
            </p>
            <h2>3. Bảo mật</h2>
            <p>
              Biện pháp kỹ thuật và tổ chức bảo vệ dữ liệu, lưu trữ, truyền tải
              an toàn...
            </p>
            <h2>4. Quyền của người dùng</h2>
            <p>
              Quyền truy cập, chỉnh sửa, xóa, phản đối xử lý dữ liệu; cách liên
              hệ...
            </p>
            <h2>5. Thanh toán và gói dịch vụ</h2>
            <p>
              Mô tả gói miễn phí, gói 299K, điều kiện thanh toán, hoàn tiền (nếu
              có)...
            </p>
            <h2>6. Sử dụng hợp lệ</h2>
            <p>Các hành vi bị cấm, giới hạn trách nhiệm, chấm dứt dịch vụ...</p>
            <h2>7. Cập nhật</h2>
            <p>
              Cách chúng tôi cập nhật điều khoản và chính sách, thông báo thay
              đổi...
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/auth")}>
                Tôi đã đọc và đồng ý
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
