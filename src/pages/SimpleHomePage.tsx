import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Award,
  Target,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
            <Building2 className="h-4 w-4 mr-2" />
            Nền tảng BIM & Xây dựng hàng đầu
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Nam Long <span className="text-blue-600">Center</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Học tập và phát triển kỹ năng BIM, AutoCAD và công nghệ xây dựng hiện đại.
            Kết nối với cộng đồng chuyên gia và chia sẻ kiến thức thực tế.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Play className="mr-2 h-5 w-5" />
                Bắt đầu học ngay
              </Button>
            </Link>
            <Link to="/khoa-hoc">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Xem khóa học
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Học viên</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Khóa học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Nam Long Center?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cung cấp giải pháp toàn diện cho việc học tập và phát triển trong ngành xây dựng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Khóa học chất lượng</CardTitle>
                <CardDescription>
                  Hàng trăm khóa học BIM, AutoCAD được thiết kế bởi các chuyên gia hàng đầu
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Cộng đồng chuyên gia</CardTitle>
                <CardDescription>
                  Kết nối với 10,000+ kỹ sư, kiến trúc sư và chuyên gia xây dựng
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Chứng chỉ uy tín</CardTitle>
                <CardDescription>
                  Cấp chứng chỉ được công nhận bởi các tổ chức và hiệp hội nghề nghiệp
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Thực hành thực tế</CardTitle>
                <CardDescription>
                  Áp dụng ngay vào công việc với các dự án và case study thực tế
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Cập nhật xu hướng</CardTitle>
                <CardDescription>
                  Luôn cập nhật những công nghệ và xu hướng mới nhất trong ngành
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Hỗ trợ 24/7</CardTitle>
                <CardDescription>
                  Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Tham gia cộng đồng Nam Long Center ngay hôm nay để nâng cao kỹ năng
            và kết nối với các chuyên gia hàng đầu trong ngành xây dựng
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Star className="mr-2 h-5 w-5" />
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link to="/khoa-hoc">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Khám phá khóa học
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}