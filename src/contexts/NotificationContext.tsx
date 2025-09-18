import React, { createContext, useContext, ReactNode } from 'react';
import { enhancedToast } from '../components/ui/enhanced-toast';

interface NotificationContextType {
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showCustom: (title: string, description?: string, options?: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const showSuccess = (title: string, description?: string) => {
    enhancedToast.success(title, description);
  };

  const showError = (title: string, description?: string) => {
    enhancedToast.error(title, description);
  };

  const showWarning = (title: string, description?: string) => {
    enhancedToast.warning(title, description);
  };

  const showInfo = (title: string, description?: string) => {
    enhancedToast.info(title, description);
  };

  const showCustom = (title: string, description?: string, options?: any) => {
    const customOptions = {
      duration: 6000,
      action: options?.action,
      ...options
    };

    switch (options?.type || 'info') {
      case 'success':
        enhancedToast.success(title, description, customOptions);
        break;
      case 'error':
        enhancedToast.error(title, description, customOptions);
        break;
      case 'warning':
        enhancedToast.warning(title, description, customOptions);
        break;
      default:
        enhancedToast.info(title, description, customOptions);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCustom,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Global notification functions for convenience
export const notification = {
  success: (title: string, description?: string) => {
    enhancedToast.success(title, description);
  },
  error: (title: string, description?: string) => {
    enhancedToast.error(title, description);
  },
  warning: (title: string, description?: string) => {
    enhancedToast.warning(title, description);
  },
  info: (title: string, description?: string) => {
    enhancedToast.info(title, description);
  },
  custom: (title: string, description?: string, options?: any) => {
    const customOptions = {
      duration: 6000,
      action: options?.action,
      ...options
    };

    switch (options?.type || 'info') {
      case 'success':
        enhancedToast.success(title, description, customOptions);
        break;
      case 'error':
        enhancedToast.error(title, description, customOptions);
        break;
      case 'warning':
        enhancedToast.warning(title, description, customOptions);
        break;
      default:
        enhancedToast.info(title, description, customOptions);
    }
  }
};