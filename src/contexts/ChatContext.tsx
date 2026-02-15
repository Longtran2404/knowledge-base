'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type ChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value: ChatContextValue = { open, setOpen, toggle };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

export function useChatOptional() {
  return useContext(ChatContext);
}
