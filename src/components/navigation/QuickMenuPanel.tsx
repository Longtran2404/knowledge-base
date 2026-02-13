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
  Zap,
} from 'lucide-react';
import { ROUTES } from 'config/routes';

const ITEMS: { id: string; label: string; icon: React.ReactNode; path: string }[] = [
  { id: 'home', label: 'Trang chủ', icon: <Home className="h-5 w-5" />, path: ROUTES.TRANG_CHU },
  { id: 'intro', label: 'Giới thiệu', icon: <Info className="h-5 w-5" />, path: ROUTES.GIOI_THIEU },
  { id: 'upload', label: 'Upload tài liệu', icon: <Upload className="h-5 w-5" />, path: ROUTES.TAI_LEN },
  { id: 'courses', label: 'Khóa học', icon: <BookOpen className="h-5 w-5" />, path: ROUTES.KHOA_HOC },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="h-5 w-5" />, path: ROUTES.CHO_MUA_BAN },
  { id: 'support', label: 'Hỗ trợ', icon: <HelpCircle className="h-5 w-5" />, path: ROUTES.SUPPORT },
  { id: 'faq', label: 'FAQ', icon: <MessageCircle className="h-5 w-5" />, path: ROUTES.FAQ },
  { id: 'contact', label: 'Liên hệ', icon: <Phone className="h-5 w-5" />, path: ROUTES.CONTACT },
];

export function QuickMenuPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl border border-border bg-card shadow-lg"
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
            <div
              className="border-b border-border px-4 py-2.5"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
            >
              <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Quick actions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.375rem' }}>
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="rounded-lg text-left text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    minHeight: 44,
                    width: '100%',
                  }}
                >
                  <span
                    className="shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                    style={{ width: 32, height: 32 }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md hover:opacity-95 transition-opacity"
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
      >
        {open ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
      </button>
    </div>
  );
}
