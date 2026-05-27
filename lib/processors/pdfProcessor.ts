import pdf from 'pdf-parse';
export async function processPdf(buffer: Buffer) { const data = await pdf(buffer); const text = data.text?.trim() ?? ''; return { rawText: text, cleanedText: text, ocrNeeded: text.length < 20 }; }
