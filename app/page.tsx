import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function Dashboard() {
  const [count,recent,needsReview,sensitiveCount] = await Promise.all([
    prisma.lifeEntry.count(),
    prisma.lifeEntry.findMany({ orderBy:{createdAt:'desc'}, take:5 }),
    prisma.lifeEntry.count({ where:{ status:'RAW' } }),
    prisma.lifeEntry.count({ where:{ privacyLevel: 'SENSITIVE' } })
  ]);
  return <main className="space-y-4">
    <section className="grid gap-4 md:grid-cols-4"><div className="card"><p>Всего записей</p><p className="text-3xl">{count}</p></div><div className="card"><p>Нужно проверить</p><p className="text-3xl">{needsReview}</p></div><div className="card"><p>Чувствительных</p><p className="text-3xl">{sensitiveCount}</p></div><div className="card"><p>Быстрые действия</p><div className="mt-2 flex flex-col gap-2 text-sm"><Link href="/add-material">Добавить материал</Link><Link href="/add-material#voice">Записать голос</Link><Link href="/add-material#memory">Написать воспоминание</Link></div></div></section>
    <section className="card"><h2 className="mb-3 text-lg">Недавние материалы</h2><ul className="space-y-2">{recent.map(e=><li key={e.id}><Link href={`/entries/${e.id}`}>{e.title}</Link></li>)}</ul></section>
  </main>;
}
