-- Saved looks: logo + palette + mark colour combinations saved from the
-- Visualizer. Shared and live, so everyone sees everyone's saved looks.
create table public.saved_looks (
  id         uuid primary key default gen_random_uuid(),
  logo_id    uuid not null references public.brand_items (id) on delete cascade,
  palette_id uuid not null references public.brand_items (id) on delete cascade,
  mark_hex   text not null check (mark_hex ~ '^#[0-9A-Fa-f]{6}$'),
  mark_name  text,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index saved_looks_created_idx on public.saved_looks (created_at);

alter table public.saved_looks enable row level security;

create policy "saved looks are readable by everyone"
  on public.saved_looks for select to anon, authenticated using (true);

create policy "signed-in users save their own looks"
  on public.saved_looks for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "users delete their own looks"
  on public.saved_looks for delete to authenticated
  using (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.saved_looks;
