import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { ENTRY_STATUSES, PRIVACY_LEVELS } from '@/lib/db/constants';

export default async function Entry({ params }:{params:{id:string}}){
  const e=await prisma.lifeEntry.findUnique({where:{id:params.id}, include:{sourceFiles:true}}); if(!e) return <main>Не найдено</main>;
  return <main className='space-y-4'><h1 className='text-2xl'>{e.title}</h1>
    {e.privacyLevel === 'SENSITIVE' && <div className='rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-900'>⚠️ Чувствительный материал. Проверьте приватность перед экспортом или внешней обработкой.</div>}
    <div className='card flex flex-wrap items-center gap-3'>
      <form action={`/api/entries/${e.id}/status`} method='post'><select name='status' defaultValue={e.status} className='rounded border p-2'>{ENTRY_STATUSES.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select><button className='ml-2 rounded border px-2 py-1'>Обновить статус</button></form>
      <form action={`/api/entries/${e.id}/privacy`} method='post'><select name='privacyLevel' defaultValue={e.privacyLevel} className='rounded border p-2'>{PRIVACY_LEVELS.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select><button className='ml-2 rounded border px-2 py-1'>Обновить приватность</button></form>
      <Link className='underline text-sm' href={`/review/${e.id}`}>Открыть экран ревью версий</Link>
    </div>
    <div className='grid gap-3 md:grid-cols-2'><section className='card'><h2>Оригинал</h2><p className='whitespace-pre-wrap'>{e.rawText}</p></section><section className='card'><h2>Очищенный текст</h2><p className='whitespace-pre-wrap'>{e.cleanedText}</p></section><section className='card'><h2>Смысл</h2><p>{e.summary}</p></section><section className='card'><h2>Версия для книги</h2><p className='whitespace-pre-wrap'>{e.literaryText}</p></section></div></main>}
