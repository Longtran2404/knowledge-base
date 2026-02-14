'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 28,
          }}
        >
          ⚠️
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
          Đã xảy ra lỗi
        </h1>
        <p style={{ color: '#4b5563', marginBottom: 24 }}>
          Xin lỗi, đã có lỗi khi tải trang. Vui lòng thử lại hoặc về trang chủ.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Thử lại
          </button>
          <Link
            href="/"
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              color: '#374151',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
