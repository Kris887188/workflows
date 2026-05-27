import mammoth from 'mammoth';
export async function processDocx(buffer: Buffer) { const result = await mammoth.extractRawText({ buffer }); return { rawText: result.value, cleanedText: result.value.trim() }; }
