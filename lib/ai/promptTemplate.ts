import { prisma } from '@/lib/db/prisma';

const DEFAULT_TEMPLATE = `Ты литературный редактор мемуаров.
Задача: переписать текст в фрагмент книги, не меняя фактов.
Стиль: эмоциональный, точный, кинематографичный, интимный и честный.
Запрещено: выдумывать события, людей, даты, детали.
Сохраняй смысл и эмоциональную правду исходного текста.`;

export async function getPromptTemplate() {
  const row = await prisma.chapter.findFirst({ where: { title: '__PROMPT_TEMPLATE__' } });
  return row?.description || DEFAULT_TEMPLATE;
}

export async function setPromptTemplate(value: string) {
  const existing = await prisma.chapter.findFirst({ where: { title: '__PROMPT_TEMPLATE__' } });
  if (existing) {
    await prisma.chapter.update({ where: { id: existing.id }, data: { description: value } });
  } else {
    await prisma.chapter.create({ data: { title: '__PROMPT_TEMPLATE__', description: value, order: -1 } });
  }
}
