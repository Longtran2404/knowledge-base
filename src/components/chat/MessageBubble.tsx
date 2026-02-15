'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, CheckCheck, Copy, MoreHorizontal, Trash2, User, Undo2 } from 'lucide-react';
import type { Message, MessageStatus } from './types';
import { formatMessageTime } from './utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const RECALL_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

type MessageBubbleProps = {
  message: Message;
  onRecall?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (message: Message) => void;
};

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sending') return null;
  if (status === 'sent') return <Check className="h-3.5 w-3.5 opacity-80" />;
  if (status === 'delivered' || status === 'seen')
    return <CheckCheck className={`h-3.5 w-3.5 ${status === 'seen' ? 'text-primary' : 'opacity-80'}`} />;
  return null;
}

const LONG_PRESS_MS = 500;

export function MessageBubble({ message, onRecall, onDelete, onCopy }: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUser = message.role === 'user';
  const canRecall = isUser && !message.recalled && !message.deleted && Date.now() - message.sentAt < RECALL_LIMIT_MS;

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    clearLongPress();
    longPressTimer.current = setTimeout(() => setMenuOpen(true), LONG_PRESS_MS);
  }, [clearLongPress]);

  const handleTouchEnd = useCallback(() => clearLongPress(), [clearLongPress]);

  const handleCopy = () => {
    const text = message.content || (message.attachments?.length ? '[Ảnh]' : '');
    if (text && onCopy) {
      onCopy(message);
    } else if (text) {
      navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép'));
    }
    setMenuOpen(false);
  };

  const handleRecall = () => {
    if (canRecall && onRecall) onRecall(message.id);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(message.id);
    setMenuOpen(false);
  };

  if (message.deleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm italic text-muted-foreground">
          Tin nhắn đã bị xoá
        </div>
      </motion.div>
    );
  }

  if (message.recalled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm italic text-muted-foreground">
          Bạn đã thu hồi tin nhắn
        </div>
      </motion.div>
    );
  }

  const bubble = (
    <div
      className={`flex w-fit max-w-[85%] flex-col gap-0.5 rounded-2xl px-4 py-2.5 text-sm ${
        isUser ? 'bg-primary text-primary-foreground' : 'border border-border bg-muted/50 text-foreground'
      }`}
    >
      {message.attachments?.length ? (
        <div className="flex flex-col gap-2">
          {message.attachments.map((att, i) =>
            att.type === 'image' ? (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-lg"
              >
                <img src={att.url} alt="" className="max-h-48 max-w-full object-cover" />
              </a>
            ) : null
          )}
        </div>
      ) : null}
      {message.content ? (
        <span className="whitespace-pre-wrap break-words">{message.content}</span>
      ) : null}
      <div className={`mt-1 flex flex-nowrap items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <span className="shrink-0 text-[10px] opacity-70 whitespace-nowrap">{formatMessageTime(message.sentAt)}</span>
        {isUser && <StatusIcon status={message.status} />}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className={`w-fit max-w-[85%] cursor-context-menu rounded-xl focus:outline-none focus:ring-2 focus:ring-ring ${isUser ? 'self-end' : 'self-start'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
          >
            {bubble}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isUser ? 'end' : 'start'} className="min-w-[140px]">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Sao chép
          </DropdownMenuItem>
          {isUser && (
            <>
              {canRecall && (
                <DropdownMenuItem onClick={handleRecall}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Thu hồi
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xoá
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
