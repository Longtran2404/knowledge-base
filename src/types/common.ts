/**
 * Common TypeScript interfaces and types
 * Replaces 'any' types with proper type definitions
 */

// Standard error interface for consistent error handling
export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Helper function to create typed error from unknown error
export const createAppError = (error: unknown): AppError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      status: (error as any).status,
      details: error
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String((error as any).message),
      code: (error as any).code,
      status: (error as any).status,
      details: error
    };
  }

  return { message: 'Unknown error occurred', details: error };
};

// Component props that accept React components
export interface ComponentWithIcon {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Generic API response interface
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: AppError;
  success: boolean;
  message?: string;
}

// Common form field props
export interface SelectOption {
  label: string;
  value: string;
}

// File upload related types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: FileUploadProgress;
}