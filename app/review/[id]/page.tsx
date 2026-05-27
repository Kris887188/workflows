import { prisma } from '@/lib/db/prisma';

export default async function ReviewPage({ params }:{params:{id:string}}) {
  const e = await prisma.lifeEntry.findUnique({ where: { id: params.id } });
  if (!e) return <main>Запись не найдена</main>;
  return <main className='space-y-4'><h1 className='text-2xl'>Сравнение версий</h1>
    <p className='text-sm text-slate-600'>Оригинал всегда хранится отдельно. Автопереписывание не удаляет исходник.</p>
    <div className='grid gap-3 md:grid-cols-3'>
      <section className='card'><h2 className='font-semibold mb-2'>Оригинальный текст</h2><p className='whitespace-pre-wrap text-sm'>{e.rawText}</p></section>
      <section className='card'><h2 className='font-semibold mb-2'>Очищенный текст</h2><p className='whitespace-pre-wrap text-sm'>{e.cleanedText}</p></section>
      <section className='card'><h2 className='font-semibold mb-2'>Литературная версия</h2><p className='whitespace-pre-wrap text-sm'>{e.literaryText}</p></section>
    </div>
  </main>;
}
