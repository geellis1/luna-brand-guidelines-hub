import { useEffect, useState } from 'react'
import { COLORS, textOn } from '../lib/brand'

export function BrandColors() {
  return (
    <section aria-labelledby="colors-title">
      <h1 id="colors-title" className="hub-heading">
        Brand colors
      </h1>
      <ul className="color-cards">
        {COLORS.map((color) => (
          <ColorCard key={color.hex} color={color} />
        ))}
      </ul>
    </section>
  )
}

function copyWithSelection(text) {
  const field = Object.assign(document.createElement('textarea'), { value: text, readOnly: true })
  field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.appendChild(field)
  field.select()
  const ok = document.execCommand('copy')
  field.remove()
  return ok
}

function ColorCard({ color }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
    } catch {
      // Clipboard API blocked: fall back to the older copy command.
      setCopied(copyWithSelection(color.hex))
    }
  }

  return (
    <li className="color-card" style={{ background: color.hex, color: textOn(color.hex) }}>
      <span className="color-card-name">{color.name}</span>
      {/* The whole bar is the copy button: the hex on the left, its status on the right. */}
      <button
        type="button"
        className="color-card-bar"
        onClick={copy}
        aria-label={`Copy ${color.name} hex code ${color.hex}`}
      >
        <span className="color-card-hex">{color.hex}</span>
        <span className="color-card-copy" aria-hidden="true">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      </button>
      <span className="visually-hidden" role="status">
        {copied ? `${color.hex} copied` : ''}
      </span>
    </li>
  )
}
