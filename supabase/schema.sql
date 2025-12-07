create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  photo_url text,
  video_url text,
  audio_url text,
  text text,
  is_validated boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.testimonies enable row level security;

create policy "Allow public read" on public.testimonies
  for select using ( true );

create policy "Allow insert" on public.testimonies
  for insert with check ( true );

-- allow updates and deletes (client-admin gate handles UI access)
create policy if not exists "Allow update" on public.testimonies
  for update using ( true ) with check ( true );

create policy if not exists "Allow delete" on public.testimonies
  for delete using ( true );
