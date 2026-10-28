# Luna Civic Strategies — Brand Hub

A password-gated brand asset tool. React + Vite, ready for Vercel, no backend.

**Landing page:** the Luna goddess materialises out of the Night Bordeaux background while LUNA and CIVIC STRATEGIES type out, then the password field appears. The password is the `VITE_HUB_PASSWORD` environment variable. It ships in the client bundle, so it keeps casual visitors out but is not real security. Add `?preview=landing` to see the landing page again after unlocking.

**Inside the hub:**

- **Brand Colors:** the five palette colours, each with a one-click copy of its hex code.
- **Logo Builder:** recolour LUNA and CIVIC STRATEGIES separately (palette colours or black), pick a size, and download a transparent PNG.
- **Downloads:** logo PNGs (black, white, Deep Crimson; small, medium, large), the Shunsine and Cotoris Bold font files, and a PNG swatch sheet of the palette.

## Setup

```bash
cp .env.example .env.local   # then set VITE_HUB_PASSWORD
npm install
npm run dev
```

## Deploy (Vercel)

Import the repo with the **Vite** preset and add `VITE_HUB_PASSWORD` as an environment variable. `vercel.json` handles SPA rewrites.

## Where things live

| What | Where |
| --- | --- |
| Palette colours and export sizes | `src/lib/brand.js` |
| Logo (groups `#luna-mark` and `#civic-strategies-mark`) | `src/assets/luna_logo_1.svg` |
| Logo recolouring and PNG / swatch-sheet rendering | `src/lib/logo.js` |
| Goddess illustration | `public/images/luna-goddess.svg` |
| Font files (served for download and used on the page) | `public/fonts/` |
