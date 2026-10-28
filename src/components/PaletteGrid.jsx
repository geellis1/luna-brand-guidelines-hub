import { luminance } from '../lib/format'
import { HeartIcon, XIcon } from './Icons'
import { ReactionTags } from './ReactionTags'

// Editorial mosaic on a 12-column grid: [column span, row span] per block.
// Each layout fills its rows exactly, so blocks vary in size with no gaps.
const LAYOUTS = {
  3: [[7, 2], [5, 1], [5, 1]],
  4: [[6, 2], [6, 1], [3, 1], [3, 1]],
  5: [[5, 2], [4, 1], [3, 1], [3, 1], [4, 1]],
  6: [[5, 2], [4, 1], [3, 2], [4, 1], [7, 1], [5, 1]],
  7: [[5, 2], [4, 1], [3, 2], [4, 1], [4, 1], [4, 1], [4, 1]],
}

export function PaletteGrid({ palette, reactions, user, onError }) {
  const colors = palette.data?.colors ?? []
  const layout = LAYOUTS[colors.length]

  const react = (hex, reaction) => reactions.toggleColor(palette.id, hex, reaction).catch(onError)

  return (
    <ul className="color-grid" aria-label={`${palette.name} colours`}>
      {colors.map((color, i) => {
        const [c, r] = layout?.[i] ?? [4, 1]
        const lum = luminance(color.hex)
        const list = reactions.forColor(palette.id, color.hex)
        const mine = list.find((x) => x.user_id === user?.id)?.reaction
        return (
          <li
            key={color.hex + i}
            className={`color-block${lum > 0.85 ? ' color-block--light' : ''}${r > 1 ? ' color-block--tall' : ''}`}
            style={{ background: color.hex, color: lum > 0.4 ? '#141414' : '#FAF8F3', '--c': c, '--r': r }}
          >
            <div className="color-block-top">
              <ReactionTags reactions={list} user={user} />
              {reactions.enabled && (
                <span className={`reaction-actions${mine ? ' reaction-actions--set' : ''}`}>
                  <button
                    type="button"
                    className="reaction-button"
                    aria-pressed={mine === 'heart'}
                    aria-label={`Love ${color.name}`}
                    title="Love it"
                    onClick={() => react(color.hex, 'heart')}
                  >
                    <HeartIcon filled={mine === 'heart'} />
                  </button>
                  <button
                    type="button"
                    className="reaction-button"
                    aria-pressed={mine === 'x'}
                    aria-label={`Rule out ${color.name}`}
                    title="Rule it out"
                    onClick={() => react(color.hex, 'x')}
                  >
                    <XIcon />
                  </button>
                </span>
              )}
            </div>
            <span className="color-name">{color.name}</span>
            <span className="color-hex">{color.hex.toUpperCase()}</span>
          </li>
        )
      })}
    </ul>
  )
}
