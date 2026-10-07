import { prisma } from '@/lib/db/prisma';

function ym(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default async function Timeline() {
  const entries = await prisma.lifeEntry.findMany({ orderBy: { createdAt: 'asc' } });
  const grouped = entries.reduce((acc, e) => {
    const key = ym(e.originalDate || e.createdAt);
    (acc[key] ??= []).push(e);
    return acc;
  }, {} as Record<string, typeof entries>);

  const byYear = Object.entries(grouped).reduce((acc, [key, list]) => {
    const [year] = key.split('-');
    (acc[year] ??= []).push([key, list] as const);
    return acc;
  }, {} as Record<string, Array<readonly [string, typeof entries]>>);

  return <main className='space-y-4'><h1 className='text-2xl'>Хронология</h1>
    {Object.entries(byYear).sort().map(([year, months]) => <section key={year} className='card'><h2 className='text-xl mb-3'>{year}</h2>
      <div className='space-y-2'>{months.sort((a,b)=>a[0].localeCompare(b[0])).map(([month, list]) => <div key={month}><h3 className='font-medium'>{month}</h3><ul className='ml-4 list-disc'>{list.map(e => <li key={e.id}>{e.title} · <span className='text-xs'>{e.status.toLowerCase()}</span></li>)}</ul></div>)}</div>
    </section>)}
  </main>;
}
