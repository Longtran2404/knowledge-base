
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, BookOpen, Package, FileText, Newspaper, Handshake, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimeScrollEffects } from '@/components/animations/anime-scroll-effects';

interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'about',
    title: 'Giới thiệu',
    path: '/',
    icon: <Info className="h-5 w-5" />,
    description: 'Về Nam Long Center'
  },
  {
    id: 'home',
    title: 'Trang chủ',
    path: '/trang-chu',
    icon: <Home className="h-5 w-5" />,
    description: 'Dịch vụ & Liên hệ'
  },
  {
    id: 'courses',
    title: 'Khóa học',
    path: '/khoa-hoc',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Học BIM Automation',
    badge: 'Hot',
    badgeColor: 'bg-red-500'
  },
  {
    id: 'products',
    title: 'Sản phẩm',
    path: '/san-pham',
    icon: <Package className="h-5 w-5" />,
    description: 'Công cụ thiết kế',
    badge: 'New',
    badgeColor: 'bg-green-500'
  },
  {
    id: 'resources',
    title: 'Tài nguyên',
    path: '/tai-nguyen',
    icon: <FileText className="h-5 w-5" />,
    description: 'Tài liệu miễn phí'
  },
  {
    id: 'blog',
    title: 'Blog',
    path: '/blog',
    icon: <Newspaper className="h-5 w-5" />,
    description: 'Tin tức & hướng dẫn'
  },
  {
    id: 'collaboration',
    title: 'Hợp tác',
    path: '/hop-tac',
    icon: <Handshake className="h-5 w-5" />,
    description: 'Cơ hội hợp tác'
  }
];

export function PageNavigation() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsVisible(scrollTop > 200);
      
      // Update scroll progress bar
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / scrollHeight, 1);
        progressBar.style.transform = `scaleX(${progress})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Fixed Navigation Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NL</span>
                  </div>
                  <span className="font-semibold text-gray-900">Nam Long Center</span>
                </Link>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge className={`text-xs ${item.badgeColor} text-white`}>
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>

              <Button
                onClick={scrollToTop}
                size="sm"
                variant="outline"
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronRight className="h-4 w-4 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation Menu */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item, index) => (
              <AnimeScrollEffects
                key={item.id}
                animationType="fadeInLeft"
                delay={index * 100}
                className="group"
              >
                <Link
                  to={item.path}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    pathname === item.path
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 hover:scale-105'
                  }`}
                  title={item.title}
                >
                  {item.icon}
                </Link>
                
                {/* Tooltip */}
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                    {item.title}
                    <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                  </div>
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              </AnimeScrollEffects>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left transition-transform duration-300"
           id="scroll-progress"
      />
    </>
  );
}
