create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  video_url text,
  audio_url text,
  text text,
  created_at timestamptz not null default now()
);

alter table public.testimonies enable row level security;

create policy "Allow public read" on public.testimonies
  for select using ( true );

create policy "Allow insert" on public.testimonies
  for insert with check ( true );
