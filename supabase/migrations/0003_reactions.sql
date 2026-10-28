-- Reactions on the Palettes tab: heart / X per colour, heart per palette.
-- One reaction per person per colour (and per palette), enforced by the
-- unique constraints. Shared and live for everyone.

create table public.color_reactions (
  id         uuid primary key default gen_random_uuid(),
  palette_id uuid not null references public.brand_items (id) on delete cascade,
  color_hex  text not null check (color_hex ~ '^#[0-9A-F]{6}$'),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reaction   text not null check (reaction in ('heart', 'x')),
  created_at timestamptz not null default now(),
  unique (palette_id, color_hex, user_id)
);

create table public.palette_reactions (
  id         uuid primary key default gen_random_uuid(),
  palette_id uuid not null references public.brand_items (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reaction   text not null default 'heart' check (reaction = 'heart'),
  created_at timestamptz not null default now(),
  unique (palette_id, user_id)
);

alter table public.color_reactions   enable row level security;
alter table public.palette_reactions enable row level security;

create policy "colour reactions are readable by everyone"
  on public.color_reactions for select to anon, authenticated using (true);
create policy "users add their own colour reactions"
  on public.color_reactions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "users change their own colour reactions"
  on public.color_reactions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users remove their own colour reactions"
  on public.color_reactions for delete to authenticated using (user_id = (select auth.uid()));

create policy "palette reactions are readable by everyone"
  on public.palette_reactions for select to anon, authenticated using (true);
create policy "users add their own palette reactions"
  on public.palette_reactions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "users remove their own palette reactions"
  on public.palette_reactions for delete to authenticated using (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.color_reactions;
alter publication supabase_realtime add table public.palette_reactions;
