import { useEffect, useState } from 'react'
import { loadSvg } from '../lib/svg'

const EMPTY = { markup: null, hasAccent: false, failed: false }

// Loads an SVG for inline use. Pass null to skip (non-SVG logos).
export function useSvg(src) {
  const [state, setState] = useState({ ...EMPTY, src: null })

  useEffect(() => {
    if (!src) return
    let active = true
    loadSvg(src).then(
      (result) => active && setState({ ...result, failed: false, src }),
      () => active && setState({ ...EMPTY, failed: true, src }),
    )
    return () => {
      active = false
    }
  }, [src])

  // Never report a previous file's result for a new src.
  return state.src === src ? state : EMPTY
}
