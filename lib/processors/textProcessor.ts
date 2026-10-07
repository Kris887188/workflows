export async function processTextContent(input: string) { const cleaned = input.replace(/\s+/g, ' ').trim(); return { rawText: input, cleanedText: cleaned }; }
