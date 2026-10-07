import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db/prisma';
import { processTextContent } from '@/lib/processors/textProcessor';
import { processDocx } from '@/lib/processors/docxProcessor';
import { processPdf } from '@/lib/processors/pdfProcessor';
import { processSpreadsheet } from '@/lib/processors/spreadsheetProcessor';
import { processImagePlaceholder } from '@/lib/processors/imageProcessor';
import { processAudioPlaceholder } from '@/lib/processors/audioProcessor';
import { runPipeline } from '@/lib/pipeline/processEntry';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const title = String(form.get('title') || 'Без названия');
    const text = String(form.get('text') || '');
    const file = form.get('file') as File | null;
    let rawText = text; let cleanedText = text.trim();
    let filename = ''; let mimeType='text/plain'; let size=0; let storagePath='';

    if (file && file.size > 0) {
      const bytes = Buffer.from(await file.arrayBuffer());
      filename = file.name; mimeType=file.type; size=file.size;
      storagePath = path.join('uploads', `${Date.now()}-${filename}`);
      await fs.writeFile(storagePath, bytes);
      if (file.name.endsWith('.docx')) ({ rawText, cleanedText } = await processDocx(bytes));
      else if (file.name.endsWith('.pdf')) ({ rawText, cleanedText } = await processPdf(bytes));
      else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) ({ rawText, cleanedText } = await processSpreadsheet(bytes));
      else if (file.type.startsWith('image/')) ({ rawText, cleanedText } = await processImagePlaceholder());
      else if (file.type.startsWith('audio/')) ({ rawText, cleanedText } = await processAudioPlaceholder());
      else ({ rawText, cleanedText } = await processTextContent(bytes.toString('utf-8')));
    } else { ({ rawText, cleanedText } = await processTextContent(text)); }

    const ai = await runPipeline(cleanedText);
    const entry = await prisma.lifeEntry.create({ data: { title, sourceType: file?.type || 'text/manual', rawText, cleanedText, summary: ai.summary, literaryText: ai.literaryText, emotionalTone: ai.emotionalTone, people: ai.people.join(', '), places: ai.places.join(', '), tags: ai.themes.join(', '), chapterCandidate: ai.chapterCandidate, notes: String(form.get('notes')||''), status: 'RAW', privacyLevel: 'PRIVATE' } });
    if (filename) await prisma.sourceFile.create({ data: { filename, mimeType, size, storagePath, entryId: entry.id } });
    return NextResponse.json({ message: 'Материал сохранён', id: entry.id });
  } catch (e) { return NextResponse.json({ message: 'Ошибка обработки' }, { status: 500 }); }
}
