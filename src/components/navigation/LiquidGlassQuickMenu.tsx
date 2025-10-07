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
      onClick: () => window.open('mailto:contact@namlongcenter.com', '_self'),
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
                className={`group relative flex items-center gap-3 p-4 rounded-2xl ${action.bgColor} backdrop-blur-md border border-white/30 shadow-soft hover:shadow-medium transition-all duration-300 min-w-52 hover:scale-105 active:scale-95`}
              >
                <div className={`p-3 rounded-xl bg-white/40 backdrop-blur-sm ${action.color} shadow-soft`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">
                  {action.label}
                </span>

                {/* Enhanced glass reflection effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                  whileHover={{ scale: 1.1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />

                {/* Subtle glow effect */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(45deg, ${action.color.replace('text-', '').replace('-700', '-200')}, transparent)`,
                    filter: 'blur(8px)',
                    zIndex: -1,
                  }}
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: isOpen ? 0 : 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full shadow-strong hover:shadow-glow transition-all duration-300 overflow-hidden group"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Animated Icons with enhanced transitions */}
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.3
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Plus className="w-7 h-7 text-white" />
          </motion.div>
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <X className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Enhanced liquid ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 via-white/20 to-transparent"
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          whileHover={{ scale: 1.3, opacity: 1, rotate: 90 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Pulse animation with improved timing */}
        {!isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-300/60"
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-blue-200/40"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Subtle inner glow */}
        <motion.div
          className="absolute inset-1 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          style={{
            background: isOpen
              ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
        />
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