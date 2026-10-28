const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const STEPS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function relativeTime(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export function fullDate(iso) {
  return new Date(iso).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })
}

export function authorName(author) {
  if (!author) return 'Someone'
  return author.display_name || author.email?.split('@')[0] || 'Someone'
}

export function initials(name) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

// Relative luminance (WCAG) — used to pick legible label colours on swatches.
export function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
