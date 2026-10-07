import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  const chapter = new URL(req.url).searchParams.get('chapter');
  const where = chapter ? { chapterCandidate: chapter, status: { in: ['SELECTED', 'EDITED', 'FINAL'] as const } } : { status: { in: ['SELECTED', 'EDITED', 'FINAL'] as const } };
  const entries = await prisma.lifeEntry.findMany({ where, orderBy: { createdAt: 'asc' } });
  const title = chapter || 'Выбранные главы';
  const body = `# ${title}\n\n` + entries.map(e=>`## ${e.title}\n\n${e.literaryText||e.cleanedText||e.rawText}`).join('\n\n');
  return new Response(body,{headers:{'content-type':'text/markdown; charset=utf-8','content-disposition':'attachment; filename="chapters-export.md"'}});
}
