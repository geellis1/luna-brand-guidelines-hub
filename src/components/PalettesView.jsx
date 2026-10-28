import { useState } from 'react'
import { CommentThread } from './CommentThread'
import { PaletteGrid } from './PaletteGrid'
import { ReactionTags } from './ReactionTags'
import { HeartIcon } from './Icons'

const pad = (n) => String(n).padStart(2, '0')

export function PalettesView({ palettes, reactions, commentsFor, ...threadProps }) {
  const [error, setError] = useState(null)
  const onError = (err) => setError(err.message ?? 'Could not save that reaction.')

  return (
    <div className="palette-sections" data-tour="palette-sections">
      {error && (
        <p className="form-error" role="alert">
          {error}{' '}
          <button type="button" className="link-button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}
      {palettes.map((palette, i) => {
        const comments = commentsFor[palette.id] ?? []
        const hearts = reactions.forPalette(palette.id)
        const loved = hearts.some((r) => r.user_id === threadProps.user?.id)
        return (
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
              <div className="palette-love">
                <ReactionTags reactions={hearts} user={threadProps.user} />
                {reactions.enabled && (
                  <button
                    type="button"
                    className="palette-heart"
                    aria-pressed={loved}
                    onClick={() => reactions.togglePalette(palette.id).catch(onError)}
                  >
                    <HeartIcon filled={loved} size={16} />
                    {loved ? 'Loved' : 'Love this palette'}
                  </button>
                )}
              </div>
            </header>

            <PaletteGrid palette={palette} reactions={reactions} user={threadProps.user} onError={onError} />

            <div className="palette-section-comments">
              <p className="card-count">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </p>
              <CommentThread item={palette} comments={comments} {...threadProps} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
