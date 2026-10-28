import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SEED_ITEMS } from '../data/seedItems'

// Without Supabase, show the seed content read-only (ids = slugs).
const OFFLINE_ITEMS = SEED_ITEMS.map((item) => ({ ...item, id: item.slug }))

export function useBrandItems() {
  const [items, setItems] = useState(supabase ? [] : OFFLINE_ITEMS)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('brand_items')
      .select('*')
      .order('display_order')
      .then(({ data, error }) => {
        if (error) setError(error)
        else setItems(data)
        setLoading(false)
      })
  }, [])

  const byType = useMemo(() => {
    const groups = {}
    for (const item of items) (groups[item.type] ??= []).push(item)
    return groups
  }, [items])

  return { byType, loading, error }
}
