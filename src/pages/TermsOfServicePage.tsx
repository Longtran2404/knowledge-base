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
  FileText,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Điều khoản sử dụng
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
              Điều khoản và điều kiện sử dụng dịch vụ
            </CardTitle>
            <CardDescription className="text-center">
              Quy định sử dụng dịch vụ đào tạo trực tuyến của Nam Long Center
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Giới thiệu */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                1. Giới thiệu và chấp nhận
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Chào mừng bạn đến với Nam Long Center ("chúng tôi", "công ty",
                  "trung tâm"). Điều khoản sử dụng này ("Điều khoản") quy định
                  việc sử dụng dịch vụ đào tạo trực tuyến của chúng tôi.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn
                  đồng ý tuân thủ và bị ràng buộc bởi các điều khoản này. Nếu
                  bạn không đồng ý với bất kỳ phần nào của điều khoản này, vui
                  lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </div>
            </section>

            {/* Định nghĩa */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Định nghĩa
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      2.1. Thuật ngữ chính
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>
                        <strong>"Dịch vụ"</strong>: Các khóa học, tài liệu, và
                        nền tảng học tập trực tuyến
                      </li>
                      <li>
                        <strong>"Người dùng"</strong>: Học viên, giảng viên, và
                        quản trị viên
                      </li>
                      <li>
                        <strong>"Nội dung"</strong>: Tài liệu, video, bài tập,
                        và các tài nguyên học tập
                      </li>
                      <li>
                        <strong>"Tài khoản"</strong>: Tài khoản cá nhân trên nền
                        tảng
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      2.2. Các bên liên quan
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>
                        <strong>"Học viên"</strong>: Người đăng ký tham gia khóa
                        học
                      </li>
                      <li>
                        <strong>"Giảng viên"</strong>: Người tạo và giảng dạy
                        khóa học
                      </li>
                      <li>
                        <strong>"Quản trị viên"</strong>: Người quản lý hệ thống
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Đăng ký tài khoản */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Đăng ký tài khoản
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    3.1. Yêu cầu đăng ký
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1">
                    <li>Bạn phải từ 16 tuổi trở lên</li>
                    <li>Cung cấp thông tin chính xác và đầy đủ</li>
                    <li>Chỉ được tạo một tài khoản duy nhất</li>
                    <li>Bảo mật thông tin đăng nhập</li>
                    <li>Chịu trách nhiệm về mọi hoạt động trên tài khoản</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    3.2. Cấm sử dụng
                  </h3>
                  <ul className="list-disc list-inside text-red-800 space-y-1">
                    <li>Tạo tài khoản giả mạo</li>
                    <li>Sử dụng thông tin của người khác</li>
                    <li>Chia sẻ tài khoản với người khác</li>
                    <li>Tạo nhiều tài khoản để lạm dụng</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sử dụng dịch vụ */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Sử dụng dịch vụ
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    4.1. Quyền của người dùng
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Truy cập khóa học đã đăng ký</li>
                    <li>Tải xuống tài liệu học tập</li>
                    <li>Tham gia thảo luận và hỏi đáp</li>
                    <li>Nhận chứng chỉ hoàn thành</li>
                    <li>Yêu cầu hỗ trợ kỹ thuật</li>
                    <li>Cập nhật thông tin cá nhân</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    4.2. Nghĩa vụ của người dùng
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Tuân thủ quy định của khóa học</li>
                    <li>Không sao chép hoặc phân phối nội dung</li>
                    <li>Tôn trọng giảng viên và học viên khác</li>
                    <li>Báo cáo vi phạm khi phát hiện</li>
                    <li>Thanh toán học phí đúng hạn</li>
                    <li>Cập nhật thông tin khi có thay đổi</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Nội dung và sở hữu trí tuệ */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Nội dung và sở hữu trí tuệ
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">
                  5.1. Quyền sở hữu
                </h3>
                <p className="text-blue-800 mb-3">
                  Tất cả nội dung trên nền tảng Nam Long Center, bao gồm nhưng
                  không giới hạn:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Video bài giảng và tài liệu học tập</li>
                  <li>Phần mềm và ứng dụng</li>
                  <li>Logo, thương hiệu và thiết kế</li>
                  <li>Nội dung văn bản và hình ảnh</li>
                  <li>Cơ sở dữ liệu và thuật toán</li>
                </ul>
                <p className="text-blue-800 mt-3">
                  Đều thuộc sở hữu của Nam Long Center hoặc được cấp phép sử
                  dụng. Bạn không được sao chép, phân phối, hoặc sử dụng cho mục
                  đích thương mại mà không có sự đồng ý bằng văn bản.
                </p>
              </div>
            </section>

            {/* Thanh toán và hoàn tiền */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Thanh toán và hoàn tiền
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    6.1. Phương thức thanh toán
                  </h3>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1">
                    <li>Chuyển khoản ngân hàng</li>
                    <li>Thẻ tín dụng/ghi nợ</li>
                    <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
                    <li>Thanh toán trả góp (nếu có)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    6.2. Chính sách hoàn tiền
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1">
                    <li>Hoàn tiền 100% trong 7 ngày đầu</li>
                    <li>Hoàn tiền 50% trong 30 ngày đầu</li>
                    <li>Không hoàn tiền sau 30 ngày</li>
                    <li>Hoàn tiền khi có lỗi kỹ thuật từ phía chúng tôi</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cấm và vi phạm */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                7. Hành vi bị cấm
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      7.1. Hành vi bất hợp pháp
                    </h3>
                    <ul className="list-disc list-inside text-red-800 space-y-1">
                      <li>Phát tán nội dung bất hợp pháp</li>
                      <li>Xâm phạm quyền sở hữu trí tuệ</li>
                      <li>Lừa đảo hoặc gian lận</li>
                      <li>Quấy rối hoặc đe dọa</li>
                      <li>Phân biệt đối xử</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      7.2. Hành vi kỹ thuật
                    </h3>
                    <ul className="list-disc list-inside text-red-800 space-y-1">
                      <li>Hack hoặc tấn công hệ thống</li>
                      <li>Phát tán virus hoặc malware</li>
                      <li>Spam hoặc gửi email rác</li>
                      <li>Sử dụng bot hoặc tự động hóa</li>
                      <li>Khai thác lỗ hổng bảo mật</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Chấm dứt dịch vụ */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Chấm dứt dịch vụ
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    8.1. Chấm dứt bởi người dùng
                  </h3>
                  <p className="text-gray-700">
                    Bạn có thể chấm dứt tài khoản bất kỳ lúc nào bằng cách liên
                    hệ với chúng tôi. Dữ liệu sẽ được xóa trong vòng 30 ngày sau
                    khi chấm dứt.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">
                    8.2. Chấm dứt bởi chúng tôi
                  </h3>
                  <p className="text-red-800 mb-2">
                    Chúng tôi có quyền chấm dứt tài khoản của bạn nếu:
                  </p>
                  <ul className="list-disc list-inside text-red-800 space-y-1">
                    <li>Vi phạm điều khoản sử dụng</li>
                    <li>Không thanh toán học phí</li>
                    <li>Hành vi gây hại cho cộng đồng</li>
                    <li>Yêu cầu từ cơ quan pháp luật</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Miễn trừ trách nhiệm */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Miễn trừ trách nhiệm
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 mb-3">
                  Dịch vụ được cung cấp "như hiện tại" và chúng tôi không đảm
                  bảo:
                </p>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  <li>Dịch vụ hoạt động liên tục không gián đoạn</li>
                  <li>Không có lỗi hoặc virus</li>
                  <li>Kết quả học tập cụ thể</li>
                  <li>Việc làm sau khi hoàn thành khóa học</li>
                  <li>Tính chính xác của thông tin bên thứ ba</li>
                </ul>
              </div>
            </section>

            {/* Giới hạn trách nhiệm */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Giới hạn trách nhiệm
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Trong mọi trường hợp, trách nhiệm của Nam Long Center không
                  vượt quá số tiền bạn đã thanh toán cho dịch vụ trong 12 tháng
                  trước khi xảy ra sự kiện gây thiệt hại.
                </p>
              </div>
            </section>

            {/* Luật áp dụng */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Luật áp dụng và giải quyết tranh chấp
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-3">
                  Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi
                  tranh chấp sẽ được giải quyết thông qua:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Thương lượng trực tiếp</li>
                  <li>Hòa giải thông qua trung tâm hòa giải</li>
                  <li>Trọng tài thương mại</li>
                  <li>Tòa án có thẩm quyền tại TP.HCM</li>
                </ul>
              </div>
            </section>

            {/* Liên hệ */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                12. Liên hệ
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Nếu bạn có câu hỏi về điều khoản này, vui lòng liên hệ:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong> info@namlongcenter.com
                    </p>
                    <p className="text-gray-700">
                      <strong>Điện thoại:</strong> 0123 456 789
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM
                    </p>
                    <p className="text-gray-700">
                      <strong>Giờ làm việc:</strong> 8:00 - 17:00 (T2-T6)
                    </p>
                  </div>
                </div>
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
