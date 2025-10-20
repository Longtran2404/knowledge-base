/**
 * Toast Hook
 * Simple wrapper around sonner toast for consistent API
 */

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 3000 } = options;

    const message = title || description || '';
    const fullMessage = title && description ? `${title}\n${description}` : message;

    switch (variant) {
      case 'destructive':
        sonnerToast.error(fullMessage, { duration });
        break;
      case 'success':
        sonnerToast.success(fullMessage, { duration });
        break;
      default:
        sonnerToast(fullMessage, { duration });
        break;
    }
  };

  return { toast };
}

export default useToast;
