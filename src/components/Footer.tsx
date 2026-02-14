import React from "react";
import { Link } from "react-router-dom";
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
import { quickLinks, services, supportLinks } from "config/nav";

const Footer = () => {
  const support = supportLinks;

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-primary", label: "Facebook" },
    { icon: Youtube, href: "#", color: "hover:text-destructive", label: "YouTube" },
    { icon: Linkedin, href: "#", color: "hover:text-primary", label: "LinkedIn" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-50/80 dark:bg-slate-900/50 border-t border-border text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">KB</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">Xây dựng tương lai</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Nền tảng giáo dục và thương mại hàng đầu cho ngành xây dựng Việt Nam.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">+84 123 456 789</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">info@knowledgebase.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">T2-T6: 8:00 - 17:30</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Dịch vụ</h4>
              <ul className="space-y-2">
                {services.map((service, i) => (
                  <li key={i}>
                    <Link to={service.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Hỗ trợ & Cập nhật</h4>
              <p className="text-sm text-muted-foreground mb-3">Đăng ký nhận tin tức và ưu đãi</p>
              <div className="flex gap-2 mb-6">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="bg-background border-border text-foreground"
                />
                <Button size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <ul className="space-y-2 mb-6">
                {support.map((item, i) => (
                  <li key={i}>
                    <Link to={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                {socialLinks.map((social, i) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground ${social.color} transition-colors hover:border-primary/30`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Knowledge Base. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Được phát triển với ❤️ tại Việt Nam</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-2"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
