import { useEffect, useRef } from 'react'
import { CommentThread } from './CommentThread'
import { LogoMark } from './LogoMark'
import { OriginTag } from './OriginTag'

const pad = (n) => String(n).padStart(2, '0')

function isTyping(target) {
  return target.closest?.('input, textarea, select, [contenteditable]')
}

// Large view of one logo with its comment thread; ←/→ step through logos.
export function LogoLightbox({ logos, index, onNavigate, onClose, onOpenInVisualizer, comments, ...threadProps }) {
  const ref = useRef(null)
  const logo = logos[index]
  const open = Boolean(logo)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const step = (delta) => onNavigate(logos[(index + delta + logos.length) % logos.length])

  function onKeyDown(e) {
    if (isTyping(e.target)) return
    if (e.key === 'ArrowLeft') step(-1)
    if (e.key === 'ArrowRight') step(1)
  }

  return (
    <dialog
      ref={ref}
      className="dialog lightbox"
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={logo ? `${logo.name}, larger view` : undefined}
    >
      {logo && (
        <div className="lightbox-inner">
          <header className="lightbox-head">
            <span className="card-kicker">
              {pad(index + 1)} / {pad(logos.length)}
            </span>
            <h2 className="lightbox-title">{logo.name}</h2>
            <OriginTag item={logo} />
            <div className="lightbox-actions">
              <button type="button" className="link-button" onClick={() => onOpenInVisualizer(logo)}>
                Open in Visualizer →
              </button>
              <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
          </header>

          <div className="lightbox-stage">
            <button type="button" className="lightbox-nav lightbox-nav--prev" onClick={() => step(-1)} aria-label="Previous logo">
              ‹
            </button>
            <LogoMark item={logo} color="#020202" className="logo-mark--lightbox" />
            <button type="button" className="lightbox-nav lightbox-nav--next" onClick={() => step(1)} aria-label="Next logo">
              ›
            </button>
          </div>

          <div className="lightbox-comments">
            <p className="card-count">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
            <CommentThread key={logo.id} item={logo} comments={comments} scroll {...threadProps} />
          </div>
        </div>
      )}
    </dialog>
  )
}
