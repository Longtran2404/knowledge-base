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
  Users,
  Settings,
  HelpCircle,
  FileText,
  ShoppingBag,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { ComponentWithIcon } from '../../types/common';

interface QuickAction extends ComponentWithIcon {
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
}

export default function LiquidGlassQuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useAuth();

  const quickActions: QuickAction[] = [
    {
      icon: Upload,
      label: 'Upload tài liệu',
      href: '/tai-len',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
    },
    {
      icon: BookOpen,
      label: 'Khóa học mới',
      href: '/khoa-hoc',
      color: 'text-green-600',
      bgColor: 'bg-green-50/80',
    },
    {
      icon: ShoppingBag,
      label: 'Marketplace',
      href: '/cho-mua-ban',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
    },
    {
      icon: MessageCircle,
      label: 'Hỗ trợ',
      onClick: () => window.open('https://zalo.me/namlongcenter', '_blank'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50/80',
    },
    {
      icon: Phone,
      label: 'Liên hệ',
      onClick: () => window.open('tel:+84987654321', '_self'),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () => window.open('mailto:contact@namlongcenter.com', '_self'),
      color: 'text-red-600',
      bgColor: 'bg-red-50/80',
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
      {/* Quick Actions */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.1,
                }}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(action)}
                className={`group relative flex items-center gap-3 p-3 rounded-xl ${action.bgColor} backdrop-blur-lg border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 min-w-48`}
                style={{
                  background: `linear-gradient(135deg, ${action.bgColor.replace('/80', '/90')} 0%, ${action.bgColor.replace('/80', '/70')} 100%)`,
                }}
              >
                <div className={`p-2 rounded-lg ${action.bgColor} ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 text-sm">
                  {action.label}
                </span>

                {/* Liquid ripple effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full shadow-xl transition-all duration-300 overflow-hidden"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Animated Icons */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.div>

        {/* Liquid ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-white/30 to-white/10"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Pulse animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
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