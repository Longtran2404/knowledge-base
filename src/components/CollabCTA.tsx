
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Briefcase, Heart, Star } from 'lucide-react';

const CollabCTA = () => {
  const collaborationTypes = [
    {
      icon: BookOpen,
      title: 'Chia sẻ Khóa học',
      description: 'Bạn có chuyên môn và muốn chia sẻ kiến thức?',
      benefits: ['Hoa hồng cạnh tranh', 'Hỗ trợ marketing', 'Xây dựng thương hiệu'],
      color: 'blue'
    },
    {
      icon: Briefcase,
      title: 'Ra mắt Sản phẩm',
      description: 'Có sản phẩm chất lượng cho ngành xây dựng?',
      benefits: ['Tiếp cận khách hàng', 'Tăng doanh số', 'Đồng hành marketing'],
      color: 'green'
    },
    {
      icon: Users,
      title: 'Đối tác Giáo dục',
      description: 'Trường học, trung tâm đào tạo muốn hợp tác?',
      benefits: ['Chương trình liên kết', 'Chia sẻ tài nguyên', 'Cùng phát triển'],
      color: 'purple'
    }
  ];

  const stats = [
    { number: '500+', label: 'Đối tác', icon: Users },
    { number: '50K+', label: 'Học viên', icon: BookOpen },
    { number: '98%', label: 'Hài lòng', icon: Heart },
    { number: '4.9★', label: 'Đánh giá', icon: Star }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        icon: 'text-green-500',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Cùng Xây Dựng
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Tương Lai
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Tham gia cùng Nam Long Center để tạo ra những giá trị bền vững cho ngành xây dựng Việt Nam
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Collaboration Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {collaborationTypes.map((type, index) => {
            const IconComponent = type.icon;
            const colorClasses = getColorClasses(type.color);
            
            return (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className={`w-8 h-8 ${colorClasses.icon}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-blue-100">{type.description}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-blue-100 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button className={`w-full ${colorClasses.button} group-hover:scale-105 transition-transform`}>
                  Tìm hiểu thêm
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Main CTA */}
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sẵn Sàng Bắt Đầu Hành Trình Hợp Tác?
            </h3>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Dù bạn là giảng viên, chuyên gia, nhà phát triển sản phẩm hay đại diện trường học, 
              chúng tôi luôn chào đón sự hợp tác để cùng nhau phát triển ngành xây dựng.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all">
                Liên hệ hợp tác ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-full transition-all"
              >
                Tải catalog đối tác
              </Button>
            </div>

            {/* Contact Info */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-white font-semibold mb-1">Email</div>
                  <div className="text-blue-200">partnership@namlongcenter.vn</div>
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Hotline</div>
                  <div className="text-blue-200">1900 1234</div>
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Thời gian làm việc</div>
                  <div className="text-blue-200">T2-T6, 8:00-17:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollabCTA;