/**
 * Trang Liên hệ - Thiết kế thống nhất Quick Action
 */

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Paperclip,
  X,
  FileText,
  MessageCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { SEO } from "../components/SEO";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@knowledgebase.com",
      link: "mailto:contact@knowledgebase.com",
    },
    {
      icon: Phone,
      title: "Hotline",
      value: "1900-xxxx",
      link: "tel:1900xxxx",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: "123 Đường ABC, Quận 1, TP.HCM",
      link: "#",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      value: "T2-T7: 8:00 - 18:00",
      link: "#",
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", link: "#" },
    { icon: Twitter, name: "Twitter", link: "#" },
    { icon: Linkedin, name: "LinkedIn", link: "#" },
    { icon: Youtube, name: "YouTube", link: "#" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn. Tối đa 10MB`);
        return false;
      }
      return true;
    });
    if (attachments.length + validFiles.length > 5) {
      toast.error("Tối đa 5 file đính kèm");
      return;
    }
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setAttachments([]);
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Liên hệ" description="Liên hệ với Knowledge Base" url="/contact" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              <MessageCircle className="h-4 w-4 mr-2" />
              Liên hệ
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle>Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Họ và tên"
                  className="border-border bg-background text-foreground"
                />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="border-border bg-background text-foreground"
                />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  className="border-border bg-background text-foreground"
                />
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Nội dung tin nhắn..."
                  rows={5}
                  className="border-border bg-background text-foreground"
                  required
                />
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    File đính kèm (tối đa 5 files, 10MB/file)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Chọn file đính kèm</span>
                  </label>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm text-foreground">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-destructive hover:opacity-80"
                            aria-label="Xóa file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent inline-block mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Thông tin liên hệ</h2>
            {contactInfo.map((info, index) => (
              <Card key={index} className="border border-border bg-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <info.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{info.title}</p>
                    <a
                      href={info.link}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {info.value}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle>Kết nối với chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <social.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle>Bản đồ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground ml-2">Bản đồ sẽ được hiển thị tại đây</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
