'use client';

import React from 'react';
import { Bot, X } from 'lucide-react';

type ChatHeaderProps = {
  onClose: () => void;
};

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Bot className="h-5 w-5" />
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"
          title="Đang hoạt động"
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-foreground">Trợ lý</span>
        <p className="text-xs text-muted-foreground">Đang hoạt động</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Đóng trợ lý"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
