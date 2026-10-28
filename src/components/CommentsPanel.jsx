import { useState } from 'react'
import { CommentThread } from './CommentThread'

// Tabbed comments that sit flush under the visualizer preview.
export function CommentsPanel({ tabs, commentsFor, ...threadProps }) {
  const [active, setActive] = useState(tabs[0].key)
  const tab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <section className="preview-comments" aria-label="Comments">
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={t.key === tab.key}
            aria-controls="comments-tabpanel"
            className="tab"
            onClick={() => setActive(t.key)}
          >
            {t.label} <span className="tab-count">{(commentsFor[t.item.id] ?? []).length}</span>
          </button>
        ))}
        <span className="tab-subject">{tab.subject}</span>
      </div>
      <div role="tabpanel" id="comments-tabpanel" aria-labelledby={`tab-${tab.key}`}>
        <CommentThread key={tab.item.id} item={tab.item} comments={commentsFor[tab.item.id] ?? []} scroll {...threadProps} />
      </div>
    </section>
  )
}
