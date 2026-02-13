/**
 * Theme Configuration - tham chiếu design system từ CSS (src/index.css)
 * Màu sắc: dùng biến :root (--primary, --muted, ...). Không định nghĩa trùng palette ở đây.
 */

export const theme = {
  // Chỉ semantic tokens (dùng khi cần giá trị trong JS). Màu gốc nằm trong index.css
  colors: {
    primary: 'hsl(var(--primary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    error: 'hsl(var(--destructive))',
    info: 'hsl(var(--info))',
  },

  // Glass effects - dùng border/background từ CSS vars khi áp inline style
  glass: {
    light: {
      backdropFilter: 'blur(24px)',
      shadow: 'var(--shadow-soft)',
    },
    medium: {
      backdropFilter: 'blur(20px)',
      shadow: 'var(--shadow-medium)',
    },
    card: {
      backdropFilter: 'blur(16px)',
      shadow: 'var(--shadow-soft)',
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