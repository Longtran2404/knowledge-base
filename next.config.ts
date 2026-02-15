import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Giảm lỗi webpack runtime với dynamic imports (React.lazy)
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Hỗ trợ biến CRA (REACT_APP_*) trên client: map sang NEXT_PUBLIC_*
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.REACT_APP_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.REACT_APP_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.REACT_APP_APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.REACT_APP_APP_VERSION ?? process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT ?? process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID ?? process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID ?? process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS ?? process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_DEBUG: process.env.REACT_APP_ENABLE_DEBUG ?? process.env.NEXT_PUBLIC_ENABLE_DEBUG,
    NEXT_PUBLIC_ENABLE_PAYMENT_MONITORING: process.env.REACT_APP_ENABLE_PAYMENT_MONITORING ?? process.env.NEXT_PUBLIC_ENABLE_PAYMENT_MONITORING,
  },
  // Single React: package.json overrides + xóa .next rồi npm run dev giúp tránh duplicate React / TypeError "a[d] is not a function".
};

export default nextConfig;
