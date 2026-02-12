import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { FluidGlass } from "../components/ui/fluid-glass";
import { BlurText, BlurTextWords } from "../components/ui/blur-text";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const supportChannels = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat",
      description: "Trò chuyện trực tiếp với đội ngũ hỗ trợ",
      availability: "24/7",
      action: "Bắt đầu chat",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Gửi email và nhận phản hồi trong 24h",
      availability: "support@knowledgebase.com",
      action: "Gửi email",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Hotline",
      description: "Gọi điện trực tiếp cho đội ngũ",
      availability: "1900-xxxx",
      action: "Gọi ngay",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const resources = [
    {
      icon: <Book className="h-5 w-5" />,
      title: "Tài liệu hướng dẫn",
      count: "150+ bài viết",
      link: "/docs",
    },
    {
      icon: <Video className="h-5 w-5" />,
      title: "Video hướng dẫn",
      count: "50+ video",
      link: "/videos",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "FAQ",
      count: "100+ câu hỏi",
      link: "/faq",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Cộng đồng",
      count: "5000+ thành viên",
      link: "/community",
    },
  ];

  const commonQuestions = [
    {
      question: "Làm sao để đăng ký khóa học?",
      answer: "Bạn có thể đăng ký khóa học bằng cách...",
    },
    {
      question: "Chính sách hoàn tiền như thế nào?",
      answer: "Chúng tôi hỗ trợ hoàn tiền 100% trong vòng 7 ngày...",
    },
    {
      question: "Có hỗ trợ thanh toán trả góp không?",
      answer: "Có, chúng tôi hỗ trợ thanh toán trả góp 0%...",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 text-sm font-medium mb-8"
          >
            <HelpCircle className="h-4 w-4 text-blue-400" />
            Hỗ trợ khách hàng
          </motion.div>

          <BlurTextWords
            text="Chúng tôi luôn sẵn sàng hỗ trợ bạn"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
            variant="blur-slide"
          />

          <BlurText
            text="Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn 24/7"
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            delay={0.3}
          />
        </div>
      </section>

      {/* Support Channels */}
      <section className="container mx-auto px-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {supportChannels.map((channel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FluidGlass variant="dark" blur="lg" glow className="h-full p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${channel.color} flex items-center justify-center mb-4`}>
                  {channel.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{channel.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{channel.description}</p>
                <div className="flex items-center gap-2 text-sm text-blue-400 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{channel.availability}</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  {channel.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </FluidGlass>
            </motion.div>
          ))}
        </div>

        {/* Contact Form & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <FluidGlass variant="dark" blur="lg" className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Gửi yêu cầu hỗ trợ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Họ và tên
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chủ đề
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Tiêu đề của vấn đề"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nội dung
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  rows={5}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Gửi yêu cầu
              </Button>
            </form>
          </FluidGlass>

          {/* Resources */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Tài nguyên hỗ trợ</h2>
            {resources.map((resource, index) => (
              <FluidGlass key={index} variant="dark" blur="md" className="p-4 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{resource.title}</h3>
                    <p className="text-sm text-gray-400">{resource.count}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </FluidGlass>
            ))}

            {/* Common Questions */}
            <FluidGlass variant="dark" blur="lg" className="p-6 mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Câu hỏi thường gặp</h3>
              <div className="space-y-4">
                {commonQuestions.map((item, index) => (
                  <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">{item.question}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-white/10 text-white hover:bg-white/5">
                Xem tất cả FAQ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </FluidGlass>
          </div>
        </div>
      </section>
    </div>
  );
}
