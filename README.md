# Моя книга / My Life Book (PWA)

Первая реально используемая версия приложения для сохранения вашей истории жизни с доступом с телефона и компьютера.

## Стек
- Next.js + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Vercel
- PWA install

## Что уже работает
1. Вход и регистрация.
2. Создание записей Life Entry.
3. Ручной ввод текста.
4. Загрузка файлов.
5. Загрузка аудио файла.
6. Запись аудио с микрофона прямо в браузере (MediaRecorder).
7. Редактирование: title/date/people/tags/notes/book fragment.
8. Таймлайн всех записей.
9. Поиск по записям.
10. Экспорт **выбранных** записей в Markdown.

---

## Быстрый старт (локально)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте: http://localhost:3000

## .env.local

Можно использовать ваш Supabase проект:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qsntgclzeazkjowlqfnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JMTcsnvRxLimz3strzcwBg_tE8mfDZO
```

---

## Настройка Supabase

1. Откройте ваш Supabase проект.
2. Перейдите в **SQL Editor**.
3. Выполните файл `sql/supabase_schema.sql`.
4. Убедитесь, что Email auth включен в **Authentication**.

> Важно: это production-подход, SQLite не используется.

---

## Деплой на Vercel

1. Запушьте репозиторий в GitHub.
2. В Vercel → **New Project** → Import.
3. Добавьте env-переменные:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Нажмите Deploy.

---

## Установка как PWA

### iPhone (Safari)
1. Откройте приложение в Safari.
2. Нажмите «Поделиться».
3. Выберите «На экран Домой».

### Android (Chrome)
1. Откройте приложение в Chrome.
2. Нажмите меню ⋮.
3. Выберите «Установить приложение».

### Desktop (Chrome/Edge)
1. Откройте приложение.
2. Нажмите иконку Install в адресной строке.
3. Подтвердите установку.
