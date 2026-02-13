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
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
