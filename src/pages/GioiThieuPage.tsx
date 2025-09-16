import React from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Target, Award, Globe, BookOpen, Zap, Heart, Star, CheckCircle, ArrowRight, Mail, Phone, MapPin, Linkedin, Youtube, Facebook, Home, Clock, Trophy, Play } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { AnimeScrollObserver } from "../components/animations/anime-scroll-effects";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

// Metadata moved to App.js or individual page titles

const values = [
  {
    icon: "🎯",
    title: "Sứ mệnh",
    description: "Đưa công nghệ BIM và automation đến với mọi kỹ sư xây dựng Việt Nam"
  },
  {
    icon: "👁️",
    title: "Tầm nhìn",
    description: "Trở thành nền tảng số 1 về giáo dục và công nghệ xây dựng tại Đông Nam Á"
  },
  {
    icon: "💎",
    title: "Giá trị cốt lõi",
    description: "Chất lượng, Sáng tạo, Hợp tác và Phát triển bền vững"
  }
];

const milestones = [
  {
    year: "2020",
    title: "Thành lập",
    description: "Nam Long Center được thành lập với mục tiêu đổi mới giáo dục xây dựng"
  },
  {
    year: "2021",
    title: "Khóa học đầu tiên",
    description: "Ra mắt khóa học BIM cơ bản với 100+ học viên đầu tiên"
  },
  {
    year: "2022",
    title: "Mở rộng",
    description: "Phát triển 50+ khóa học và đạt 10,000+ học viên"
  },
  {
    year: "2023",
    title: "Công nghệ",
    description: "Ra mắt nền tảng e-learning và công cụ automation"
  },
  {
    year: "2024",
    title: "Tương lai",
    description: "Mục tiêu 100,000+ học viên và mở rộng ra Đông Nam Á"
  }
];

const team = [
  {
    name: "Nguyễn Văn Nam",
    position: "CEO & Founder",
    avatar: "NN",
    description: "15+ năm kinh nghiệm trong ngành xây dựng, chuyên gia BIM và automation",
    expertise: ["BIM", "Automation", "Quản lý dự án"]
  },
  {
    name: "Trần Thị Long",
    position: "CTO",
    avatar: "TL",
    description: "Chuyên gia công nghệ với 12+ năm phát triển phần mềm xây dựng",
    expertise: ["Software Development", "AI/ML", "Cloud Computing"]
  },
  {
    name: "Lê Văn Center",
    position: "Head of Education",
    avatar: "LC",
    description: "Giảng viên đại học với 10+ năm đào tạo kỹ sư xây dựng",
    expertise: ["Giáo dục", "Đào tạo", "Chuyên môn xây dựng"]
  }
];

const achievements = [
  {
    number: "50K+",
    label: "Học viên",
    description: "Đã đào tạo thành công"
  },
  {
    number: "200+",
    label: "Khóa học",
    description: "Chất lượng cao"
  },
  {
    number: "95%",
    label: "Tỷ lệ thành công",
    description: "Học viên tìm được việc làm"
  },
  {
    number: "4.9★",
    label: "Đánh giá",
    description: "Từ học viên"
  }
];

const services = [
  {
    icon: BookOpen,
    title: "Đào tạo Chuyên môn",
    description: "Khóa học BIM, AutoCAD, Revit và các công nghệ xây dựng hiện đại",
    features: ["Lý thuyết + Thực hành", "Chứng chỉ quốc tế", "Hỗ trợ 24/7"]
  },
  {
    icon: Zap,
    title: "Công cụ Automation",
    description: "Phần mềm và plugin tự động hóa quy trình thiết kế xây dựng",
    features: ["Tăng hiệu suất 300%", "Giảm sai sót 90%", "Tích hợp dễ dàng"]
  },
  {
    icon: Users,
    title: "Tư vấn & Hỗ trợ",
    description: "Dịch vụ tư vấn chuyên môn và hỗ trợ kỹ thuật cho doanh nghiệp",
    features: ["Chuyên gia giàu kinh nghiệm", "Giải pháp tùy chỉnh", "Hỗ trợ dài hạn"]
  },
  {
    icon: Globe,
    title: "Cộng đồng",
    description: "Xây dựng cộng đồng kỹ sư xây dựng chia sẻ kiến thức và kinh nghiệm",
    features: ["Forum thảo luận", "Sự kiện networking", "Chia sẻ tài liệu"]
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-200/25 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <AnimeScrollObserver animationType="bounceIn" delay={200} duration={1200}>
            <div className="mb-8">
              <Badge variant="outline" className="mb-6 px-6 py-2 text-lg border-blue-300 text-blue-700 bg-blue-50/80 backdrop-blur-sm">
                <Building2 className="h-5 w-5 mr-2" />
                Chào mừng đến với
              </Badge>
            </div>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="scaleIn" delay={400} duration={1500}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Nam Long
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Center
              </span>
            </h1>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="fadeInUp" delay={600} duration={1000}>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              Nền tảng giáo dục và thương mại hàng đầu cho ngành xây dựng Việt Nam, 
              chuyên về <span className="text-blue-600 font-semibold">BIM Automation</span> và 
              <span className="text-indigo-600 font-semibold"> đào tạo kỹ sư xây dựng hiện đại</span>
            </p>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="fadeInUp" delay={800} duration={1000}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                <Zap className="mr-3 h-6 w-6" />
                Khám phá ngay
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-slate-300 hover:border-blue-500 px-8 py-4 text-lg transition-all duration-300">
                <Play className="mr-3 h-6 w-6" />
                Xem Demo
              </Button>
            </div>
          </AnimeScrollObserver>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimeScrollObserver animationType="fadeInUp" delay={200}>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-blue-300 text-blue-700">
                <Target className="h-4 w-4 mr-2" />
                Sứ mệnh & Tầm nhìn
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Kiến tạo tương lai ngành xây dựng
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Chúng tôi cam kết đưa công nghệ BIM và automation đến với mọi kỹ sư xây dựng Việt Nam
              </p>
            </div>
          </AnimeScrollObserver>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <AnimeScrollObserver key={index} animationType="fadeInUp" delay={300 + index * 100} duration={1000}>
                <Card className="text-center p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/50">
                  <CardContent className="p-0">
                    <div className="text-6xl mb-4">{value.icon}</div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{value.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </AnimeScrollObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <AnimeScrollObserver animationType="fadeInUp" delay={200}>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-indigo-300 text-indigo-700">
                <Clock className="h-4 w-4 mr-2" />
                Hành trình phát triển
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Chặng đường 5 năm
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Từ khởi đầu nhỏ bé đến nền tảng giáo dục hàng đầu
              </p>
            </div>
          </AnimeScrollObserver>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <AnimeScrollObserver key={index} animationType={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"} delay={200 + index * 150} duration={1000}>
                <div className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-white rounded-full p-6 shadow-xl">
                      <div className="text-3xl font-bold text-blue-600">{milestone.year}</div>
                    </div>
                  </div>
                  <div className="flex-1 px-8">
                    <Card className={`border-0 shadow-lg ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">{milestone.title}</h3>
                        <p className="text-slate-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AnimeScrollObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimeScrollObserver animationType="fadeInUp" delay={200}>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-green-300 text-green-700">
                <Users className="h-4 w-4 mr-2" />
                Đội ngũ chuyên gia
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Những người kiến tạo
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Đội ngũ chuyên gia giàu kinh nghiệm trong lĩnh vực xây dựng và công nghệ
              </p>
            </div>
          </AnimeScrollObserver>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <AnimeScrollObserver key={index} animationType="scaleIn" delay={300 + index * 200} duration={1000}>
                <Card className="text-center p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/50">
                  <CardContent className="p-0">
                    <Avatar className="w-24 h-24 mx-auto mb-6">
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-4">{member.position}</p>
                    <p className="text-slate-600 mb-6 leading-relaxed">{member.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="bg-blue-100 text-blue-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimeScrollObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="container mx-auto px-4">
          <AnimeScrollObserver animationType="fadeInUp" delay={200}>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-purple-300 text-purple-700">
                <Trophy className="h-4 w-4 mr-2" />
                Thành tựu
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Những con số ấn tượng
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Kết quả đạt được trong quá trình phát triển và phục vụ cộng đồng
              </p>
            </div>
          </AnimeScrollObserver>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => (
              <AnimeScrollObserver key={index} animationType="bounceIn" delay={400 + index * 150} duration={1200}>
                <div className="text-center group">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {achievement.number}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{achievement.label}</h3>
                  <p className="text-slate-600">{achievement.description}</p>
                </div>
              </AnimeScrollObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimeScrollObserver animationType="fadeInUp" delay={200}>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-green-300 text-green-700">
                <Mail className="h-4 w-4 mr-2" />
                Liên hệ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Hãy kết nối với chúng tôi
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Sẵn sàng hỗ trợ và tư vấn mọi thắc mắc của bạn
              </p>
            </div>
          </AnimeScrollObserver>

          <div className="max-w-4xl mx-auto">
            <AnimeScrollObserver animationType="fadeInUp" delay={400} duration={1000}>
              <Card className="p-12 border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/50">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">info@namlongcenter.com</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Điện thoại</div>
                      <div className="text-sm text-muted-foreground">+84 123 456 789</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Địa chỉ</div>
                      <div className="text-sm text-muted-foreground">TP.HCM, Việt Nam</div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex justify-center gap-4 pt-6">
                  <Button variant="outline" size="lg" className="w-12 h-12 p-0">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="w-12 h-12 p-0">
                    <Youtube className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="w-12 h-12 p-0">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </div>

                <div className="pt-8">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Liên hệ ngay
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </AnimeScrollObserver>
          </div>
        </div>
      </section>

      {/* Next Step - Go to Homepage */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <AnimeScrollObserver animationType="fadeInUp" delay={100} duration={1000}>
            <div className="mb-8">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-blue-300 text-blue-700">
                <Home className="h-4 w-4 mr-2" />
                Bước tiếp theo
              </Badge>
            </div>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="scaleIn" delay={200} duration={1200}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Khám phá trang chủ
            </h2>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="fadeInUp" delay={300} duration={1000}>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Sau khi tìm hiểu về chúng tôi, hãy khám phá trang chủ để xem các khóa học, 
              sản phẩm và tài nguyên mới nhất
            </p>
          </AnimeScrollObserver>

          <AnimeScrollObserver animationType="fadeInUp" delay={400} duration={1000}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                asChild
              >
                <Link to="/trang-chu">
                  <Home className="mr-3 h-6 w-6" />
                  Đến trang chủ
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-slate-300 hover:border-blue-500 px-8 py-4 text-lg transition-all duration-300"
                asChild
              >
                <Link to="/khoa-hoc">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Xem khóa học
                </Link>
              </Button>
            </div>
          </AnimeScrollObserver>
        </div>
      </section>
    </div>
  );
}
