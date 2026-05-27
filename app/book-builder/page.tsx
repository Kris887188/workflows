import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function BookBuilder(){
  const [entries, chapters] = await Promise.all([
    prisma.lifeEntry.findMany({take:50,orderBy:{createdAt:'desc'}}),
    prisma.chapter.findMany({ where: { order: { gte: 0 } }, orderBy: { order: 'asc' } })
  ]);

  return <main className='space-y-4'><h1 className='text-2xl'>Сборка книги</h1>
    <section className='card'><p>Экспортируйте все выбранные или по конкретной главе.</p>
      <a href='/api/book/export' className='rounded bg-slate-900 px-3 py-2 text-white inline-block mt-2'>Экспорт всех выбранных</a>
      <div className='mt-3 flex flex-wrap gap-2'>{chapters.map(c => <a key={c.id} href={`/api/chapters/export?chapter=${encodeURIComponent(c.title)}`} className='rounded border px-2 py-1 text-sm'>Экспорт: {c.title}</a>)}</div>
    </section>
    <section className='grid gap-2'>{entries.map(e=><Link href={`/entries/${e.id}`} key={e.id} className='card'>{e.title} <span className='text-xs text-slate-500'>[{e.status.toLowerCase()}]</span></Link>)}</section>
  </main>}
