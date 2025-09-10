import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chính sách bảo mật
              </h1>
              <p className="text-gray-600">
                Nam Long Center - Cập nhật lần cuối:{" "}
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Chính sách bảo mật thông tin
            </CardTitle>
            <CardDescription className="text-center">
              Cam kết bảo vệ thông tin cá nhân của người dùng
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Giới thiệu */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                1. Giới thiệu
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Nam Long Center ("chúng tôi", "công ty", "trung tâm") cam kết
                  bảo vệ quyền riêng tư và thông tin cá nhân của người dùng.
                  Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử
                  dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng
                  dịch vụ của chúng tôi.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Bằng việc sử dụng dịch vụ của Nam Long Center, bạn đồng ý với
                  việc thu thập và sử dụng thông tin theo chính sách này. Nếu
                  bạn không đồng ý với bất kỳ phần nào của chính sách này, vui
                  lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </div>
            </section>

            {/* Thông tin thu thập */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                2. Thông tin chúng tôi thu thập
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    2.1. Thông tin cá nhân
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Họ và tên</li>
                    <li>Địa chỉ email</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ thường trú</li>
                    <li>Ngày sinh</li>
                    <li>Giới tính</li>
                    <li>Ảnh đại diện (nếu có)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    2.2. Thông tin học tập
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1">
                    <li>Lịch sử khóa học đã tham gia</li>
                    <li>Tiến độ học tập</li>
                    <li>Điểm số và đánh giá</li>
                    <li>Chứng chỉ đã đạt được</li>
                    <li>Ghi chú và phản hồi từ giảng viên</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    2.3. Thông tin kỹ thuật
                  </h3>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1">
                    <li>Địa chỉ IP</li>
                    <li>Thông tin trình duyệt</li>
                    <li>Thiết bị sử dụng</li>
                    <li>Dữ liệu cookie</li>
                    <li>Lịch sử truy cập</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Mục đích sử dụng */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                3. Mục đích sử dụng thông tin
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    3.1. Cung cấp dịch vụ
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Tạo và quản lý tài khoản người dùng</li>
                    <li>Cung cấp khóa học và tài liệu học tập</li>
                    <li>Theo dõi tiến độ học tập</li>
                    <li>Cấp chứng chỉ hoàn thành</li>
                    <li>Hỗ trợ kỹ thuật</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    3.2. Cải thiện dịch vụ
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Phân tích hành vi người dùng</li>
                    <li>Cải thiện giao diện và trải nghiệm</li>
                    <li>Phát triển tính năng mới</li>
                    <li>Nghiên cứu và phát triển</li>
                    <li>Đảm bảo an toàn hệ thống</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bảo mật thông tin */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                4. Biện pháp bảo mật
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      4.1. Bảo mật kỹ thuật
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Mã hóa dữ liệu với SSL/TLS 256-bit</li>
                      <li>Xác thực đa yếu tố (2FA)</li>
                      <li>Bảo vệ chống tấn công DDoS</li>
                      <li>Firewall và hệ thống phát hiện xâm nhập</li>
                      <li>Backup dữ liệu định kỳ</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      4.2. Bảo mật quản lý
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Phân quyền truy cập nghiêm ngặt</li>
                      <li>Đào tạo nhân viên về bảo mật</li>
                      <li>Kiểm tra bảo mật định kỳ</li>
                      <li>Chính sách mật khẩu mạnh</li>
                      <li>Giám sát hoạt động hệ thống</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Chia sẻ thông tin */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Chia sẻ thông tin
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 font-semibold mb-2">
                  Chúng tôi KHÔNG bán, cho thuê hoặc chia sẻ thông tin cá nhân
                  của bạn với bên thứ ba, trừ các trường hợp sau:
                </p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                  <li>Để bảo vệ quyền lợi và an toàn của người dùng</li>
                  <li>Với nhà cung cấp dịch vụ tin cậy (có cam kết bảo mật)</li>
                  <li>Khi được sự đồng ý rõ ràng từ người dùng</li>
                </ul>
              </div>
            </section>

            {/* Quyền của người dùng */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Quyền của người dùng
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    6.1. Quyền truy cập
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Xem thông tin cá nhân đã lưu trữ</li>
                    <li>Tải xuống dữ liệu cá nhân</li>
                    <li>Yêu cầu báo cáo về việc sử dụng dữ liệu</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    6.2. Quyền kiểm soát
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Cập nhật thông tin cá nhân</li>
                    <li>Xóa tài khoản và dữ liệu</li>
                    <li>Rút lại sự đồng ý</li>
                    <li>Khiếu nại về việc xử lý dữ liệu</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookie */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Chính sách Cookie
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-3">
                  Chúng tôi sử dụng cookie để cải thiện trải nghiệm người dùng
                  và phân tích lưu lượng truy cập.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Cookie cần thiết</span>
                    <span className="text-blue-600 font-semibold">
                      Luôn hoạt động
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Cookie phân tích</span>
                    <span className="text-blue-600 font-semibold">
                      Có thể tắt
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Cookie quảng cáo</span>
                    <span className="text-blue-600 font-semibold">
                      Có thể tắt
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Liên hệ */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                8. Liên hệ
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Nếu bạn có câu hỏi về chính sách bảo mật này hoặc muốn thực
                  hiện quyền của mình, vui lòng liên hệ với chúng tôi:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">
                        info@namlongcenter.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">0123 456 789</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">
                        123 Đường ABC, Quận XYZ, TP.HCM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Cập nhật chính sách */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Cập nhật chính sách
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  Chúng tôi có thể cập nhật chính sách bảo mật này theo thời
                  gian. Mọi thay đổi sẽ được thông báo trên trang web và qua
                  email. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được
                  coi là đồng ý với chính sách mới.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Quay lại đăng ký/đăng nhập
          </Button>
        </div>
      </div>
    </div>
  );
}
