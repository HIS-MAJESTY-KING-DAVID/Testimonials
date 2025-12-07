insert into storage.buckets (id, name, public)
values ('photos','photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public insert photos'
  ) then
    create policy "Public insert photos" on storage.objects
      for insert to public
      with check ( bucket_id = 'photos' );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public insert media'
  ) then
    create policy "Public insert media" on storage.objects
      for insert to public
      with check ( bucket_id = 'media' );
  end if;
end $$;
