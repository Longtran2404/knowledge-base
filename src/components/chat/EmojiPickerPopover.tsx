'use client';

import React, { useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤗', '🤔',
  '👍', '👎', '👏', '🙌', '👋', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💕', '💖', '💗', '💘', '💝', '✨',
  '🔥', '⭐', '🌟', '💫', '✅', '❌', '❗', '❓', '💯', '🎉', '🎊', '🙏', '😢', '😭', '😤', '😡', '🤬', '😱', '😨', '😰',
];

type EmojiPickerPopoverProps = {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
};

export function EmojiPickerPopover({ onSelect, disabled }: EmojiPickerPopoverProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          aria-label="Chọn emoji"
        >
          <Smile className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2" side="top">
        <div className="grid max-h-[200px] grid-cols-8 gap-1 overflow-y-auto">
          {EMOJI_LIST.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className="rounded p-1.5 text-lg hover:bg-muted focus:bg-muted focus:outline-none"
              onClick={() => {
                onSelect(emoji);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
