# Luna Civic Strategies — Brand Decision Tool

Phase 1 sits behind an email + password landing page (no emails are sent; requires **Confirm email** turned off in Supabase → Authentication → Sign In / Providers → Email) and has three tabs:

- **Logos:** every logo concept in a grid, black and white only, each with its own comment thread underneath. Click a logo to open it large in a lightbox with its comments; ←/→ step through logos, Esc closes, and "Open in Visualizer" jumps there with that logo selected.
- **Palettes:** every palette direction as its own section: a large editorial grid of colour blocks in mixed sizes, with italic serif names and hex values, and a comment thread beneath. Each colour has heart / X reactions (hover on desktop, always shown on mobile), and each palette has a heart. Everyone's reactions show live as small tags with the person's initial; yours are dark, others' light.
- **Visualizer:** mix and match. Palettes run across the top and logos down the left, with a large preview in the centre. The background stays white. The preview starts in B&W. Click a palette swatch (or "View in color") to recolour the logo, and "View in B&W" resets it. Comments for the current logo and palette are attached to the bottom of the preview. "Save this look" stores the logo, palette and mark colour, and saved looks appear as thumbnails below for everyone, live. Click one to reopen it.

**Review rounds:** every item has a `round` (1 = archive, 2 = active). All tabs default to Round 2 once Round 2 content exists, with a quiet "Round 2 — Active / Round 1 — Archive" switch at the top of Logos and Palettes. In the Visualizer, logos and palettes switch rounds independently (so Round 1 logos can be compared with Round 2 palettes), and saved looks are tagged by round. Round 2 logos start as placeholders: drop SVGs at `public/logos/r2-logo-NN.svg` and set each row's `image_url`.

**Onboarding tour:** an 11-step tooltip tour runs once per person after their first sign-in (and name prompt), then `profiles.onboarding_completed` is set, whether they finish or skip. Anyone can replay it from the **?** button in the top bar.

The current view and combo are kept in the URL (`?view=visualizer&logo=logo-b&palette=palette-c&mark=3A0F1F`), so you can share an exact look as a link. Arrow keys step through logos (↑/↓) and palettes (←/→) in the Visualizer.

Built with React + Vite + Supabase and ready to deploy on Vercel.

Without Supabase keys, the app runs in **preview mode**: it shows the seed content read-only, with sign-in and comments turned off.

## Setup

1. **Create a Supabase project** at supabase.com.
2. **Run the schema:** in SQL Editor, paste and run each file in `supabase/migrations/` in order (`0001` … `0007`).
3. **Seed the content:** paste and run `supabase/seed.sql`.
4. **Auth settings** (Authentication → URL Configuration):
   - Site URL: your Vercel URL (e.g. `https://luna-brand.vercel.app`)
   - Redirect URLs: add `http://localhost:5173/**` and `https://<your-vercel-domain>/**`
   - Email is the only provider needed (on by default). For real use, set up custom SMTP: Supabase's built-in mailer is rate-limited to a few emails per hour.
5. **Env vars:** copy `.env.example` to `.env.local` and fill in the URL and anon key (Project Settings → API).
6. `npm install && npm run dev`

## Deploy (Vercel)

Import the repo, framework preset **Vite**, then add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables. `vercel.json` handles SPA rewrites.

## Editing content

All options live in the `brand_items` table. Change them in Supabase → Table Editor:

| column          | notes                                                                 |
| --------------- | --------------------------------------------------------------------- |
| `type`          | `logo` · `palette` · `typography`                                      |
| `name`, `description` | shown on the card                                               |
| `image_url`     | logos only: a full URL **or** a path in the `brand-assets` bucket      |
| `data`          | type-specific JSON (see below)                                        |
| `display_order` | sort order within the section                                          |

**Logos:** artwork lives in `public/logos/logo-NN.svg`, and each logo row's `image_url` points at it (e.g. `/logos/logo-03.svg`). SVGs are rendered inline so the Visualizer can recolour them: every dark fill (`#020202`, `#010101`, `black`) follows the selected mark colour, and light detail fills (`#F5F5F5`, `white`) stay as they are. Red accent fills (`#FF0000` or `#C21717`) mark an optional accent element: in the Visualizer those logos get an **Accent** picker (default "Match" = same as the main colour), and everywhere else the accent renders in the main colour. To add a logo, drop the SVG into `public/logos/`, add a `logo(n)` line in `src/data/seedItems.js`, run `npm run seed:sql`, and re-run `seed.sql`. `image_url` can also be a path in the `brand-assets` storage bucket. Non-SVG files are recoloured with a CSS mask instead.

**Palette `data`:** `{ "label": "Palette A", "colors": [{ "name": "Oxblood", "hex": "#5C1424" }, …] }`
Every colour in a palette is offered as a mark-colour swatch in the Visualizer.

**Typography `data`:** `{ "headline": { family, fallback, googleFont, sample, role }, "body": { … } }`. `googleFont` is the Google Fonts css2 family string. Add another `typography` row to compare a second pairing.

To change the starting content, edit `src/data/seedItems.js` and run `npm run seed:sql`. Seeding upserts by `slug`, so existing comments are kept.

## Access model

- Signed-out visitors see only the landing page, where they create an account (name, email, password) or sign in, and land straight in the explorer. Sessions persist, so people stay signed in on that browser.
- The landing-page gate is UI-only. The database still allows anonymous reads of items and comments (see the RLS policies), so to make data private at the database level too, change the `select` policies to `to authenticated`.
- Everyone sets a display name (on the landing page, or via the prompt and the name in the top bar). It's shown on comments, reactions and saved looks.
- `brand_items` and storage are read-only from the app. Changes go through the Supabase dashboard.

## Structure

```
supabase/migrations/0001_init.sql  schema, RLS, realtime, storage bucket
supabase/migrations/0002_saved_looks.sql  saved looks table (Visualizer)
supabase/migrations/0003_reactions.sql    colour + palette reactions
supabase/migrations/0004_remove_placeholder_logos.sql  one-off cleanup when real logos landed
supabase/migrations/0005_onboarding.sql   profiles.onboarding_completed
supabase/migrations/0006_saved_look_accent.sql  saved_looks.accent_hex
supabase/migrations/0007_rounds.sql       brand_items.round (1 archive / 2 active)
public/logos/                      logo artwork (logo-01.svg …)
src/lib/svg.js                     inline SVG loader + dark-fill recolouring
supabase/seed.sql                  generated from src/data/seedItems.js
src/App.jsx                        auth gate + Logos / Palettes / Visualizer tabs
src/hooks/useLiveRows.js           shared load + realtime for comments and saved looks
src/hooks/                         useAuth, useBrandItems, useComments, useSavedLooks, useUrlParam
src/components/                    Landing, Header, LogosView, PalettesView, Visualizer, SavedLooks, Tour, CommentThread, …
```

### Built for later

- **Threaded replies:** `comments.parent_id` already exists. You'd only need to group comments by parent in `CommentThread`.
- **Phase 2 guidelines hub:** add a new `type` to the check constraint, keep downloadable files in `brand-assets`, and put per-item metadata in `data`.
