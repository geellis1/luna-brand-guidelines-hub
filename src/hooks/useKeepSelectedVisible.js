import { useEffect, useRef } from 'react'

// For selectors that scroll sideways on narrow screens: keep the selected
// cell centred. Jumps on first render (a shared link), glides afterwards.
export function useKeepSelectedVisible(selectedId) {
  const ref = useRef(null)
  const mounted = useRef(false)

  useEffect(() => {
    const strip = ref.current
    const el = strip?.querySelector('[aria-checked="true"]')
    if (!el || strip.scrollWidth <= strip.clientWidth) return
    const left = el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2
    strip.scrollTo({ left, behavior: mounted.current ? 'smooth' : 'instant' })
    mounted.current = true
  }, [selectedId])

  return ref
}
