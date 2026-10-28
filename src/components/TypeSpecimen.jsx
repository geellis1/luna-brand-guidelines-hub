import { useEffect } from 'react'

function useGoogleFonts(fonts) {
  const families = fonts.map((f) => f?.googleFont).filter(Boolean)
  const key = families.join('|')
  useEffect(() => {
    if (!key) return
    const href = `https://fonts.googleapis.com/css2?${key.split('|').map((f) => `family=${f}`).join('&')}&display=swap`
    if (document.querySelector(`link[href="${href}"]`)) return
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
    document.head.appendChild(link)
  }, [key])
}

const stack = (font) => `"${font.family}", ${font.fallback ?? 'serif'}`

export function TypeSpecimen({ item }) {
  const { headline, body } = item.data ?? {}
  useGoogleFonts([headline, body])
  if (!headline || !body) return null

  return (
    <div className="stage stage--type">
      <div className="specimen">
        <p className="specimen-label">{headline.role} — {headline.family}</p>
        <h3 className="specimen-headline" style={{ fontFamily: stack(headline) }}>
          {headline.sample}
        </h3>
        <div className="specimen-glyphs" style={{ fontFamily: stack(headline) }} aria-hidden="true">
          Aa <em>Aa</em> 0123
        </div>

        <hr className="specimen-rule" />

        <p className="specimen-label">{body.role} — {body.family}</p>
        <p className="specimen-body" style={{ fontFamily: stack(body) }}>
          {body.sample}
        </p>
        <p className="specimen-body specimen-body--small" style={{ fontFamily: stack(body) }}>
          {body.sample}
        </p>
      </div>
    </div>
  )
}
