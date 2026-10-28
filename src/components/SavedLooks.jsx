import { authorName } from '../lib/format'
import { LogoMark } from './LogoMark'

const pad = (n) => String(n).padStart(2, '0')
const roundOf = (item) => item?.round ?? 1

// "R2", or "R1 logo · R2 palette" when a look mixes rounds.
function roundTag(logo, palette) {
  const lr = roundOf(logo)
  const pr = roundOf(palette)
  return lr === pr ? `Round ${lr}` : `R${lr} logo · R${pr} palette`
}

export function SavedLooks({ looks, logos, palettes, user, onOpen, onDelete, currentId, showRounds = false }) {
  const resolved = looks
    .map((look) => {
      const logo = logos.find((l) => l.id === look.logo_id)
      const palette = palettes.find((p) => p.id === look.palette_id)
      // Palette numbers count within their own round (Round 2 has its own 01–03).
      const paletteIndex = palette ? palettes.filter((p) => roundOf(p) === roundOf(palette)).indexOf(palette) : -1
      return { look, logo, palette, paletteIndex }
    })
    .filter((r) => r.logo && r.paletteIndex >= 0)
    .reverse() // newest first

  return (
    <section className="saved" aria-labelledby="saved-title">
      <h2 className="section-label" id="saved-title">
        Saved looks <span className="muted">{resolved.length}</span>
      </h2>
      {resolved.length === 0 ? (
        <p className="thread-empty">Nothing saved yet. Pick a logo, palette and mark colour, then "Save this look".</p>
      ) : (
        <ul className="saved-row">
          {resolved.map(({ look, logo, palette, paletteIndex }) => (
            <li key={look.id} className="saved-item">
              <button
                type="button"
                className="saved-thumb"
                aria-current={look.id === currentId}
                onClick={() => onOpen(look)}
                title={`Open ${logo.name} · Palette ${pad(paletteIndex + 1)} · ${look.mark_name ?? look.mark_hex}${look.accent_hex ? ` + ${look.accent_hex} accent` : ''}`}
              >
                <LogoMark item={logo} color={look.mark_hex} accent={look.accent_hex} className="logo-mark--saved" />
              </button>
              <div className="saved-caption">
                <span>
                  {logo.name.replace(/^Logo /, '')} · P{pad(paletteIndex + 1)}
                  <span className="saved-dot" style={{ background: look.mark_hex }} aria-hidden="true" />
                  {look.accent_hex && <span className="saved-dot saved-dot--accent" style={{ background: look.accent_hex }} aria-hidden="true" />}
                </span>
                {showRounds && <span className="saved-round">{roundTag(logo, palette)}</span>}
                <span className="muted">{authorName(look.author)}</span>
              </div>
              {user?.id === look.user_id && (
                <button
                  type="button"
                  className="saved-delete"
                  aria-label="Delete saved look"
                  onClick={() => window.confirm('Delete this saved look?') && onDelete(look.id)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
