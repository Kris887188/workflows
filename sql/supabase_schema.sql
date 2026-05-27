create extension if not exists "uuid-ossp";

create table if not exists public.life_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Новая запись',
  entry_date date not null default current_date,
  people text[] not null default '{}',
  tags text[] not null default '{}',
  notes text not null default '',
  book_fragment text not null default '',
  text_content text not null default '',
  audio_url text,
  file_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.life_entries enable row level security;

create policy "Users can read own entries" on public.life_entries
for select using (auth.uid() = user_id);

create policy "Users can create own entries" on public.life_entries
for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.life_entries
for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.life_entries
for delete using (auth.uid() = user_id);

create or replace function public.set_user_id_and_timestamp()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and new.user_id is null then
    new.user_id = auth.uid();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_user_id on public.life_entries;
create trigger trg_set_user_id
before insert or update on public.life_entries
for each row execute function public.set_user_id_and_timestamp();

insert into storage.buckets (id, name, public)
values ('life-files', 'life-files', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('life-audio', 'life-audio', true)
on conflict (id) do nothing;

create policy "Life files are publicly readable"
on storage.objects for select
using (bucket_id = 'life-files');

create policy "Life audio is publicly readable"
on storage.objects for select
using (bucket_id = 'life-audio');

create policy "Users can upload own files"
on storage.objects for insert
with check (
  bucket_id = 'life-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload own audio"
on storage.objects for insert
with check (
  bucket_id = 'life-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own files"
on storage.objects for update
using (
  bucket_id = 'life-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update own audio"
on storage.objects for update
using (
  bucket_id = 'life-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'life-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own audio"
on storage.objects for delete
using (
  bucket_id = 'life-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
