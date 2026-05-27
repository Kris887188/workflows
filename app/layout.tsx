import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Моя книга / My Life Book', description: 'Личный архив для книги жизни' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body><div className="mx-auto max-w-6xl p-4 md:p-8">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-xl font-semibold">Моя книга</Link>
      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href="/add-material">Добавить</Link><Link href="/timeline">Хронология</Link><Link href="/search">Поиск</Link><Link href="/book-builder">Сборка книги</Link><Link href="/chapters">Главы</Link><Link href="/settings/prompts">Шаблон</Link>
      </nav>
    </header>{children}</div></body></html>;
}
