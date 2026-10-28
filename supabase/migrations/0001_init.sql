-- Luna Civic Strategies — Brand Decision Tool
-- Phase 1 schema: profiles, brand_items, comments, realtime, storage.
-- Run once in Supabase → SQL Editor (or `supabase db push`).

-- ─────────────────────────────────────────────────────────────
-- Profiles: public display info for each auth user.
-- Auth users live in auth.users (managed by Supabase); the client
-- can't read that table, so we mirror name + email here.
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Brand items: every option under review (logo / palette / typography).
-- `data` holds type-specific content (palette colours, font specs,
-- placeholder variant), so new item types or fields in Phase 2 don't
-- need a migration. `image_url` is either a full URL or a path inside
-- the `brand-assets` storage bucket (e.g. "logos/option-a.svg").
-- ─────────────────────────────────────────────────────────────
create table public.brand_items (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  type          text not null check (type in ('logo', 'palette', 'typography')),
  name          text not null,
  description   text,
  image_url     text,
  data          jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index brand_items_type_order_idx on public.brand_items (type, display_order);

-- ─────────────────────────────────────────────────────────────
-- Comments: flat list per item in v1. `parent_id` is already here so
-- threaded replies can be switched on later without a migration.
-- ─────────────────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.brand_items (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  parent_id  uuid references public.comments (id) on delete cascade,
  text       text not null check (char_length(trim(text)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index comments_item_created_idx on public.comments (item_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- Row level security
--   • Anyone with the link can read everything (anon role).
--   • Signed-in users can add comments as themselves and delete their own.
--   • brand_items are edited only from the Supabase dashboard (no client writes).
-- ─────────────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.brand_items enable row level security;
alter table public.comments    enable row level security;

create policy "profiles are readable by everyone"
  on public.profiles for select to anon, authenticated using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "brand items are readable by everyone"
  on public.brand_items for select to anon, authenticated using (true);

create policy "comments are readable by everyone"
  on public.comments for select to anon, authenticated using (true);

create policy "signed-in users add their own comments"
  on public.comments for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "users delete their own comments"
  on public.comments for delete to authenticated
  using (user_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- Realtime: broadcast comment inserts/deletes to open pages.
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.comments;

-- ─────────────────────────────────────────────────────────────
-- Storage: public-read bucket for logo files (and Phase 2 downloads).
-- No upload policies — files go in via the Supabase dashboard.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;
