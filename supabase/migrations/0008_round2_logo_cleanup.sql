-- Round 2 now has 5 logos (3 new + 2 carried over from Round 1). Remove the
-- leftover placeholders. They had no comments or saved looks when removed.
delete from public.brand_items
where round = 2 and type = 'logo'
  and slug in ('r2-logo-06', 'r2-logo-07', 'r2-logo-08', 'r2-logo-09');
