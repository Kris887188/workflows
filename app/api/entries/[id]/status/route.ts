import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const form = await req.formData();
  await prisma.lifeEntry.update({ where: { id: params.id }, data: { status: String(form.get('status')) as any } });
  redirect(`/entries/${params.id}`);
}
