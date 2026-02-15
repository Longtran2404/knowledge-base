'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { ImagePlus, Send } from 'lucide-react';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import type { MessageAttachment } from './types';

const MIN_ROWS = 1;
const MAX_ROWS = 5;
const LINE_HEIGHT = 24;

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  imagePreview: MessageAttachment[] | null;
  onImageSelect: (files: FileList | null) => void;
  onImageRemove: () => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  imagePreview,
  onImageSelect,
  onImageRemove,
  disabled,
  inputRef: externalRef,
  placeholder = 'Nhập tin nhắn...',
}: ChatInputProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? localRef;

  const adjustHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineCount = Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor(el.scrollHeight / LINE_HEIGHT)));
    el.style.height = `${lineCount * LINE_HEIGHT}px`;
  }, [ref]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const el = ref.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + emoji + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length;
        el.focus();
      });
    } else {
      onChange(value + emoji);
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      onImageSelect(files);
    };
    input.click();
  };

  return (
    <div className="shrink-0 border-t border-border p-3">
      {imagePreview && imagePreview.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {imagePreview.map((att, i) => (
            <div key={i} className="relative inline-block">
              <img
                src={att.url}
                alt=""
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs hover:opacity-90"
                aria-label="Xoá ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-end gap-1 rounded-xl border border-input bg-background pr-1 focus-within:ring-2 focus-within:ring-ring"
      >
        <EmojiPickerPopover onSelect={handleEmojiSelect} disabled={disabled} />
        <button
          type="button"
          onClick={handleImageClick}
          disabled={disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          aria-label="Đính kèm ảnh"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={MIN_ROWS}
          disabled={disabled}
          className="min-h-[44px] flex-1 resize-none border-0 bg-transparent py-3 pl-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
          aria-label="Tin nhắn"
        />
        <button
          type="submit"
          disabled={disabled || (!value.trim() && (!imagePreview || imagePreview.length === 0))}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:enabled:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Gửi"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
