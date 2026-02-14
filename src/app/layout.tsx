import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: {
    default: 'Knowledge Base - Nền tảng đào tạo trực tuyến hàng đầu',
    template: '%s | Knowledge Base',
  },
  description: 'Knowledge Base - Nền tảng giáo dục và workflow marketplace. Khóa học BIM, AutoCAD, công nghệ xây dựng.',
  openGraph: {
    title: 'Knowledge Base - Nền tảng đào tạo trực tuyến hàng đầu',
    siteName: 'Knowledge Base',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, backgroundColor: '#f1f5f9' }}>
        <div id="root" style={{ minHeight: '100vh' }}>{children}</div>
      </body>
    </html>
  );
}
