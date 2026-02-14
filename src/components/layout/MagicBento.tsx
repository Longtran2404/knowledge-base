/**
 * Magic Bento Grid Layout - Thiết kế mới, đẹp, thân thiện
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  Lightbulb,
  Users,
  BookOpen,
  MessageCircle,
  Shield,
  Award,
} from 'lucide-react';

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  span?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'feature' | 'stat' | 'highlight';
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
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-[minmax(180px,auto)]',
        className
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className={getSpanClass(item.span)}
        >
          <BentoCard {...item} index={index} />
        </motion.div>
      ))}
    </div>
  );
}

function BentoCard({ title, description, icon, span, variant = 'feature', index }: BentoItem & { index: number }) {
  const isStat = variant === 'stat' || span === 'sm';
  const isHighlight = variant === 'highlight' || span === 'lg';

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group h-full rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative',
        'border border-border/60 shadow-soft hover:shadow-medium transition-all duration-300',
        isHighlight && 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        !isHighlight && !isStat && 'bg-gradient-to-br from-primary/5 via-transparent to-accent/5',
        isStat && 'bg-card/80 backdrop-blur-sm'
      )}
    >
      {/* Decorative gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
          'bg-gradient-to-br from-primary/5 via-transparent to-accent/5'
        )}
      />

      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'inline-flex p-3 rounded-xl mb-4 transition-colors duration-300',
              isHighlight
                ? 'bg-primary/20 text-primary group-hover:bg-primary/30'
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            )}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h3
          className={cn(
            'font-bold text-foreground mb-2 transition-colors duration-200 group-hover:text-primary',
            isHighlight ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function BentoHero() {
  const items: BentoItem[] = [
    {
      id: '1',
      title: 'AI-Powered Learning',
      description: 'Học tập thông minh với AI đề xuất khóa học phù hợp với nhu cầu và trình độ của bạn',
      icon: <Lightbulb className="h-6 w-6 md:h-7 md:w-7" />,
      span: 'lg',
      variant: 'highlight',
    },
    {
      id: '2',
      title: '50K+ Students',
      description: 'Cộng đồng học viên đông đảo và năng động',
      icon: <Users className="h-6 w-6" />,
      span: 'sm',
      variant: 'stat',
    },
    {
      id: '3',
      title: '500+ Courses',
      description: 'Đa dạng khóa học chất lượng cao',
      icon: <BookOpen className="h-6 w-6" />,
      span: 'sm',
      variant: 'stat',
    },
    {
      id: '4',
      title: 'Real-time Collaboration',
      description: 'Cộng tác trực tuyến với giảng viên và bạn học, chia sẻ kiến thức cùng nhau',
      icon: <MessageCircle className="h-6 w-6" />,
      span: 'md',
      variant: 'feature',
    },
    {
      id: '5',
      title: 'Enterprise Security',
      description: 'Bảo mật cấp doanh nghiệp cho dữ liệu của bạn',
      icon: <Shield className="h-6 w-6" />,
      span: 'sm',
      variant: 'stat',
    },
    {
      id: '6',
      title: 'Certified Programs',
      description: 'Chứng chỉ được công nhận quốc tế, giá trị trên thị trường lao động',
      icon: <Award className="h-6 w-6" />,
      span: 'md',
      variant: 'feature',
    },
  ];

  return <MagicBento items={items} />;
}
