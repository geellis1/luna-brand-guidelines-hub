import { useEffect, useRef, useState } from 'react'

const SRC = '/images/luna-goddess.svg'
// Paths fade in top to bottom in small groups: the last group starts at
// REVEAL_MS and each takes FADE_MS, so the whole reveal lands at ~4s.
const GROUPS = 48
const REVEAL_MS = 3300
const FADE_MS = 700

// The goddess line art, inlined so CSS can recolour and reveal her paths.
// Phases: loading → revealing → shown (fully visible, breathing).
export function LandingGoddess({ skip }) {
  const ref = useRef(null)
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    let active = true
    fetch(SRC)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${SRC}`)
        return res.text()
      })
      .then((text) => {
        if (!active) return
        // Our own static file. Paths start hidden via CSS, so nothing flashes.
        const host = ref.current
        host.innerHTML = text
        const svg = host.querySelector('svg')
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        svg.setAttribute('focusable', 'false')

        // Regroup the paths into top-to-bottom bands, so 48 groups animate
        // instead of 2,367 paths. Every path is the same cream, so the
        // change in stacking order can't be seen.
        const root = host.querySelector('#luna-goddess')
        const paths = [...root.querySelectorAll('path')]
        const byTop = paths.map((path) => ({ path, top: path.getBBox().y })).sort((a, b) => a.top - b.top)
        const size = Math.ceil(byTop.length / GROUPS)
        const step = REVEAL_MS / (GROUPS - 1)
        for (let g = 0; g * size < byTop.length; g++) {
          const band = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          band.style.animationDelay = `${g * step}ms`
          for (const { path } of byTop.slice(g * size, (g + 1) * size)) band.appendChild(path)
          root.appendChild(band)
        }
        setPhase('revealing')
      })
      .catch(() => active && setPhase('shown'))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return
    if (skip) return setPhase('shown')
    const timer = setTimeout(() => setPhase('shown'), REVEAL_MS + FADE_MS)
    return () => clearTimeout(timer)
  }, [phase, skip])

  return <div ref={ref} className={`landing-goddess landing-goddess--${phase}`} aria-hidden="true" />
}
