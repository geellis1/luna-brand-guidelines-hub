import { useEffect, useRef, useState } from 'react'
import { authorName, fullDate, relativeTime } from '../lib/format'
import { Avatar } from './Avatar'

// Compact thread: comments listed above a single-line input + Post button.
export function CommentThread({ item, comments, api, user, scroll = false }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const listRef = useRef(null)
  const offline = api.status === 'offline'

  // In scrolling threads, keep the newest comment in view.
  useEffect(() => {
    if (scroll && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [scroll, comments.length])

  async function submit(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    setError(null)
    try {
      await api.addComment(item.id, value)
      setText('')
    } catch (err) {
      setError(err.message ?? 'Could not post comment.')
    } finally {
      setSending(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.deleteComment(id)
    } catch (err) {
      setError(err.message ?? 'Could not delete comment.')
    }
  }

  return (
    <div className="thread">
      {comments.length === 0 ? (
        <p className="thread-empty">{offline ? 'Comments appear here once Supabase is connected.' : 'No comments yet.'}</p>
      ) : (
        <ol ref={listRef} className={`comments${scroll ? ' comments--scroll' : ''}`}>
          {comments.map((c) => {
            const name = authorName(c.author)
            return (
              <li key={c.id} className="comment">
                <Avatar name={name} />
                <div className="comment-main">
                  <div className="comment-meta">
                    <span className="comment-author" title={c.author?.email}>{name}</span>
                    <time dateTime={c.created_at} title={fullDate(c.created_at)}>
                      {relativeTime(c.created_at)}
                    </time>
                    {user?.id === c.user_id && (
                      <button type="button" className="link-button comment-delete" onClick={() => remove(c.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {user && !offline && (
        <form className="comment-form" onSubmit={submit}>
          <label className="visually-hidden" htmlFor={`comment-${item.id}`}>
            Comment on {item.name}
          </label>
          <input
            id={`comment-${item.id}`}
            type="text"
            autoComplete="off"
            placeholder={`Comment on ${item.name}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          <button type="submit" className="button button--small" disabled={!text.trim() || sending}>
            {sending ? 'Posting…' : 'Post'}
          </button>
        </form>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
