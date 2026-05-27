import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const form = await req.formData();
  await prisma.lifeEntry.update({ where: { id: params.id }, data: { privacyLevel: String(form.get('privacyLevel')) as any } });
  redirect(`/entries/${params.id}`);
}
