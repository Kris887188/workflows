import { getPromptTemplate, setPromptTemplate } from '@/lib/ai/promptTemplate';

async function savePrompt(formData: FormData) {
  'use server';
  await setPromptTemplate(String(formData.get('template') || ''));
}

export default async function PromptSettingsPage() {
  const template = await getPromptTemplate();
  return <main className='space-y-4'><h1 className='text-2xl'>Редактор шаблона литературной обработки</h1>
    <div className='rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm'>Важно: переписывание не должно менять факты. Оригинал всегда хранится отдельно.</div>
    <form action={savePrompt} className='card space-y-3'><textarea name='template' defaultValue={template} className='h-72 w-full rounded border p-2 font-mono text-sm'/><button className='rounded bg-slate-900 px-3 py-2 text-white'>Сохранить шаблон</button></form>
  </main>;
}
