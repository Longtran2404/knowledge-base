export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen';

export type MessageAttachment = {
  type: 'image';
  url: string; // data URL (base64) or blob URL
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  attachments?: MessageAttachment[];
  sentAt: number;
  status: MessageStatus;
  recalled?: boolean;
  deleted?: boolean;
  seenAt?: number;
};

export function createMessageId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createMessage(
  role: Message['role'],
  content: string,
  options?: { attachments?: MessageAttachment[]; status?: MessageStatus }
): Message {
  return {
    id: createMessageId(),
    role,
    content,
    type: options?.attachments?.length ? 'image' : 'text',
    attachments: options?.attachments,
    sentAt: Date.now(),
    status: options?.status ?? (role === 'user' ? 'sending' : 'delivered'),
    recalled: false,
    deleted: false,
  };
}
