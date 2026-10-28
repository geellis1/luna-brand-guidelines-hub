import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const byCreated = (a, b) => a.created_at.localeCompare(b.created_at)

function mergeById(prev, incoming) {
  const map = new Map(prev.map((r) => [r.id, r]))
  for (const r of incoming) map.set(r.id, { ...map.get(r.id), ...r })
  return [...map.values()].sort(byCreated)
}

// Loads every row of a table (with its author profile) and keeps the list
// live through a realtime channel. Shared by comments, saved looks and reactions.
export function useLiveRows(table, columns) {
  const select = `${columns}, author:profiles(display_name, email)`
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState(supabase ? 'loading' : 'offline')
  const profiles = useRef(new Map())

  // Realtime rows don't include the joined profile, so look it up (cached).
  const withAuthor = useCallback(async (row) => {
    if (!profiles.current.has(row.user_id)) {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', row.user_id)
        .maybeSingle()
      profiles.current.set(row.user_id, data)
    }
    return { ...row, author: profiles.current.get(row.user_id) }
  }, [])

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase
      .from(table)
      .select(select)
      .order('created_at')
      .then(({ data, error }) => {
        if (!active) return
        if (error) return setStatus('error')
        for (const r of data) profiles.current.set(r.user_id, r.author)
        setRows((prev) => mergeById(prev, data))
        setStatus('ready')
      })

    const channel = supabase
      .channel(`${table}-live`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          setRows((prev) => prev.filter((r) => r.id !== payload.old.id))
          return
        }
        const row = await withAuthor(payload.new)
        if (active) setRows((prev) => mergeById(prev, [row]))
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [table, select, withAuthor])

  const insert = useCallback(
    async (values) => {
      const { data, error } = await supabase.from(table).insert(values).select(select).single()
      if (error) throw error
      // Show it immediately; the realtime echo is de-duplicated by id.
      setRows((prev) => mergeById(prev, [data]))
      return data
    },
    [table, select],
  )

  const update = useCallback(
    async (id, values) => {
      const { data, error } = await supabase.from(table).update(values).eq('id', id).select(select).single()
      if (error) throw error
      setRows((prev) => mergeById(prev, [data]))
      return data
    },
    [table, select],
  )

  const remove = useCallback(
    async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      setRows((prev) => prev.filter((r) => r.id !== id))
    },
    [table],
  )

  return { rows, status, insert, update, remove }
}
