import { aiProvider } from '@/lib/ai/provider';
export async function runPipeline(cleanedText: string) {
  const summary = await aiProvider.summarize(cleanedText);
  const meta = await aiProvider.extractMetadata(cleanedText);
  const literaryText = await aiProvider.rewriteAsBookFragment(cleanedText);
  return { summary, literaryText, ...meta };
}
