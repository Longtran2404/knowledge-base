/**
 * Trang Hỗ trợ - Thiết kế thống nhất Quick Action
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ArrowRight,
  Book,
  Video,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { SEO } from "../components/SEO";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Trò chuyện trực tiếp với đội ngũ hỗ trợ",
      availability: "24/7",
      action: "Bắt đầu chat",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Gửi email và nhận phản hồi trong 24h",
      availability: "support@knowledgebase.com",
      action: "Gửi email",
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "Gọi điện trực tiếp cho đội ngũ",
      availability: "1900-xxxx",
      action: "Gọi ngay",
    },
  ];

  const resources = [
    { icon: Book, title: "Tài liệu hướng dẫn", count: "150+ bài viết", link: "/huong-dan" },
    { icon: Video, title: "Video hướng dẫn", count: "50+ video", link: "/khoa-hoc" },
    { icon: FileText, title: "FAQ", count: "100+ câu hỏi", link: "/faq" },
    { icon: Users, title: "Cộng đồng", count: "5000+ thành viên", link: "/bai-viet" },
  ];

  const commonQuestions = [
    { question: "Làm sao để đăng ký khóa học?", answer: "Chọn khóa học và nhấn Đăng ký ngay trên trang khóa học." },
    { question: "Chính sách hoàn tiền như thế nào?", answer: "Hỗ trợ hoàn tiền 100% trong vòng 7 ngày nếu chưa bắt đầu học." },
    { question: "Có hỗ trợ thanh toán trả góp không?", answer: "Có, hỗ trợ trả góp 0% cho khóa học từ 5 triệu đồng trở lên." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Hỗ trợ" description="Đội ngũ hỗ trợ 24/7 - Live chat, email, hotline" url="/support" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <HelpCircle className="h-4 w-4 mr-2" />
              Hỗ trợ khách hàng
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Đội ngũ chuyên gia giải đáp và hỗ trợ bạn 24/7 qua nhiều kênh
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 relative z-10">
        {/* Kênh hỗ trợ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="border border-border bg-card hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <channel.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{channel.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{channel.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{channel.availability}</span>
                </div>
                <Button className="w-full">
                  {channel.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form + Tài nguyên */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Họ và tên</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Chủ đề</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Tiêu đề vấn đề"
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nội dung</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mô tả chi tiết..."
                    rows={5}
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <Button type="submit" className="w-full">Gửi yêu cầu</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Tài nguyên hỗ trợ</h2>
            {resources.map((resource, index) => (
              <Link key={index} to={resource.link}>
                <Card className="border border-border bg-card hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <resource.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.count}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle>Câu hỏi thường gặp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commonQuestions.map((item, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/faq">
                    Xem tất cả FAQ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
