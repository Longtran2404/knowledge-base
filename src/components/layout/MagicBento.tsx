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
      description: 'Học tập thông minh với AI đề xuất khóa học phù hợp',
      span: 'lg',
      className: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
    },
    {
      id: '2',
      title: '50K+ Students',
      description: 'Cộng đồng học viên đông đảo',
      span: 'sm',
    },
    {
      id: '3',
      title: '500+ Courses',
      description: 'Đa dạng khóa học chất lượng',
      span: 'sm',
    },
    {
      id: '4',
      title: 'Real-time Collaboration',
      description: 'Cộng tác trực tuyến với giảng viên và bạn học',
      span: 'md',
      className: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    },
    {
      id: '5',
      title: 'Enterprise Security',
      description: 'Bảo mật cấp doanh nghiệp',
      span: 'sm',
    },
    {
      id: '6',
      title: 'Certified Programs',
      description: 'Chứng chỉ được công nhận quốc tế',
      span: 'md',
      className: 'bg-gradient-to-br from-pink-500/10 to-orange-500/10',
    },
  ];

  return <MagicBento items={items} />;
}
