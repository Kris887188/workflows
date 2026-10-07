import { prisma } from '@/lib/db/prisma';

async function createChapter(formData: FormData) {
  'use server';
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  const count = await prisma.chapter.count({ where: { order: { gte: 0 } } });
  await prisma.chapter.create({ data: { title, description: String(formData.get('description') || ''), order: count + 1 } });
}

export default async function ChaptersPage() {
  const chapters = await prisma.chapter.findMany({ where: { order: { gte: 0 } }, orderBy: { order: 'asc' } });
  return <main className='space-y-4'><h1 className='text-2xl'>Главы</h1>
    <form action={createChapter} className='card space-y-2'><input name='title' className='w-full rounded border p-2' placeholder='Название главы' required/><textarea name='description' className='w-full rounded border p-2' placeholder='Описание главы'/><button className='rounded bg-slate-900 px-3 py-2 text-white'>Добавить главу</button></form>
    <section className='space-y-2'>{chapters.map(c=><div key={c.id} className='card'><h2 className='font-semibold'>{c.order}. {c.title}</h2><p className='text-sm'>{c.description}</p></div>)}</section>
  </main>;
}
