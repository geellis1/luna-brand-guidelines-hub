// The Luna palette, export sizes, and the light/dark text choice for each colour.

export const COLORS = [
  { name: 'Deep Crimson', hex: '#741734' },
  { name: 'Bold Red', hex: '#DA1A10' },
  { name: 'Powder Blue', hex: '#9AB7D5' },
  { name: 'Chartreuse', hex: '#D5E272' },
  { name: 'Night Bordeaux', hex: '#3E1921' },
]

export const BLACK = { name: 'Black', hex: '#000000' }
export const WHITE = { name: 'White', hex: '#FFFFFF' }
export const CREAM = '#F5F0E8'
export const BORDEAUX = '#3E1921'

export const SIZES = [
  { key: 'small', label: 'Small', width: 400, height: 133 },
  { key: 'medium', label: 'Medium', width: 800, height: 267 },
  { key: 'large', label: 'Large', width: 1600, height: 533 },
]

// WCAG relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Cream or Night Bordeaux, whichever reads better on `hex`.
export const textOn = (hex) => (contrast(hex, CREAM) >= contrast(hex, BORDEAUX) ? CREAM : BORDEAUX)
