-- Remove the placeholder logos (logo-a … logo-h) now that real artwork
-- (logo-01 … logo-10) is seeded. Run this, then re-run supabase/seed.sql.
-- Cascades to any comments / saved looks on those placeholders (none at time of writing).
delete from public.brand_items
where type = 'logo'
  and slug in ('logo-a', 'logo-b', 'logo-c', 'logo-d', 'logo-e', 'logo-f', 'logo-g', 'logo-h');
