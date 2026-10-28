-- Review rounds: 1 = archive, 2 = active. Existing items stay in round 1.
alter table public.brand_items
  add column if not exists round int not null default 1 check (round in (1, 2));

create index if not exists brand_items_round_type_order_idx
  on public.brand_items (round, type, display_order);
