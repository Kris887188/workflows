# Моя книга / My Life Book

PWA-ready MVP for turning life materials into autobiographical book fragments.

## Stack
Next.js 14 + TypeScript + Tailwind + Prisma + SQLite.

## Features (MVP)
- Russian-first responsive UI
- Dashboard, Add Material, Entry Detail, Timeline, Search, Book Builder
- Local upload storage in `/uploads`
- Processing pipeline with modular processors: txt, docx, pdf, csv/xlsx + audio/image placeholders
- AI abstraction (`lib/ai/provider.ts`) with mock provider
- Markdown export for selected/edited/final entries
- Seed data and sample test

## Run
1. `npm install`
2. `cp .env.example .env`
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run dev`

## Privacy
- Local-first by default
- No external AI calls in mock mode
- Keep API keys server-side only
- Mark sensitive items with `privacyLevel`

## What is left for next iterations
- True PWA service worker and offline sync
- Real OpenAI provider implementation with explicit consent screens
- OCR and transcription integrations
- Rich entry editing tabs and chapter drag-and-drop
- DOCX export and better timeline filters
