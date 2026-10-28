// Starting content for the brand decision board.
// Single source of truth: `npm run seed:sql` turns this into supabase/seed.sql,
// and the app falls back to it (read-only) when Supabase isn't configured.
// Once seeded, edit items in the Supabase dashboard (table: brand_items).

// Every item belongs to a review round: 1 = archive, 2 = active.

// Round 1 logo artwork lives in public/logos/logo-NN.svg.
const logo = (n) => {
  const nn = String(n).padStart(2, '0')
  return {
    slug: `logo-${nn}`,
    type: 'logo',
    name: `Logo ${nn}`,
    description: null,
    image_url: `/logos/logo-${nn}.svg`,
    data: {},
    display_order: n,
    round: 1,
  }
}

// Round 2 logos. New artwork lives in public/logos/r2-logo-NN.svg; logos
// carried over from Round 1 reuse that file and record where they came from
// (`data.fromRound1`), which the UI shows as a "From Round 1" tag. Use
// `data.placeholder` (no image_url) for a stand-in until artwork arrives.
const r2Logo = (n, { image, fromRound1 } = {}) => {
  const nn = String(n).padStart(2, '0')
  return {
    slug: `r2-logo-${nn}`,
    type: 'logo',
    name: `Logo ${nn}`, // the round switch already says which round
    description: null,
    image_url: image ?? `/logos/r2-logo-${nn}.svg`,
    data: fromRound1 ? { fromRound1 } : {},
    display_order: n,
    round: 2,
  }
}

const palette = (letter, name, description, colors, order, round = 1) => ({
  slug: round === 1 ? `palette-${letter.toLowerCase()}` : `r${round}-palette-${letter.toLowerCase()}`,
  type: 'palette',
  name,
  description,
  image_url: null,
  data: { label: `Palette ${letter}`, colors },
  display_order: order,
  round,
})

export const SEED_ITEMS = [
  logo(1),
  logo(2),
  logo(3),
  logo(4),
  logo(5),
  logo(6),
  logo(7),
  logo(8),
  logo(9),
  logo(10),

  r2Logo(1),
  r2Logo(2),
  r2Logo(3),
  r2Logo(4, { image: '/logos/logo-06.svg', fromRound1: 'Logo 06' }),
  r2Logo(5, { image: '/logos/logo-08.svg', fromRound1: 'Logo 08' }),

  palette('A', 'Crimson & Steel', null, [
    { name: 'Deep Crimson', hex: '#741734' },
    { name: 'Powder Blue', hex: '#9AB7D5' },
    { name: 'Bold Red', hex: '#DA1A10' },
    { name: 'Smoky Mauve', hex: '#806570' },
  ], 1),
  palette('B', 'Teal & Wild', null, [
    { name: 'Deep Teal', hex: '#0D555E' },
    { name: 'Chartreuse', hex: '#D5E272' },
    { name: 'Deep Plum', hex: '#4E374E' },
    { name: 'Soft Pink', hex: '#F095AD' },
    { name: 'Dark Amaranth', hex: '#761634' },
  ], 2),
  palette('C', 'Blush & Ember', null, [
    { name: 'Powder Blush', hex: '#FFB7B8' },
    { name: 'Icy Blue', hex: '#B7D9FF' },
    { name: 'Crimson Carrot', hex: '#FC4D16' },
    { name: 'Dark Amaranth', hex: '#6B2138' },
    { name: 'Golden Sand', hex: '#D1C360' },
    { name: 'Deep Mocha', hex: '#4C4241' },
  ], 3),
  palette('D', 'Bordeaux & Cream', null, [
    { name: 'Night Bordeaux', hex: '#3E1921' },
    { name: 'Dark Amaranth', hex: '#7E222F' },
    { name: 'Burnt Tangerine', hex: '#DA401E' },
    { name: 'Golden Earth', hex: '#8D6C05' },
    { name: 'Almond Cream', hex: '#EEE1D1' },
    { name: 'Cool Steel', hex: '#90ADBF' },
  ], 4),
  palette('E', 'Mahogany & Rose', null, [
    { name: 'Rich Mahogany', hex: '#370707' },
    { name: 'Pure Red', hex: '#F90102' },
    { name: 'Rose Punch', hex: '#D94383' },
    { name: 'Old Gold', hex: '#D4B906' },
    { name: 'Peach Glow', hex: '#F2B692' },
    { name: 'Porcelain', hex: '#FFFFF6' },
  ], 5),

  // Round 2 — revised palettes
  palette('A', 'Crimson & Steel', null, [
    { name: 'Deep Crimson', hex: '#741734' },
    { name: 'Bold Red', hex: '#DA1A10' },
    { name: 'Powder Blue', hex: '#9AB7D5' },
    { name: 'Chartreuse', hex: '#D5E272' },
    { name: 'Night Bordeaux', hex: '#3E1921' },
  ], 1, 2),
  palette('B', 'Bordeaux & Cream', null, [
    { name: 'Night Bordeaux', hex: '#3E1921' },
    { name: 'Dark Amaranth', hex: '#7E222F' },
    { name: 'Icy Blue', hex: '#B7D9FF' },
    { name: 'Old Gold', hex: '#D4B906' },
    { name: 'Almond Cream', hex: '#EEE1D1' },
  ], 2, 2),
  palette('C', 'Teal & Wild', null, [
    { name: 'Deep Teal', hex: '#0D555E' },
    { name: 'Chartreuse', hex: '#D5E272' },
    { name: 'Deep Crimson', hex: '#741734' },
    { name: 'Icy Blue', hex: '#B7D9FF' },
    { name: 'Deep Plum', hex: '#4E374E' },
  ], 3, 2),

  {
    slug: 'type-bodoni-inter',
    type: 'typography',
    name: 'Bodoni Moda + Inter',
    description: 'High-contrast Didone headlines with a clean, neutral sans for reading.',
    image_url: null,
    data: {
      headline: {
        role: 'Headline',
        family: 'Bodoni Moda',
        fallback: 'Didot, "Bodoni 72", serif',
        googleFont: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900',
        sample: 'Advocacy that moves the room.',
      },
      body: {
        role: 'Body',
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        googleFont: 'Inter:wght@400;500;600',
        sample:
          'Luna Civic Strategies helps mission-driven organizations turn conviction into policy. We build coalitions, sharpen the message, and stay in the room until the work is done — from first briefing to final vote.',
      },
    },
    display_order: 1,
    round: 1,
  },
]
