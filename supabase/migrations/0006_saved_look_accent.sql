-- Saved looks can carry an optional accent colour (logos with an accent element).
alter table public.saved_looks
  add column if not exists accent_hex text check (accent_hex ~ '^#[0-9A-Fa-f]{6}$');
