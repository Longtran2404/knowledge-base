/**
 * Quick menu bên phải - theme trắng + xanh
 * Layout cố định ngang để tránh lỗi hiển thị dọc
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Upload,
  BookOpen,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  Phone,
  Home,
  Info,
  X,
  Plus,
  Bot,
} from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useChatOptional } from '@/contexts/ChatContext';

type MenuItem =
  | { id: string; label: string; icon: React.ReactNode; path: string; type: 'nav' }
  | { id: string; label: string; icon: React.ReactNode; type: 'chat' };

const ITEMS: MenuItem[] = [
  { id: 'home', label: 'Trang chủ', icon: <Home className="h-5 w-5" />, path: ROUTES.TRANG_CHU, type: 'nav' },
  { id: 'intro', label: 'Giới thiệu', icon: <Info className="h-5 w-5" />, path: ROUTES.GIOI_THIEU, type: 'nav' },
  { id: 'upload', label: 'Tải lên tài liệu', icon: <Upload className="h-5 w-5" />, path: ROUTES.TAI_LEN, type: 'nav' },
  { id: 'courses', label: 'Khóa học', icon: <BookOpen className="h-5 w-5" />, path: ROUTES.KHOA_HOC, type: 'nav' },
  { id: 'marketplace', label: 'Chợ mua bán', icon: <ShoppingBag className="h-5 w-5" />, path: ROUTES.CHO_MUA_BAN, type: 'nav' },
  { id: 'chatbot', label: 'Trợ lý', icon: <Bot className="h-5 w-5" />, type: 'chat' },
  { id: 'support', label: 'Hỗ trợ', icon: <HelpCircle className="h-5 w-5" />, path: ROUTES.SUPPORT, type: 'nav' },
  { id: 'faq', label: 'FAQ', icon: <MessageCircle className="h-5 w-5" />, path: ROUTES.FAQ, type: 'nav' },
  { id: 'contact', label: 'Liên hệ', icon: <Phone className="h-5 w-5" />, path: ROUTES.CONTACT, type: 'nav' },
];

export function QuickMenuPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const chatContext = useChatOptional();

  return (
    <div
      className="fixed z-[100]"
      style={{
        bottom: '2rem',
        right: '2rem',
        isolation: 'isolate',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
            style={{
              position: 'absolute',
              right: 0,
              bottom: '100%',
              marginBottom: '0.5rem',
              width: 260,
              minWidth: 260,
              maxWidth: '90vw',
              display: 'block',
              writingMode: 'horizontal-tb',
              direction: 'ltr',
            }}
          >
            <div className="h-1.5 shrink-0 bg-muted/50" aria-hidden />
            <div className="flex flex-col px-4 py-3 gap-0.5">
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    if (item.type === 'chat') {
                      chatContext?.setOpen(true);
                      setOpen(false);
                    } else {
                      navigate(item.path);
                      setOpen(false);
                    }
                  }}
                  className="flex flex-row items-center gap-3 rounded-xl text-left text-sm font-medium text-foreground min-h-[48px] w-full px-3 py-2.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset transition-colors"
                  aria-label={item.type === 'chat' ? 'Mở trợ lý' : `Đi tới ${item.label}`}
                >
                  <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate min-w-0">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        tabIndex={0}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={open ? 'Đóng menu điều hướng nhanh' : 'Mở menu điều hướng nhanh'}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {open ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
      </button>
    </div>
  );
}
