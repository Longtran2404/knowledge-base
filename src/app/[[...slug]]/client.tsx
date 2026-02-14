'use client';

import dynamic from 'next/dynamic';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, useState, useEffect } from 'react';

// Loading UI dùng inline styles - hiển thị ngay không phụ thuộc Tailwind
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', marginBottom: 16 }}>
          Knowledge Base
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'kb-spin 0.8s linear infinite',
          }}
        />
        <p style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>Đang tải...</p>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: '@keyframes kb-spin { to { transform: rotate(360deg); } }',
        }}
      />
    </div>
  );
}

// Dynamic import App - Next.js tự resolve default export
const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

// Fallback khi App load thất bại
function AppLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h1 style={{ fontSize: 20, color: '#111', marginBottom: 12 }}>Không thể tải ứng dụng</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Vui lòng thử lại hoặc tải trang.</p>
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export function ClientOnly() {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.message?.includes('Loading chunk') || e.message?.includes('ChunkLoadError')) {
        setLoadError(true);
      }
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (loadError) {
    return (
      <AppLoadError onRetry={() => window.location.reload()} />
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Suspense>
  );
}
