import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Youtube,
  Linkedin,
  Send,
  ArrowUp,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Khóa học", href: "/courses" },
    { label: "Thư viện", href: "/resources" },
    { label: "Blog", href: "/blog" },
  ];

  const services = [
    { label: "Đào tạo trực tuyến", href: "/courses" },
    { label: "Tư vấn dự án", href: "/consulting" },
    { label: "Thiết kế BIM", href: "/bim-services" },
    { label: "Quản lý dự án", href: "/project-management" },
    { label: "Marketplace", href: "/marketplace" },
  ];

  const support = [
    { label: "Liên hệ", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Hỗ trợ", href: "/support" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
      label: "Facebook",
    },
    { icon: Youtube, href: "#", color: "hover:text-red-600", label: "YouTube" },
    {
      icon: Linkedin,
      href: "#",
      color: "hover:text-blue-700",
      label: "LinkedIn",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black/80 backdrop-blur-xl border-t border-white/10 text-white relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Enhanced Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-2xl">NL</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Nam Long Center
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Xây dựng tương lai
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Nền tảng giáo dục và thương mại hàng đầu cho ngành xây dựng Việt
                Nam. Chúng tôi cam kết mang đến những giá trị tốt nhất cho cộng
                đồng.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    123 Đường ABC, Quận 1, TP.HCM
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">+84 123 456 789</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">info@namlongcenter.vn</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300">T2-T6: 8:00 - 17:30</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Liên kết nhanh
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Dịch vụ</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    >
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Hỗ trợ & Cập nhật
              </h4>

              {/* Newsletter */}
              <div className="mb-8">
                <p className="text-gray-300 text-sm mb-4">
                  Đăng ký để nhận tin tức và ưu đãi mới nhất
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email của bạn"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Support Links */}
              <ul className="space-y-3 mb-8">
                {support.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Social Media */}
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  Kết nối với chúng tôi
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-colors hover:bg-gray-700`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="py-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-xs text-gray-400">Học viên</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-xs text-gray-400">Khóa học</div>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-xs text-gray-400">Hài lòng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} Nam Long Center. Tất cả quyền được
              bảo lưu.
            </div>

            <div className="flex items-center gap-6">
              <div className="text-xs text-gray-500">
                Được phát triển với ❤️ tại Việt Nam
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                aria-label="Cuộn lên đầu trang"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
