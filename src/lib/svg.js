// Loads logo SVGs for inline rendering so their fills can be recoloured.
//  • Dark fills (black, or any near-black hex like #020202 / #050402)
//    → `currentColor` (the mark colour).
//  • Red accent fills (#FF0000, #C21717) → `var(--logo-accent, currentColor)`,
//    so an accent element matches the mark unless an accent colour is set.
//  • Light details (#F5F5F5, white) are left alone.
// Resolves to { markup, hasAccent }. Results are cached per URL.

export const isSvgUrl = (src) => Boolean(src && /\.svg(\?|$)/i.test(src))

// Near-black: every channel at or below 0x20.
function isDarkFill(fill) {
  if (fill === 'black') return true
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(fill)
  if (!m) return false
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].every((i) => parseInt(hex.slice(i, i + 2), 16) <= 0x20)
}
const ACCENT_FILLS = new Set(['#ff0000', '#f00', 'red', '#c21717'])
const cache = new Map()

function prepare(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const svg = doc.documentElement
  if (svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) throw new Error('Not an SVG')

  // Defensive clean-up: no scripts, no event handlers, no external refs.
  doc.querySelectorAll('script, foreignObject').forEach((el) => el.remove())
  for (const el of doc.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
      if (/href$/i.test(attr.name) && !attr.value.startsWith('#')) el.removeAttribute(attr.name)
    }
  }

  let hasAccent = false
  for (const el of doc.querySelectorAll('[fill]')) {
    if (el.closest('clipPath, mask, defs')) continue
    const fill = el.getAttribute('fill').trim().toLowerCase()
    if (isDarkFill(fill)) {
      el.setAttribute('fill', 'currentColor')
    } else if (ACCENT_FILLS.has(fill)) {
      // CSS variables only work in style, not in the fill attribute.
      el.removeAttribute('fill')
      el.setAttribute('style', 'fill: var(--logo-accent, currentColor)')
      hasAccent = true
    }
  }

  // Scale to the wrapper; the viewBox keeps the proportions.
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  return { markup: new XMLSerializer().serializeToString(svg), hasAccent }
}

export function loadSvg(url) {
  if (!cache.has(url)) {
    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then(prepare)
    promise.catch(() => cache.delete(url)) // allow a retry later
    cache.set(url, promise)
  }
  return cache.get(url)
}
