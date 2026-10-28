import rawLogo from '../assets/luna_logo_1.svg?raw'
import { COLORS, textOn } from './brand'

// The logo has two groups, recoloured independently:
//   #luna-mark              LUNA letterforms
//   #civic-strategies-mark  CIVIC STRATEGIES letterforms
const VIEW_W = 1953
const VIEW_H = 695

// Logo markup with each group filled by `luna` / `civic`. Any CSS colour
// works, including var(...) for the live preview. Ids are stripped so the
// logo can appear several times on one page.
export function logoMarkup({ luna, civic, width, height }) {
  const svg = new DOMParser().parseFromString(rawLogo, 'image/svg+xml').documentElement
  svg.querySelector('#luna-mark').setAttribute('style', `fill: ${luna}`)
  svg.querySelector('#civic-strategies-mark').setAttribute('style', `fill: ${civic}`)
  svg.querySelectorAll('path').forEach((path) => path.removeAttribute('fill'))
  svg.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  if (width) svg.setAttribute('width', width)
  if (height) svg.setAttribute('height', height)
  return new XMLSerializer().serializeToString(svg)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not draw the logo.'))
    img.src = src
  })
}

const toBlob = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the PNG.'))), 'image/png'),
  )

// PNG of the logo at width × height (× pixelRatio for sharp, high-density
// screens), fitted and centred without distortion on a transparent canvas.
export async function logoPng({ luna, civic, width, height, pixelRatio = 2 }) {
  const [canvasW, canvasH] = [Math.round(width * pixelRatio), Math.round(height * pixelRatio)]
  const scale = Math.min(canvasW / VIEW_W, canvasH / VIEW_H)
  const [w, h] = [VIEW_W * scale, VIEW_H * scale]
  // Rasterise the vector at its final pixel size so edges stay crisp.
  const svg = logoMarkup({ luna, civic, width: w, height: h })
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const img = await loadImage(url)
    // A fresh canvas is fully transparent; nothing paints a background.
    const canvas = Object.assign(document.createElement('canvas'), { width: canvasW, height: canvasH })
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, (canvasW - w) / 2, (canvasH - h) / 2, w, h)
    return await toBlob(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

// A reference sheet: five colour blocks with names and hex codes.
export async function swatchSheetPng() {
  await Promise.all([document.fonts.load('64px ShunsineFont'), document.fonts.load('700 24px CotorisFont')])
  const [width, height, pad] = [2000, 1000, 80]
  const canvas = Object.assign(document.createElement('canvas'), { width, height })
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#F5F0E8'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#3E1921'
  ctx.font = '700 28px CotorisFont, sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('LUNA CIVIC STRATEGIES  ·  BRAND COLORS', pad, pad + 20)

  const top = pad + 80
  const gap = 24
  const blockW = (width - pad * 2 - gap * (COLORS.length - 1)) / COLORS.length
  const blockH = height - top - pad
  COLORS.forEach(({ name, hex }, i) => {
    const x = pad + i * (blockW + gap)
    ctx.fillStyle = hex
    ctx.beginPath()
    ctx.roundRect(x, top, blockW, blockH, 20)
    ctx.fill()

    // Light or dark label, whichever reads on this colour.
    ctx.fillStyle = textOn(hex)
    ctx.letterSpacing = '0px'
    ctx.font = 'italic 44px ShunsineFont, serif'
    ctx.fillText(name, x + 28, top + blockH - 76, blockW - 56)
    ctx.letterSpacing = '3px'
    ctx.font = '700 22px CotorisFont, sans-serif'
    ctx.fillText(hex, x + 28, top + blockH - 36)
  })
  return toBlob(canvas)
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
