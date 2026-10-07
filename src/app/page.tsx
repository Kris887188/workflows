'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { EntryDraft, LifeEntry } from '@/lib/types';

const supabase = createSupabaseBrowserClient();

const defaultDraft = (): EntryDraft => ({
  title: 'Новая запись',
  entry_date: new Date().toISOString().slice(0, 10),
  people: [],
  tags: [],
  notes: '',
  book_fragment: '',
  text_content: '',
  audio_url: null,
  file_urls: [],
});

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [entries, setEntries] = useState<LifeEntry[]>([]);
  const [selected, setSelected] = useState<LifeEntry | null>(null);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      void loadEntries();
    }
  }, [session?.user?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
      const haystack = [
        entry.title,
        entry.notes,
        entry.book_fragment,
        entry.text_content,
        entry.people.join(' '),
        entry.tags.join(' '),
        entry.entry_date,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, search]);

  async function signUp() {
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return alert(error.message);
    alert('Регистрация создана. Проверьте email для подтверждения.');
  }

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) alert(error.message);
  }

  async function signOut() {
    await stopRecording();
    await supabase.auth.signOut();
    setEntries([]);
    setSelected(null);
    setSelectedIds({});
  }

  async function loadEntries() {
    const { data, error } = await supabase
      .from('life_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) return alert(error.message);

    const nextEntries = (data as LifeEntry[]) ?? [];
    setEntries(nextEntries);
    setSelected((prev) => {
      if (!prev) return nextEntries[0] ?? null;
      return nextEntries.find((item) => item.id === prev.id) ?? nextEntries[0] ?? null;
    });
  }

  async function createEntry() {
    const { data, error } = await supabase
      .from('life_entries')
      .insert(defaultDraft())
      .select('*')
      .single();
    if (error) return alert(error.message);
    const entry = data as LifeEntry;
    setEntries((prev) => [entry, ...prev]);
    setSelected(entry);
  }

  async function saveEntry() {
    if (!selected) return;
    setBusy(true);
    const { error } = await supabase
      .from('life_entries')
      .update({
        title: selected.title,
        entry_date: selected.entry_date,
        people: selected.people,
        tags: selected.tags,
        notes: selected.notes,
        book_fragment: selected.book_fragment,
        text_content: selected.text_content,
        audio_url: selected.audio_url,
        file_urls: selected.file_urls,
      })
      .eq('id', selected.id);
    setBusy(false);
    if (error) return alert(error.message);
    await loadEntries();
    alert('Запись сохранена.');
  }

  async function uploadToBucket(file: File, bucket: 'life-files' | 'life-audio') {
    if (!session?.user?.id) throw new Error('Сессия отсутствует.');
    const cleanName = file.name.replace(/\s+/g, '_');
    const path = `${session.user.id}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function onFilesPicked(event: React.ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const incoming = Array.from(event.target.files);
    setBusy(true);
    try {
      const urls = await Promise.all(incoming.map((file) => uploadToBucket(file, 'life-files')));
      setSelected((prev) => (prev ? { ...prev, file_urls: [...prev.file_urls, ...urls] } : prev));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function onAudioPicked(event: React.ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.[0]) return;
    setBusy(true);
    try {
      const url = await uploadToBucket(event.target.files[0], 'life-audio');
      setSelected((prev) => (prev ? { ...prev, audio_url: url } : prev));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function startRecording() {
    if (!selected) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaChunks.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunks.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(mediaChunks.current, { type: 'audio/webm' });
        const file = new File([blob], `record-${Date.now()}.webm`, { type: 'audio/webm' });
        try {
          const url = await uploadToBucket(file, 'life-audio');
          setSelected((prev) => (prev ? { ...prev, audio_url: url } : prev));
        } catch (error: any) {
          alert(error.message);
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert('Не удалось получить доступ к микрофону. Разрешите доступ в браузере.');
    }
  }

  async function stopRecording() {
    mediaRecorder.current?.stop();
    mediaStream.current?.getTracks().forEach((track) => track.stop());
    mediaRecorder.current = null;
    mediaStream.current = null;
    setRecording(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function exportMarkdown() {
    const selectedEntries = filtered.filter((entry) => selectedIds[entry.id]);
    if (!selectedEntries.length) {
      alert('Отметьте записи слева (чекбокс), которые нужно экспортировать.');
      return;
    }

    const markdown = selectedEntries
      .map((entry) => {
        return [
          `# ${entry.title}`,
          `Дата: ${entry.entry_date}`,
          `Люди: ${entry.people.join(', ') || '-'}`,
          `Теги: ${entry.tags.join(', ') || '-'}`,
          '',
          '## Текст',
          entry.text_content || '-',
          '',
          '## Заметки',
          entry.notes || '-',
          '',
          '## Фрагмент книги',
          entry.book_fragment || '-',
          '',
          '## Файлы',
          entry.file_urls.length ? entry.file_urls.map((url) => `- ${url}`).join('\n') : '-',
          '',
          '## Аудио',
          entry.audio_url || '-',
        ].join('\n');
      })
      .join('\n\n---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-life-book-export-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 p-6">
        <h1 className="text-3xl font-bold">Моя книга / My Life Book</h1>
        <p className="text-sm text-slate-600">Войдите, чтобы работать с вашей лентой жизни.</p>
        <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full" />
        <input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full" />
        <div className="flex gap-2">
          <button onClick={signIn} disabled={busy} className="bg-blue-600 text-white">Войти</button>
          <button onClick={signUp} disabled={busy} className="bg-slate-200">Регистрация</button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 md:grid-cols-[360px_1fr]">
      <aside className="space-y-3 rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Лента жизни</h2>
          <button onClick={signOut} className="bg-red-100">Выйти</button>
        </div>
        <button onClick={createEntry} className="w-full bg-blue-600 text-white">+ Новая запись</button>
        <input placeholder="Поиск" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full" />
        <button onClick={exportMarkdown} className="w-full bg-emerald-600 text-white">Экспорт выбранных в Markdown</button>

        <div className="max-h-[68vh] space-y-2 overflow-auto pr-1">
          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-2">
              <div className="mb-1 flex items-center gap-2">
                <input type="checkbox" checked={!!selectedIds[entry.id]} onChange={() => toggleSelect(entry.id)} />
                <button className="w-full text-left" onClick={() => setSelected(entry)}>
                  <div className="font-semibold">{entry.title}</div>
                  <div className="text-xs text-slate-500">{entry.entry_date}</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-xl bg-white p-4 shadow">
        {!selected ? (
          <p>Выберите запись слева или создайте новую.</p>
        ) : (
          <div className="space-y-3">
            <input value={selected.title} onChange={(event) => setSelected({ ...selected, title: event.target.value })} className="w-full" />
            <input type="date" value={selected.entry_date} onChange={(event) => setSelected({ ...selected, entry_date: event.target.value })} className="w-full" />
            <input
              placeholder="Люди (через запятую)"
              value={selected.people.join(', ')}
              onChange={(event) => setSelected({
                ...selected,
                people: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
              })}
              className="w-full"
            />
            <input
              placeholder="Теги (через запятую)"
              value={selected.tags.join(', ')}
              onChange={(event) => setSelected({
                ...selected,
                tags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
              })}
              className="w-full"
            />
            <textarea rows={5} placeholder="Текст записи" value={selected.text_content} onChange={(event) => setSelected({ ...selected, text_content: event.target.value })} className="w-full" />
            <textarea rows={4} placeholder="Заметки" value={selected.notes} onChange={(event) => setSelected({ ...selected, notes: event.target.value })} className="w-full" />
            <textarea rows={4} placeholder="Фрагмент книги" value={selected.book_fragment} onChange={(event) => setSelected({ ...selected, book_fragment: event.target.value })} className="w-full" />

            <div className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-2">
              <label className="text-sm">Файлы
                <input type="file" multiple onChange={onFilesPicked} className="mt-2 w-full" />
              </label>
              <label className="text-sm">Аудио (загрузить файл)
                <input type="file" accept="audio/*" onChange={onAudioPicked} className="mt-2 w-full" />
              </label>
              <div className="flex items-center gap-2 md:col-span-2">
                {!recording ? (
                  <button type="button" onClick={startRecording} className="bg-amber-500 text-white">🎙️ Начать запись</button>
                ) : (
                  <button type="button" onClick={stopRecording} className="bg-rose-600 text-white">⏹ Остановить и сохранить</button>
                )}
              </div>
            </div>

            {selected.audio_url && <audio controls src={selected.audio_url} className="w-full" />}
            <ul className="list-disc pl-6 text-sm">
              {selected.file_urls.map((url) => (
                <li key={url}><a href={url} target="_blank" className="text-blue-700 underline">{url}</a></li>
              ))}
            </ul>

            <button onClick={saveEntry} disabled={busy} className="bg-blue-700 text-white">Сохранить запись</button>
          </div>
        )}
      </section>
    </main>
  );
}
