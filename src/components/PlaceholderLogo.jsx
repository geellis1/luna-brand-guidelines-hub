import { useId } from 'react'

// Generic stand-in marks until real logo files are uploaded.
// Deliberately plain and equal in weight so none reads as a favourite.
// Drawn in currentColor so the explorer can recolour them per palette.
const INK = 'currentColor'

const marks = (maskId) => ({
  crescent: (
    <>
      <mask id={maskId}>
        <rect width="240" height="240" fill="#fff" />
        <circle cx="146" cy="104" r="68" fill="#000" />
      </mask>
      <circle cx="120" cy="120" r="80" fill={INK} mask={`url(#${maskId})`} />
    </>
  ),
  monogram: (
    <>
      <rect x="44" y="44" width="152" height="152" fill="none" stroke={INK} strokeWidth="8" />
      <rect x="86" y="76" width="18" height="90" fill={INK} />
      <rect x="86" y="148" width="68" height="18" fill={INK} />
    </>
  ),
  arch: <path d="M52 196 V122 a68 68 0 0 1 136 0 V196 H152 V122 a32 32 0 0 0 -64 0 V196 Z" fill={INK} />,
  stacked: (
    <>
      <rect x="40" y="64" width="160" height="24" fill={INK} />
      <rect x="64" y="108" width="112" height="24" fill={INK} />
      <rect x="88" y="152" width="64" height="24" fill={INK} />
    </>
  ),
  orbit: (
    <>
      <circle cx="120" cy="120" r="76" fill="none" stroke={INK} strokeWidth="6" />
      <circle cx="120" cy="120" r="34" fill={INK} />
      <circle cx="174" cy="66" r="12" fill={INK} />
    </>
  ),
  diamond: (
    <>
      <rect x="62" y="62" width="116" height="116" fill="none" stroke={INK} strokeWidth="8" transform="rotate(45 120 120)" />
      <circle cx="120" cy="120" r="18" fill={INK} />
    </>
  ),
  split: (
    <>
      <circle cx="120" cy="120" r="76" fill="none" stroke={INK} strokeWidth="8" />
      <path d="M120 44 a76 76 0 0 1 0 152 Z" fill={INK} />
    </>
  ),
  ring: (
    <>
      <circle cx="120" cy="120" r="78" fill="none" stroke={INK} strokeWidth="22" />
      <circle cx="120" cy="120" r="30" fill="none" stroke={INK} strokeWidth="8" />
    </>
  ),
  triad: (
    <>
      <circle cx="120" cy="78" r="30" fill={INK} />
      <circle cx="82" cy="146" r="30" fill={INK} />
      <circle cx="158" cy="146" r="30" fill={INK} />
    </>
  ),
})

// `wide` draws the mark centred in the 2172×724 frame the real wordmarks use,
// so placeholders size exactly like artwork everywhere in the app.
export function PlaceholderLogo({ variant, title, wide = false }) {
  const set = marks('m' + useId().replace(/[^a-zA-Z0-9_-]/g, ''))
  const mark = set[variant] ?? set.orbit
  if (wide) {
    const size = 560
    const scale = size / 240
    return (
      <svg className="placeholder-logo" viewBox="0 0 2172 724" role="img" aria-label={title}>
        <g transform={`translate(${(2172 - size) / 2} ${(724 - size) / 2}) scale(${scale})`}>{mark}</g>
      </svg>
    )
  }
  return (
    <svg className="placeholder-logo" viewBox="0 0 240 240" role="img" aria-label={title}>
      {mark}
    </svg>
  )
}
