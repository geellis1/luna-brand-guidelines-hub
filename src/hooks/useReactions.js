import { useCallback, useMemo, useRef } from 'react'
import { useLiveRows } from './useLiveRows'

const normHex = (hex) => hex.toUpperCase()
const colorKey = (paletteId, hex) => `${paletteId}:${normHex(hex)}`

// Heart / X per colour and heart per palette, one per person, live.
export function useReactions(user) {
  const colors = useLiveRows('color_reactions', 'id, palette_id, color_hex, user_id, reaction, created_at')
  const palettes = useLiveRows('palette_reactions', 'id, palette_id, user_id, reaction, created_at')
  // Ignore taps while the previous one for the same target is in flight.
  const pending = useRef(new Set())
  const once = useCallback(async (key, fn) => {
    if (pending.current.has(key)) return
    pending.current.add(key)
    try {
      await fn()
    } finally {
      pending.current.delete(key)
    }
  }, [])

  const byColor = useMemo(() => {
    const groups = {}
    for (const r of colors.rows) (groups[colorKey(r.palette_id, r.color_hex)] ??= []).push(r)
    return groups
  }, [colors.rows])

  const byPalette = useMemo(() => {
    const groups = {}
    for (const r of palettes.rows) (groups[r.palette_id] ??= []).push(r)
    return groups
  }, [palettes.rows])

  const forColor = useCallback((paletteId, hex) => byColor[colorKey(paletteId, hex)] ?? [], [byColor])
  const forPalette = useCallback((paletteId) => byPalette[paletteId] ?? [], [byPalette])

  // Same icon again removes it; the opposite icon switches it.
  const toggleColor = useCallback(
    (paletteId, hex, reaction) =>
      once(colorKey(paletteId, hex), () => {
        const mine = forColor(paletteId, hex).find((r) => r.user_id === user?.id)
        if (!mine) return colors.insert({ palette_id: paletteId, color_hex: normHex(hex), reaction })
        if (mine.reaction === reaction) return colors.remove(mine.id)
        return colors.update(mine.id, { reaction })
      }),
    [colors, forColor, user, once],
  )

  const togglePalette = useCallback(
    (paletteId) =>
      once(paletteId, () => {
        const mine = forPalette(paletteId).find((r) => r.user_id === user?.id)
        return mine ? palettes.remove(mine.id) : palettes.insert({ palette_id: paletteId })
      }),
    [palettes, forPalette, user, once],
  )

  return {
    enabled: colors.status !== 'offline' && Boolean(user),
    forColor,
    forPalette,
    toggleColor,
    togglePalette,
  }
}
