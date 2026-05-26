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

create or replace function public.set_user_id()
returns trigger language plpgsql as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_set_user_id
before insert or update on public.life_entries
for each row execute function public.set_user_id();

insert into storage.buckets (id, name, public)
values ('life-files', 'life-files', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('life-audio', 'life-audio', true)
on conflict (id) do nothing;
