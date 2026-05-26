'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { LifeEntry } from '@/lib/types';

const supabase = createSupabaseBrowserClient();

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [entries, setEntries] = useState<LifeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LifeEntry | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadEntries();
  }, [session]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) =>
      [e.title, e.notes, e.book_fragment, e.tags.join(','), e.people.join(',')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [entries, search]);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Проверьте почту для подтверждения регистрации.');
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setEntries([]);
    setSelected(null);
  }

  async function loadEntries() {
    const { data, error } = await supabase
      .from('life_entries')
      .select('*')
      .order('entry_date', { ascending: false });
    if (error) return alert(error.message);
    setEntries(data as LifeEntry[]);
  }

  async function createEntry() {
    const blank = {
      title: 'Новая запись',
      entry_date: new Date().toISOString().slice(0, 10),
      people: [],
      tags: [],
      notes: '',
      book_fragment: '',
      text_content: '',
      audio_url: null,
      file_urls: [],
    };
    const { data, error } = await supabase.from('life_entries').insert(blank).select('*').single();
    if (error) return alert(error.message);
    setEntries((prev) => [data as LifeEntry, ...prev]);
    setSelected(data as LifeEntry);
  }

  async function saveEntry(entry: LifeEntry) {
    const { error } = await supabase
      .from('life_entries')
      .update({
        title: entry.title,
        entry_date: entry.entry_date,
        people: entry.people,
        tags: entry.tags,
        notes: entry.notes,
        book_fragment: entry.book_fragment,
        text_content: entry.text_content,
        audio_url: entry.audio_url,
        file_urls: entry.file_urls,
      })
      .eq('id', entry.id);
    if (error) return alert(error.message);
    await loadEntries();
    alert('Сохранено');
  }

  async function uploadFile(file: File, bucket = 'life-files') {
    const path = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected || !e.target.files?.length) return;
    try {
      const urls = await Promise.all(Array.from(e.target.files).map((f) => uploadFile(f, 'life-files')));
      setSelected({ ...selected, file_urls: [...selected.file_urls, ...urls] });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected || !e.target.files?.[0]) return;
    try {
      const audioUrl = await uploadFile(e.target.files[0], 'life-audio');
      setSelected({ ...selected, audio_url: audioUrl });
    } catch (err: any) {
      alert(err.message);
    }
  }

  function exportMarkdown() {
    const md = filtered
      .map((e) => `# ${e.title}\n\nДата: ${e.entry_date}\n\nЛюди: ${e.people.join(', ')}\n\nТеги: ${e.tags.join(', ')}\n\n${e.text_content}\n\n## Заметки\n${e.notes}\n\n## Фрагмент книги\n${e.book_fragment}\n`)
      .join('\n---\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-life-book-export.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!session) {
    return <main className="mx-auto max-w-md space-y-4 p-6"><h1 className="text-2xl font-bold">Моя книга / My Life Book</h1><p>Вход в аккаунт</p><input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" /><input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" /><div className="flex gap-2"><button className="bg-blue-600 text-white" onClick={signIn} disabled={loading}>Войти</button><button className="bg-slate-200" onClick={signUp} disabled={loading}>Регистрация</button></div></main>;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[380px_1fr]">
      <section className="space-y-3 rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Лента жизни</h2><button className="bg-red-100" onClick={signOut}>Выйти</button></div>
        <button className="w-full bg-blue-600 text-white" onClick={createEntry}>+ Новая запись</button>
        <input className="w-full" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="w-full bg-emerald-600 text-white" onClick={exportMarkdown}>Экспорт Markdown</button>
        <div className="max-h-[70vh] space-y-2 overflow-auto">
          {filtered.map((e) => (
            <button key={e.id} className="w-full rounded-lg border p-3 text-left" onClick={() => setSelected(e)}>
              <div className="font-semibold">{e.title}</div>
              <div className="text-sm text-slate-500">{e.entry_date}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        {!selected ? <p>Выберите запись слева или создайте новую.</p> : (
          <div className="space-y-3">
            <input className="w-full" value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
            <input type="date" className="w-full" value={selected.entry_date} onChange={(e) => setSelected({ ...selected, entry_date: e.target.value })} />
            <input className="w-full" placeholder="Люди через запятую" value={selected.people.join(', ')} onChange={(e) => setSelected({ ...selected, people: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            <input className="w-full" placeholder="Теги через запятую" value={selected.tags.join(', ')} onChange={(e) => setSelected({ ...selected, tags: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            <textarea className="w-full" rows={4} placeholder="Текст записи" value={selected.text_content} onChange={(e) => setSelected({ ...selected, text_content: e.target.value })} />
            <textarea className="w-full" rows={4} placeholder="Заметки" value={selected.notes} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} />
            <textarea className="w-full" rows={4} placeholder="Фрагмент книги" value={selected.book_fragment} onChange={(e) => setSelected({ ...selected, book_fragment: e.target.value })} />
            <label className="block">Файлы <input type="file" multiple onChange={handleFileUpload} /></label>
            <label className="block">Аудио <input type="file" accept="audio/*" onChange={handleAudioUpload} /></label>
            {selected.audio_url && <audio controls src={selected.audio_url} className="w-full" />}
            <ul className="list-disc pl-6 text-sm">{selected.file_urls.map((u) => <li key={u}><a href={u} target="_blank" className="text-blue-700 underline">{u}</a></li>)}</ul>
            <button className="bg-blue-700 text-white" onClick={() => saveEntry(selected)}>Сохранить запись</button>
          </div>
        )}
      </section>
    </main>
  );
}
