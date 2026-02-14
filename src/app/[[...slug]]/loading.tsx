export default function SlugLoading() {
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
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', marginBottom: 16 }}>
          Knowledge Base
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            border: '2px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>Đang tải...</p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
    </div>
  );
}
