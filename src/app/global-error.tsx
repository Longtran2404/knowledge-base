'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: '#f8fafc',
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
              Xin lỗi, ứng dụng gặp lỗi. Vui lòng thử lại.
            </p>
            <button
              type="button"
              onClick={() => reset()}
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
          </div>
        </div>
      </body>
    </html>
  );
}
