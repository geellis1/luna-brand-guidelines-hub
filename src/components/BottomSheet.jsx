import { useEffect, useRef, useState } from 'react'

const CLOSE_DRAG = 90 // px pulled down before letting go closes the sheet
const SLIDE_MS = 260

// Mobile bottom drawer: slides up when opened; drag the handle down, tap the
// backdrop, press Esc or the × to close.
export function BottomSheet({ open, onClose, title, children }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [offset, setOffset] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) {
      setOffset(0)
      setClosing(false)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Slide down first, then actually close.
  function dismiss() {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setOffset(0)
      onClose()
    }, SLIDE_MS)
  }

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return // let the × button click normally
    drag.current = { y: e.clientY, id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (drag.current?.id !== e.pointerId) return
    setOffset(Math.max(0, e.clientY - drag.current.y))
  }
  const onPointerUp = (e) => {
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    if (offset > CLOSE_DRAG) dismiss()
    else setOffset(0)
  }

  return (
    <dialog
      ref={ref}
      className={`sheet${closing ? ' sheet--closing' : ''}${offset ? ' sheet--dragging' : ''}`}
      style={offset ? { transform: `translateY(${offset}px)` } : undefined}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        dismiss()
      }}
      onClick={(e) => e.target === ref.current && dismiss()}
    >
      <div
        className="sheet-grip"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <span className="sheet-title">{title}</span>
          <button type="button" className="sheet-close" onClick={dismiss} aria-label="Close">
            ×
          </button>
        </div>
      </div>
      <div className="sheet-body">{children}</div>
    </dialog>
  )
}
