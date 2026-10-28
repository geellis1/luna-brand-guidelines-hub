import { luminance } from '../lib/format'

// Editorial mosaic on a 12-column grid: [column span, row span] per block.
// Each layout fills its rows exactly, so blocks vary in size with no gaps.
const LAYOUTS = {
  3: [[7, 2], [5, 1], [5, 1]],
  4: [[6, 2], [6, 1], [3, 1], [3, 1]],
  5: [[5, 2], [4, 1], [3, 1], [3, 1], [4, 1]],
  6: [[5, 2], [4, 1], [3, 2], [4, 1], [7, 1], [5, 1]],
  7: [[5, 2], [4, 1], [3, 2], [4, 1], [4, 1], [4, 1], [4, 1]],
}

export function PaletteGrid({ palette }) {
  const colors = palette.data?.colors ?? []
  const layout = LAYOUTS[colors.length]

  return (
    <ul className="color-grid" aria-label={`${palette.name} colours`}>
      {colors.map((color, i) => {
        const [c, r] = layout?.[i] ?? [4, 1]
        const lum = luminance(color.hex)
        return (
          <li
            key={color.hex + i}
            className={`color-block${lum > 0.85 ? ' color-block--light' : ''}${r > 1 ? ' color-block--tall' : ''}`}
            style={{ background: color.hex, color: lum > 0.4 ? '#141414' : '#FAF8F3', '--c': c, '--r': r }}
          >
            <span className="color-name">{color.name}</span>
            <span className="color-hex">{color.hex.toUpperCase()}</span>
          </li>
        )
      })}
    </ul>
  )
}
