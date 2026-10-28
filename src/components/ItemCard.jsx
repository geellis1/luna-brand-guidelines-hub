import { OriginTag } from './OriginTag'

// One option (logo or palette) with its name and notes beneath it.
export function ItemCard({ item, kicker, stageClass, children, onOpen, openLabel }) {
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
        </header>
        <OriginTag item={item} />
        {item.description && <p className="card-description">{item.description}</p>}
      </div>
    </article>
  )
}
