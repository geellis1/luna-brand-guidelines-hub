import { CommentThread } from './CommentThread'
import { OriginTag } from './OriginTag'

// One option (logo or palette) with its comment thread attached beneath it.
export function ItemCard({ item, kicker, stageClass, children, comments, onOpen, openLabel, ...threadProps }) {
  return (
    <article className="card" id={item.slug}>
      {onOpen ? (
        <button type="button" className={`card-stage card-stage--button ${stageClass}`} onClick={onOpen} aria-label={openLabel}>
          {children}
          <span className="card-expand" aria-hidden="true">
            ⤢
          </span>
        </button>
      ) : (
        <div className={`card-stage ${stageClass}`}>{children}</div>
      )}
      <div className="card-body">
        <header className="card-head">
          <h3 className="card-title">
            {kicker && <span className="card-kicker">{kicker}</span>}
            {item.name}
          </h3>
          <span className="card-count">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </header>
        <OriginTag item={item} />
        {item.description && <p className="card-description">{item.description}</p>}
        <CommentThread item={item} comments={comments} {...threadProps} />
      </div>
    </article>
  )
}
