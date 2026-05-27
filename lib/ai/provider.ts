import { getPromptTemplate } from '@/lib/ai/promptTemplate';

export type MetadataExtraction = { dates: string[]; people: string[]; places: string[]; emotionalTone: string; themes: string[]; chapterCandidate: string };
export interface AIProvider { summarize(text: string): Promise<string>; extractMetadata(text: string): Promise<MetadataExtraction>; rewriteAsBookFragment(text: string): Promise<string>; }

class MockAIProvider implements AIProvider {
  async summarize(text: string) { return `Кратко: ${text.slice(0, 180)}...`; }
  async extractMetadata(text: string) { return { dates: [], people: [], places: [], emotionalTone: text.includes('рад') ? 'радость' : 'нейтрально', themes: ['семья'], chapterCandidate: 'Ранние годы' }; }
  async rewriteAsBookFragment(text: string) {
    const template = await getPromptTemplate();
    return `Шаблон:\n${template}\n\nЛитературный черновик (без изменения фактов):\n\n${text}`;
  }
}
export const aiProvider: AIProvider = new MockAIProvider();
