import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Моя книга / My Life Book',
  description: 'Личная книга жизни с заметками, файлами и аудио.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
