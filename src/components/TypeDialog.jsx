import { useEffect, useRef } from 'react'
import { TypeSpecimen } from './TypeSpecimen'
import { CommentThread } from './CommentThread'

export function TypeDialog({ open, onClose, item, comments, ...threadProps }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialog dialog--wide" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog-inner">
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="eyebrow">Type pairing</p>
        <h2 className="dialog-title">{item.name}</h2>
        {item.description && <p className="dialog-copy">{item.description}</p>}
        <TypeSpecimen item={item} />
        <div className="dialog-thread">
          <CommentThread item={item} comments={comments} {...threadProps} />
        </div>
      </div>
    </dialog>
  )
}
