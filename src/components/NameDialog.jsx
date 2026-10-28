import { useEffect, useRef, useState } from 'react'

export function NameDialog({ open, onClose, initialName, onSave, required }) {
  const ref = useRef(null)
  const [name, setName] = useState(initialName ?? '')
  const [state, setState] = useState({ busy: false, error: null })

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) {
      setName(initialName ?? '')
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, initialName])

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setState({ busy: true, error: null })
    try {
      await onSave(name)
      // Reload so every comment and reaction tag picks up the new name.
      window.location.reload()
    } catch (err) {
      setState({ busy: false, error: err.message ?? 'Could not save your name.' })
    }
  }

  return (
    <dialog ref={ref} className="dialog dialog--small" onClose={onClose}>
      <form className="dialog-inner" onSubmit={submit}>
        <h2 className="dialog-title">{required ? 'What should we call you?' : 'Your name'}</h2>
        <p className="dialog-copy">Shown with your comments, reactions and saved looks — so everyone can tell whose is whose.</p>
        <label className="visually-hidden" htmlFor="display-name">
          Your name
        </label>
        <div className="comment-form">
          <input
            id="display-name"
            autoFocus
            autoComplete="name"
            placeholder="e.g. Kelli"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="button button--small" disabled={!name.trim() || state.busy}>
            {state.busy ? 'Saving…' : 'Save'}
          </button>
        </div>
        {state.error && <p className="form-error">{state.error}</p>}
        <button type="button" className="link-button dialog-later" onClick={onClose}>
          {required ? 'Later' : 'Cancel'}
        </button>
      </form>
    </dialog>
  )
}
