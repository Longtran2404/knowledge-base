import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { FluidGlass } from "../components/ui/fluid-glass";
import { BlurTextWords } from "../components/ui/blur-text";
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
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      value: "contact@knowledgebase.com",
      link: "mailto:contact@knowledgebase.com",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Hotline",
      value: "1900-xxxx",
      link: "tel:1900xxxx",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Địa chỉ",
      value: "123 Đường ABC, Quận 1, TP.HCM",
      link: "#",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Giờ làm việc",
      value: "T2-T7: 8:00 - 18:00",
      link: "#",
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, name: "Facebook", link: "#", color: "from-blue-600 to-blue-400" },
    { icon: <Twitter className="h-5 w-5" />, name: "Twitter", link: "#", color: "from-sky-600 to-sky-400" },
    { icon: <Linkedin className="h-5 w-5" />, name: "LinkedIn", link: "#", color: "from-blue-700 to-blue-500" },
    { icon: <Youtube className="h-5 w-5" />, name: "YouTube", link: "#", color: "from-red-600 to-red-400" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
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

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.");

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
      setAttachments([]);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <BlurTextWords
            text="Liên hệ với chúng tôi"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            wordClassName="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
            variant="blur-slide"
          />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <FluidGlass variant="dark" blur="lg" className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Họ và tên"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Nội dung tin nhắn..."
                  rows={5}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  File đính kèm (tối đa 5 files, 10MB/file)
                </label>
                <div className="relative">
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
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-colors bg-white/5"
                  >
                    <Paperclip className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Chọn file để đính kèm
                    </span>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-sm text-white">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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
          </FluidGlass>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin liên hệ</h2>
            {contactInfo.map((info, index) => (
              <FluidGlass key={index} variant="dark" blur="md" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{info.title}</p>
                    <a href={info.link} className="text-white font-medium hover:text-blue-400 transition-colors">
                      {info.value}
                    </a>
                  </div>
                </div>
              </FluidGlass>
            ))}

            {/* Social Links */}
            <FluidGlass variant="dark" blur="lg" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Kết nối với chúng tôi</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r ${social.color} hover:scale-105 transition-transform`}
                  >
                    {social.icon}
                    <span className="text-sm font-medium text-white">{social.name}</span>
                  </a>
                ))}
              </div>
            </FluidGlass>

            {/* Map */}
            <FluidGlass variant="dark" blur="lg" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Bản đồ</h3>
              <div className="aspect-video bg-white/10 rounded-xl flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-400" />
                <p className="text-gray-400 ml-2">Bản đồ sẽ được hiển thị tại đây</p>
              </div>
            </FluidGlass>
          </div>
        </div>
      </section>
    </div>
  );
}
