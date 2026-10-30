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

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
    </svg>
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
      <div className="color-card-foot">
        <span className="color-card-hex">{color.hex}</span>
        <button
          type="button"
          className="copy-button"
          onClick={copy}
          aria-label={`Copy ${color.name} hex code ${color.hex}`}
          title="Copy hex"
        >
          {copied ? 'Copied!' : <CopyIcon />}
        </button>
      </div>
      <span className="visually-hidden" role="status">
        {copied ? `${color.hex} copied` : ''}
      </span>
    </li>
  )
}
