'use client';

import React from 'react';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { formatDateGroup } from './utils';

type MessageListProps = {
  messages: Message[];
  onRecall: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (message: Message) => void;
};

function groupMessagesByDate(messages: Message[]): { dateLabel: string; messages: Message[] }[] {
  const groups: { dateLabel: string; messages: Message[] }[] = [];
  let currentLabel = '';
  let currentGroup: Message[] = [];

  for (const m of messages) {
    const label = formatDateGroup(m.sentAt);
    if (label !== currentLabel) {
      if (currentGroup.length) {
        groups.push({ dateLabel: currentLabel, messages: currentGroup });
      }
      currentLabel = label;
      currentGroup = [m];
    } else {
      currentGroup.push(m);
    }
  }
  if (currentGroup.length) {
    groups.push({ dateLabel: currentLabel, messages: currentGroup });
  }
  return groups;
}

export function MessageList({ messages, onRecall, onDelete, onCopy }: MessageListProps) {
  const groups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ dateLabel, messages: groupMessages }) => (
        <div key={dateLabel} className="flex flex-col gap-3">
          <div className="flex justify-center">
            <span className="rounded-full bg-muted/80 px-3 py-1 text-xs text-muted-foreground">
              {dateLabel}
            </span>
          </div>
          {groupMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRecall={onRecall}
              onDelete={onDelete}
              onCopy={onCopy}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
