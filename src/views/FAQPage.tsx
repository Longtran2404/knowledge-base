/**
 * Trang FAQ - Thiết kế thống nhất Quick Action
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  CreditCard,
  Settings,
  Shield,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { SEO } from "../components/SEO";

const categories = [
  { id: "general", name: "Chung", icon: HelpCircle },
  { id: "courses", name: "Khóa học", icon: BookOpen },
  { id: "payment", name: "Thanh toán", icon: CreditCard },
  { id: "account", name: "Tài khoản", icon: Settings },
  { id: "privacy", name: "Bảo mật", icon: Shield },
];

const faqs = [
  { category: "general", question: "Knowledge Base là gì?", answer: "Nền tảng học tập trực tuyến chuyên về BIM, AutoCAD và công nghệ xây dựng hiện đại." },
  { category: "courses", question: "Làm sao để đăng ký khóa học?", answer: "Chọn khóa học trên trang Khóa học hoặc Marketplace, nhấn \"Đăng ký ngay\" hoặc \"Mua ngay\" và hoàn tất thanh toán." },
  { category: "payment", question: "Có hỗ trợ thanh toán trả góp không?", answer: "Có, chúng tôi hỗ trợ trả góp 0% cho khóa học từ 5 triệu đồng trở lên." },
  { category: "account", question: "Làm sao để reset mật khẩu?", answer: "Vào trang Đăng nhập, nhấn \"Quên mật khẩu\" và làm theo hướng dẫn gửi qua email." },
  { category: "privacy", question: "Dữ liệu cá nhân được bảo mật thế nào?", answer: "Chúng tôi mã hóa và tuân thủ chính sách bảo mật. Xem chi tiết tại trang Chính sách bảo mật." },
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || faq.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Câu hỏi thường gặp" description="FAQ - Knowledge Base" url="/faq" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <MessageCircle className="h-4 w-4 mr-2" />
              FAQ
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Câu hỏi thường gặp
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tìm câu trả lời nhanh về khóa học, thanh toán và tài khoản
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="pl-12 border-border bg-background text-foreground h-12"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={filterCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(null)}
          >
            Tất cả
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id)}
            >
              <cat.icon className="h-4 w-4 mr-2" />
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => (
            <Card
              key={index}
              className="border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {activeIndex === index && (
                  <p className="mt-4 text-muted-foreground border-t border-border pt-4">{faq.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="border border-border bg-card inline-block">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">Chưa tìm thấy câu trả lời?</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Trang Hỗ trợ
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/contact">
                    Liên hệ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
