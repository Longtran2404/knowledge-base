'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { ROUTES } from 'config/routes';
import type { Message, MessageAttachment } from './types';
import { createMessage } from './types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { toast } from 'sonner';

const QUICK_REPLIES = [
  { label: 'Khóa học', keyword: 'khóa học', path: ROUTES.KHOA_HOC },
  { label: 'Liên hệ', keyword: 'liên hệ', path: ROUTES.CONTACT },
  { label: 'FAQ', keyword: 'faq', path: ROUTES.FAQ },
];

function getPageLabel(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/' || p === ROUTES.TRANG_CHU) return 'Trang chủ';
  if (p === ROUTES.GIOI_THIEU) return 'Giới thiệu';
  if (p === ROUTES.KHOA_HOC) return 'Khóa học';
  if (p === ROUTES.CONTACT) return 'Liên hệ';
  if (p === ROUTES.FAQ) return 'FAQ';
  if (p === ROUTES.CHO_MUA_BAN) return 'Chợ mua bán';
  if (p === ROUTES.TAI_LEN) return 'Tải lên';
  if (p === ROUTES.SUPPORT) return 'Hỗ trợ';
  if (p === ROUTES.SAN_PHAM) return 'Sản phẩm';
  if (p === ROUTES.BAI_VIET) return 'Bài viết';
  if (p === ROUTES.TAI_NGUYEN) return 'Tài nguyên';
  if (p === ROUTES.HOP_TAC) return 'Hợp tác';
  if (p === ROUTES.WORKFLOWS) return 'Workflows';
  return 'Trang này';
}

function getWelcomeMessage(currentPageLabel: string): string {
  return `Chào bạn, bạn đang ở trang ${currentPageLabel}. Tôi có thể giúp gì liên quan hoặc điều hướng nhanh: Khóa học, Liên hệ, FAQ.`;
}

function getReply(userText: string, pathname?: string): string {
  const t = userText.toLowerCase().trim();
  const pageLabel = pathname ? getPageLabel(pathname) : '';

  if (!t) return 'Cảm ơn bạn đã gửi ảnh! Bạn cần hỗ trợ gì thêm?';
  if (t.includes('khóa học') || t.includes('khoa hoc')) {
    return 'Bạn có thể xem danh sách khóa học tại trang Khóa học. Tôi đã gợi ý đường dẫn cho bạn.';
  }
  if (t.includes('liên hệ') || t.includes('lien he') || t.includes('contact')) {
    return 'Bạn có thể liên hệ qua trang Liên hệ để được hỗ trợ. Tôi đã gợi ý đường dẫn.';
  }
  if (t.includes('faq') || t.includes('câu hỏi') || t.includes('hoi dap')) {
    return 'Các câu hỏi thường gặp có tại trang FAQ. Tôi đã gợi ý đường dẫn.';
  }
  if (t.includes('chào') || t.includes('hello') || t.includes('xin chào')) {
    if (pageLabel) return `Xin chào! Bạn đang ở trang ${pageLabel}. Bạn cần hỗ trợ gì? Có thể chọn nhanh: Khóa học, Liên hệ, FAQ.`;
    return 'Xin chào! Bạn cần hỗ trợ gì? Bạn có thể chọn nhanh: Khóa học, Liên hệ, hoặc FAQ.';
  }
  if (t.includes('giúp') || t.includes('có gì') || t.includes('support') || t.length <= 3) {
    if (pageLabel) return `Bạn đang ở trang ${pageLabel}. Bạn có thể hỏi về Khóa học, Liên hệ, FAQ hoặc chọn gợi ý nhanh bên dưới.`;
    return 'Bạn có thể hỏi về Khóa học, Liên hệ hoặc FAQ. Hoặc chọn một gợi ý bên dưới.';
  }
  if (pageLabel) return `Về trang ${pageLabel}: Bạn có thể hỏi Khóa học, Liên hệ, FAQ hoặc chọn gợi ý nhanh bên dưới.`;
  return 'Bạn có thể hỏi về Khóa học, Liên hệ hoặc FAQ. Hoặc chọn một gợi ý bên dưới.';
}

function getPathForReply(userText: string): string | null {
  const t = userText.toLowerCase().trim();
  if (t.includes('khóa học') || t.includes('khoa hoc')) return ROUTES.KHOA_HOC;
  if (t.includes('liên hệ') || t.includes('lien he') || t.includes('contact')) return ROUTES.CONTACT;
  if (t.includes('faq') || t.includes('câu hỏi') || t.includes('hoi dap')) return ROUTES.FAQ;
  return null;
}

function fileListToAttachments(files: FileList | null): MessageAttachment[] {
  if (!files?.length) return [];
  const arr: MessageAttachment[] = [];
  const len = Math.min(files.length, 4);
  for (let i = 0; i < len; i++) {
    const f = files[i];
    if (!f.type.startsWith('image/')) continue;
    arr.push({ type: 'image', url: URL.createObjectURL(f) });
  }
  return arr;
}

export function ChatWidget() {
  const { open, setOpen } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<MessageAttachment[] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      const currentPageLabel = getPageLabel(location.pathname);
      const welcomeText = getWelcomeMessage(currentPageLabel);
      const welcome = createMessage('assistant', welcomeText, { status: 'delivered' });
      setMessages([welcome]);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === welcome.id ? { ...m, status: 'seen' as const, seenAt: Date.now() } : m))
        );
      }, 800);
    }
  }, [open, messages.length, location.pathname]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const updateMessageStatus = useCallback((id: string, status: Message['status'], seenAt?: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, ...(seenAt != null ? { seenAt } : {}) } : m))
    );
  }, []);

  const send = useCallback(
    (text: string, attachments?: MessageAttachment[]) => {
      const trimmed = text.trim();
      if (!trimmed && (!attachments || attachments.length === 0)) return;

      const userMsg = createMessage('user', trimmed || '', {
        attachments: attachments?.length ? attachments : undefined,
        status: 'sending',
      });
      setInput('');
      setImagePreview(null);
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => updateMessageStatus(userMsg.id, 'sent'), 100);

      setIsTyping(true);
      const path = getPathForReply(trimmed);
      const replyText = getReply(trimmed, location.pathname);

      setTimeout(() => {
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: 'delivered' as const } : m
          );
          return next;
        });
        const botMsg = createMessage('assistant', replyText, { status: 'delivered' });
        setMessages((prev) => [...prev, botMsg]);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === userMsg.id) return { ...m, status: 'seen' as const, seenAt: Date.now() };
              if (m.id === botMsg.id) return { ...m, status: 'seen' as const, seenAt: Date.now() };
              return m;
            })
          );
        }, 600);

        setIsTyping(false);
        if (path) {
          setOpen(false);
          navigate(path);
        }
      }, 600);
    },
    [setOpen, navigate, updateMessageStatus, location.pathname]
  );

  const handleSubmit = useCallback(() => {
    const toSend = imagePreview?.length ? imagePreview : undefined;
    send(input, toSend);
  }, [input, imagePreview, send]);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const atts = fileListToAttachments(files);
    if (atts.length) setImagePreview((prev) => [...(prev ?? []), ...atts]);
  }, []);

  const handleImageRemove = useCallback(() => {
    setImagePreview(null);
  }, []);

  const handleRecall = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, recalled: true } : m)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, deleted: true } : m)));
  }, []);

  const handleCopy = useCallback((message: Message) => {
    const text = message.content || (message.attachments?.length ? '[Ảnh]' : '');
    if (text) {
      navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép'));
    }
  }, []);

  const handleQuickReply = (label: string, path: string) => {
    send(label);
    setOpen(false);
    navigate(path);
  };

  const showQuickReplies = messages.length <= 1 && !isTyping;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-black/20"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-label="Trợ lý chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[111] flex h-full max-h-screen w-full max-w-md flex-col rounded-l-2xl border border-border bg-card shadow-2xl"
          >
            <ChatHeader onClose={() => setOpen(false)} />

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3"
              style={{ minHeight: 0 }}
            >
              <MessageList
                messages={messages}
                onRecall={handleRecall}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex gap-1 rounded-2xl border border-border bg-muted/50 px-4 py-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {showQuickReplies && (
              <div className="shrink-0 border-t border-border px-4 py-2">
                <p className="mb-2 text-xs text-muted-foreground">Gợi ý nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map(({ label, path }) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => handleQuickReply(label, path)}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              imagePreview={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              disabled={isTyping}
              inputRef={inputRef}
              placeholder="Nhập tin nhắn..."
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
