import { PaletteGrid } from './PaletteGrid'

const pad = (n) => String(n).padStart(2, '0')

export function PalettesView({ palettes }) {
  return (
    <div className="palette-sections" data-tour="palette-sections">
      {palettes.map((palette, i) => (
        <section
          key={palette.id}
          className="palette-section"
          id={palette.slug}
          aria-labelledby={`${palette.slug}-title`}
          data-tour={i === 0 ? 'palette-first' : undefined}
        >
          <header className="palette-section-head">
            <div>
              <span className="card-kicker">Palette {pad(i + 1)}</span>
              <h2 className="palette-section-title" id={`${palette.slug}-title`}>
                {palette.name}
              </h2>
              {palette.description && <p className="card-description">{palette.description}</p>}
            </div>
          </header>

          <PaletteGrid palette={palette} />
        </section>
      ))}
    </div>
  )
}
