/**
 * Unified Theme Configuration
 * Light mode liquid glass theme for Knowledge Base
 */

export const theme = {
  // Colors
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Liquid Glass Effects
  glass: {
    light: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.90) 100%)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(229, 231, 235, 0.4)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    },
    medium: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(248,250,252,0.85) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(229, 231, 235, 0.3)',
      shadow: '0 8px 24px 0 rgba(31, 38, 135, 0.08)',
    },
    card: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      shadow: '0 4px 16px 0 rgba(31, 38, 135, 0.06)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // Animations
  animations: {
    spring: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
    smooth: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
    gentle: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export type Theme = typeof theme;