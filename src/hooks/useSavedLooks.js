import { useCallback } from 'react'
import { useLiveRows } from './useLiveRows'

export function useSavedLooks() {
  // '*' so loading still works before the accent_hex column migration runs.
  const { rows, status, insert, remove } = useLiveRows('saved_looks', '*')

  const saveLook = useCallback(
    ({ logo, palette, mark, accent }) =>
      insert({
        logo_id: logo.id,
        palette_id: palette.id,
        mark_hex: mark.hex,
        mark_name: mark.name,
        // Only sent when set, so plain looks save even without the new column.
        ...(accent && { accent_hex: accent.hex }),
      }),
    [insert],
  )

  return { looks: rows, status, saveLook, deleteLook: remove }
}
