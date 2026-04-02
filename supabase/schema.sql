create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text not null,
  avatar_url text,
  invited boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null,
  text text not null default '',
  mood text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moment_photos (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'spark', 'hug', 'laugh')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (moment_id, user_id, reaction_type)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists moments_updated_at on public.moments;
create trigger moments_updated_at
before update on public.moments
for each row execute function public.touch_updated_at();

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
before update on public.notes
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.moments enable row level security;
alter table public.moment_photos enable row level security;
alter table public.reactions enable row level security;
alter table public.notes enable row level security;

create policy "profiles are visible to invited users"
on public.profiles
for select
to authenticated
using (true);

create policy "users can upsert their profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "moments visible to invited users"
on public.moments
for select
to authenticated
using (true);

create policy "users manage their own moments"
on public.moments
for all
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "moment photos visible to invited users"
on public.moment_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.moments
    where public.moments.id = public.moment_photos.moment_id
  )
);

create policy "authors manage moment photos"
on public.moment_photos
for all
to authenticated
using (
  exists (
    select 1
    from public.moments
    where public.moments.id = public.moment_photos.moment_id
      and public.moments.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.moments
    where public.moments.id = public.moment_photos.moment_id
      and public.moments.author_id = auth.uid()
  )
);

create policy "reactions visible to invited users"
on public.reactions
for select
to authenticated
using (true);

create policy "users manage their reactions"
on public.reactions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notes visible to invited users"
on public.notes
for select
to authenticated
using (true);

create policy "users manage their notes"
on public.notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('moment-images', 'moment-images', false)
on conflict (id) do nothing;

create policy "authenticated users can read moment images"
on storage.objects
for select
to authenticated
using (bucket_id = 'moment-images');

create policy "users upload their own moment images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'moment-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users delete their own moment images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'moment-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
