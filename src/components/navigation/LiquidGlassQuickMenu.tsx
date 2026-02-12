/**
 * Liquid Glass Quick Menu - Menu nhanh với hiệu ứng liquid glass
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Upload,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ShoppingBag,
  Phone,
  Mail,
} from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
}

export default function LiquidGlassQuickMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      icon: Upload,
      label: 'Upload tài liệu',
      href: '/tai-len',
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100/90',
    },
    {
      icon: BookOpen,
      label: 'Khóa học mới',
      href: '/khoa-hoc',
      color: 'text-emerald-700',
      bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100/90',
    },
    {
      icon: ShoppingBag,
      label: 'Marketplace',
      href: '/cho-mua-ban',
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100/90',
    },
    {
      icon: HelpCircle,
      label: 'Hỗ trợ',
      href: '/support',
      color: 'text-amber-700',
      bgColor: 'bg-gradient-to-r from-amber-50 to-amber-100/90',
    },
    {
      icon: MessageCircle,
      label: 'FAQ',
      href: '/faq',
      color: 'text-indigo-700',
      bgColor: 'bg-gradient-to-r from-indigo-50 to-indigo-100/90',
    },
    {
      icon: Phone,
      label: 'Liên hệ',
      href: '/contact',
      color: 'text-teal-700',
      bgColor: 'bg-gradient-to-r from-teal-50 to-teal-100/90',
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () => window.open('mailto:contact@knowledgebase.com', '_self'),
      color: 'text-rose-700',
      bgColor: 'bg-gradient-to-r from-rose-50 to-rose-100/90',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions - dropdown đơn giản, đủ rộng để không bị cắt chữ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-20 right-0 space-y-2"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 min-w-[220px] w-max ${action.bgColor} border border-white/30 shadow-md hover:shadow-lg transition-shadow duration-200`}
              >
                <div className={`flex-shrink-0 p-2 rounded-lg bg-white/50 ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút FAB chính - đơn giản, ít animation để giảm lag */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}