import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { FluidGlass } from "../components/ui/fluid-glass";
import { BlurTextWords } from "../components/ui/blur-text";

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "general", name: "Chung", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "courses", name: "Khóa học", icon: <BookOpen className="h-4 w-4" /> },
    { id: "payment", name: "Thanh toán", icon: <CreditCard className="h-4 w-4" /> },
    { id: "account", name: "Tài khoản", icon: <Settings className="h-4 w-4" /> },
    { id: "privacy", name: "Bảo mật", icon: <Shield className="h-4 w-4" /> },
  ];

  const faqs = [
    {
      category: "general",
      question: "Nam Long Center là gì?",
      answer: "Nam Long Center là nền tảng học tập trực tuyến chuyên về BIM, AutoCAD và các công nghệ xây dựng hiện đại.",
    },
    {
      category: "courses",
      question: "Làm sao để đăng ký khóa học?",
      answer: "Bạn có thể đăng ký khóa học bằng cách chọn khóa học mong muốn và nhấn nút 'Đăng ký ngay'.",
    },
    {
      category: "payment",
      question: "Có hỗ trợ thanh toán trả góp không?",
      answer: "Có, chúng tôi hỗ trợ thanh toán trả góp 0% cho các khóa học có giá trị từ 5 triệu đồng trở lên.",
    },
    {
      category: "account",
      question: "Làm sao để reset mật khẩu?",
      answer: "Bạn có thể reset mật khẩu bằng cách nhấn vào 'Quên mật khẩu' ở trang đăng nhập.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <BlurTextWords
            text="Câu hỏi thường gặp"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
            variant="blur-slide"
          />

          <div className="relative max-w-2xl mx-auto mt-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="pl-12 bg-white/5 border-white/10 text-white h-14 text-lg"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 relative z-10 max-w-4xl">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Badge key={cat.id} variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
              {cat.icon}
              <span className="ml-2">{cat.name}</span>
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <FluidGlass key={index} variant="dark" blur="md" className="p-6 cursor-pointer" onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 text-gray-400"
                >
                  {faq.answer}
                </motion.div>
              )}
            </FluidGlass>
          ))}
        </div>
      </section>
    </div>
  );
}
