import { describe, it, expect } from 'vitest';
import { processTextContent } from '../lib/processors/textProcessor';
describe('text processor',()=>{it('cleans whitespace', async()=>{const r=await processTextContent('a   b\n c'); expect(r.cleanedText).toBe('a b c');});});
