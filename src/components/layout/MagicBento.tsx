/**
 * Magic Bento Grid Layout
 * Responsive bento box grid layout - inspired by reactbits.dev
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FluidGlass } from '../ui/fluid-glass';

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  span?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface MagicBentoProps {
  items: BentoItem[];
  className?: string;
}

export function MagicBento({ items, className = '' }: MagicBentoProps) {
  const getSpanClass = (span?: string) => {
    switch (span) {
      case 'sm':
        return 'col-span-1 row-span-1';
      case 'md':
        return 'col-span-1 md:col-span-2 row-span-1';
      case 'lg':
        return 'col-span-1 md:col-span-2 row-span-2';
      case 'xl':
        return 'col-span-1 md:col-span-3 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 auto-rows-[200px] gap-4 ${className}`}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className={getSpanClass(item.span)}
        >
          <BentoCard {...item} />
        </motion.div>
      ))}
    </div>
  );
}

function BentoCard({ title, description, icon, image, className = '' }: BentoItem) {
  return (
    <FluidGlass
      variant="dark"
      blur="lg"
      className={`group h-full p-6 flex flex-col justify-between overflow-hidden relative hover:border-white/20 transition-all cursor-pointer ${className}`}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="text-blue-400 mb-4"
          >
            {icon}
          </motion.div>
        )}

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover Gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

      {/* Hover Border Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.2) 50%, rgba(236,72,153,0.2) 100%)',
          filter: 'blur(20px)',
          transform: 'translateZ(-10px)',
        }}
      />
    </FluidGlass>
  );
}

// Preset Bento Layouts

export function BentoHero() {
  const items: BentoItem[] = [
    {
      id: '1',
      title: 'AI-Powered Learning',
      description: 'Học tập thông minh với AI đề xuất khóa học phù hợp với nhu cầu và trình độ của bạn',
      icon: (
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      span: 'lg',
      className: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
    },
    {
      id: '2',
      title: '50K+ Students',
      description: 'Cộng đồng học viên đông đảo và năng động',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      span: 'sm',
    },
    {
      id: '3',
      title: '500+ Courses',
      description: 'Đa dạng khóa học chất lượng cao',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      span: 'sm',
    },
    {
      id: '4',
      title: 'Real-time Collaboration',
      description: 'Cộng tác trực tuyến với giảng viên và bạn học, chia sẻ kiến thức cùng nhau',
      icon: (
        <svg className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      span: 'md',
      className: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    },
    {
      id: '5',
      title: 'Enterprise Security',
      description: 'Bảo mật cấp doanh nghiệp cho dữ liệu của bạn',
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      span: 'sm',
    },
    {
      id: '6',
      title: 'Certified Programs',
      description: 'Chứng chỉ được công nhận quốc tế, giá trị trên thị trường lao động',
      icon: (
        <svg className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      span: 'md',
      className: 'bg-gradient-to-br from-pink-500/10 to-orange-500/10',
    },
  ];

  return <MagicBento items={items} />;
}
