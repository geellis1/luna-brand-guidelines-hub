-- Reset all activity before sharing with the client.
-- Run in Supabase → SQL Editor when you're done testing.
--
-- Clears: comments, saved looks, colour reactions, palette reactions.
-- Keeps:  logos, palettes, type pairing, and everyone's accounts + names.

delete from public.comments;
delete from public.saved_looks;
delete from public.color_reactions;
delete from public.palette_reactions;

-- Show the onboarding tour again for everyone on their next visit.
update public.profiles set onboarding_completed = false;

-- Optional: also remove test accounts. Uncomment and edit the email(s).
-- Deleting a user also deletes their profile.
-- delete from auth.users where email in ('someone@example.com');
