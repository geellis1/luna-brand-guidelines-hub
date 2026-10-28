import { useKeepSelectedVisible } from '../hooks/useKeepSelectedVisible'

const pad = (n) => String(n).padStart(2, '0')

// X axis: palette directions, each shown at a size that can be judged.
export function PaletteStrip({ palettes, selectedId, onSelect }) {
  const ref = useKeepSelectedVisible(selectedId)

  return (
    <div ref={ref} className="selector palette-strip" data-tour="viz-palettes" role="radiogroup" aria-label="Palette" style={{ '--count': palettes.length }}>
      {palettes.map((p, i) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={p.id === selectedId}
          className="selector-cell palette-option"
          onClick={() => onSelect(p)}
        >
          <span className="palette-caption">
            <span className="palette-number">{pad(i + 1)}</span>
            <span className="palette-name">{p.name}</span>
          </span>
          <span className="palette-swatches">
            {(p.data?.colors ?? []).map((c, j) => (
              <span key={c.hex + j} className="swatch" title={`${c.name} ${c.hex.toUpperCase()}`}>
                <span className="swatch-chip" style={{ background: c.hex }} />
                <span className="swatch-name">{c.name}</span>
              </span>
            ))}
          </span>
        </button>
      ))}
    </div>
  )
}
