import { useCallback, useMemo } from 'react'
import { useLiveRows } from './useLiveRows'

export function useComments() {
  const { rows, status, insert, remove } = useLiveRows('comments', 'id, item_id, user_id, parent_id, text, created_at')

  const byItem = useMemo(() => {
    const groups = {}
    for (const c of rows) (groups[c.item_id] ??= []).push(c)
    return groups
  }, [rows])

  const addComment = useCallback((itemId, text) => insert({ item_id: itemId, text }), [insert])

  return { byItem, status, addComment, deleteComment: remove }
}
