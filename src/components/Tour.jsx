import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Each step can switch view, lift elements (tagged data-tour="…") above the
// dimmed overlay, and anchor its card next to one of them. No anchor → centred.
const STEPS = [
  {
    title: 'Welcome',
    body: "Welcome to the Luna brand hub. This is a private space to explore logo directions, color palettes, and what feels right. Poke around, share your reactions, and don't hold back — that's what this is for.",
    cta: "Let's explore →",
    center: true,
  },
  {
    title: 'Logos',
    body: 'First stop: the logos. Click any one to see it up close. Drop your thoughts in the comments below each — they show up instantly for everyone in this space.',
    cta: 'Next →',
    view: 'logos',
    lift: ['tab-logos', 'logo-grid'],
    anchor: 'logo-grid',
    align: 'end', // keep clear of the highlighted tab on the left
    scroll: 'top',
  },
  {
    title: 'A note on type',
    body: "Most logos just show 'Luna' for now — no 'civic strategies' yet. That part comes later once we land on a direction and can find the perfect font pairing to go with it. One logo does include it as part of the mark though, so you can see how it could work.",
    cta: 'Got it →',
    view: 'logos',
    lift: ['logo-grid'],
    anchor: 'logo-grid',
    align: 'end', // keep clear of the highlighted tab on the left
    scroll: 'top',
  },
  {
    title: 'Palettes',
    body: "Now the fun part. These are the color palette directions. Heart the ones that feel right. X the ones that don't. Get as specific or as general as you want — every reaction counts.",
    cta: 'Next →',
    view: 'palettes',
    lift: ['tab-palettes', 'palette-sections'],
    anchor: 'palette-sections',
    align: 'end', // keep clear of the highlighted tab on the left
    scroll: 'top',
  },
  {
    title: 'Reactions',
    body: "Tap ♡ on a color you love. Tap ✕ on one that's not it. You can also heart the whole palette at once. Reactions are saved automatically and visible to everyone in this space as you make them.",
    cta: 'Next →',
    view: 'palettes',
    lift: ['palette-first'],
    anchor: 'palette-first',
    scroll: 'anchor',
    showReactions: true,
  },
  {
    title: 'Visualizer',
    body: 'This is where it gets interesting. Mix and match logos and palettes to see how they actually look together. Pick a logo on the left, a palette across the top, and see the combination come to life in the middle.',
    cta: 'Next →',
    view: 'visualizer',
    lift: ['tab-visualizer'],
    anchor: 'tab-visualizer',
    scroll: 'top',
  },
  {
    title: 'Choose a palette',
    body: 'Tap any palette across the top and its colors load right below the preview. Tap one of those colors to paint the logo in it.',
    cta: 'Next →',
    view: 'visualizer',
    lift: ['viz-palettes', 'mark-colors'],
    anchor: 'viz-palettes',
    scroll: 'fit', // keep the strip and the swatches below the preview on screen together
  },
  {
    title: 'See it in color',
    body: "Logos start in black and white so you can judge the shape on its own. When you're ready, use this toggle to switch the preview into color — and flip it back to B&W anytime.",
    cta: 'Next →',
    view: 'visualizer',
    lift: ['color-toggle'],
    anchor: 'color-toggle',
    scroll: 'anchor',
  },
  {
    title: 'Accent color',
    body: "On some logos you'll notice a second color option — this lets you give the accent element (like the moon) its own color separate from the main mark. It's optional, just play with it and see what you think.",
    cta: 'Next →',
    view: 'visualizer',
    lift: ['accent-picker'],
    anchor: 'accent-picker',
    scroll: 'anchor',
    // Ask the Visualizer to show a logo that has an accent, so the picker exists.
    event: 'luna:show-accent-logo',
  },
  {
    title: 'Saved looks',
    body: "Find something that clicks? Save it. Every saved combination gets collected so we can look back at what's resonating and build from there.",
    cta: 'Next →',
    view: 'visualizer',
    lift: ['save-look'],
    anchor: 'save-look',
    scroll: 'anchor',
  },
  {
    title: "You're all set",
    body: "One last thing — this space is live. Your comments, reactions, and saves are visible in real time to everyone with access. So go ahead, be opinionated. That's exactly what this is for. 🎉",
    cta: "Let's go →",
    center: true,
  },
]

const find = (id) => document.querySelector(`[data-tour="${id}"]`)
const MARGIN = 16
const MOBILE = 720

const sameRect = (a, b) =>
  a && b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height

export function Tour({ open, setView, onFinish }) {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [anchorRect, setAnchorRect] = useState(null)
  const [pos, setPos] = useState(null)
  const cardRef = useRef(null)
  const ctaRef = useRef(null)
  const step = STEPS[index]
  const last = index === STEPS.length - 1

  // Restart from the top whenever the tour opens, with no logo picked:
  // a ?logo= would open the Logos lightbox on top of the tour.
  useEffect(() => {
    if (!open) return
    setIndex(0)
    const url = new URL(window.location.href)
    for (const key of ['logo', 'mark', 'accent']) url.searchParams.delete(key)
    window.history.replaceState(null, '', url)
  }, [open])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.classList.add('touring')
    return () => root.classList.remove('touring', 'touring-reactions')
  }, [open])

  // Per step: switch view, wait for targets to render, scroll, lift them.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    let frame
    let lifted = []
    let tries = 0
    setReady(false)
    setAnchorRect(null)
    if (step.view) setView(step.view)
    if (step.event) setTimeout(() => window.dispatchEvent(new Event(step.event)), 0)
    document.documentElement.classList.toggle('touring-reactions', Boolean(step.showReactions))

    if (step.center) {
      setReady(true)
      return
    }

    const locate = () => {
      if (cancelled) return
      const els = step.lift.map(find).filter(Boolean)
      const anchor = find(step.anchor) ?? els[0]
      // Poll with a timer (not rAF, which stalls in background tabs);
      // after ~2.5s fall back to a centred card.
      if (!anchor && tries++ < 50) {
        frame = setTimeout(locate, 50)
        return
      }
      if (anchor) {
        let top
        if (step.scroll === 'top') top = 0
        else if (step.scroll === 'fit' && els.length) {
          // Frame every lifted element: centre them if they fit, else start near the top.
          const rects = els.map((el) => el.getBoundingClientRect())
          const first = Math.min(...rects.map((r) => r.top))
          const last = Math.max(...rects.map((r) => r.bottom))
          const room = window.innerHeight - (last - first)
          top = first + window.scrollY - Math.max(room / 2, 40)
        } else top = anchor.getBoundingClientRect().top + window.scrollY - 140
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
        els.forEach((el) => el.classList.add('tour-lifted'))
        lifted = els
      }
      setReady(true)
    }
    locate()

    return () => {
      cancelled = true
      clearTimeout(frame)
      lifted.forEach((el) => el.classList.remove('tour-lifted'))
    }
    // setView is stable; step is derived from index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index])

  // Follow the anchor as the page scrolls, resizes or settles.
  useEffect(() => {
    if (!open || !ready || step.center) return
    let raf
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = find(step.anchor) ?? find(step.lift[0])
        const r = el?.getBoundingClientRect()
        const next = r ? { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom } : null
        setAnchorRect((prev) => (sameRect(prev, next) ? prev : next))
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    const interval = setInterval(update, 400) // smooth-scroll and late layout shifts
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(interval)
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready, index])

  // Place the card just below (or above) the visible part of the anchor.
  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card || !anchorRect || window.innerWidth < MOBILE) {
      setPos(null)
      return
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = card.offsetWidth
    const h = card.offsetHeight
    const top = Math.max(anchorRect.top, 0)
    const bottom = Math.min(anchorRect.bottom, vh)
    let y
    if (vh - bottom >= h + MARGIN * 2) y = bottom + MARGIN
    else if (top >= h + MARGIN * 2) y = top - h - MARGIN
    else y = vh - h - MARGIN * 2 // anchor fills the screen: float near the bottom
    const ideal = step.align === 'end' ? anchorRect.left + anchorRect.width - w : anchorRect.left
    const x = Math.min(Math.max(ideal, MARGIN), vw - w - MARGIN)
    setPos((prev) => (prev && prev.x === x && prev.y === y ? prev : { x, y }))
  }, [anchorRect, index, ready])

  // Keyboard: Esc skips; focus lands on the main button each step.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onFinish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onFinish])

  useEffect(() => {
    if (open && ready) ctaRef.current?.focus({ preventScroll: true })
  }, [open, ready, index])

  if (!open) return null

  const centred = step.center || !anchorRect
  const placed = Boolean(pos) && !centred

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body">
      <div className="tour-overlay" />
      {ready && (
        <div
          key={index}
          ref={cardRef}
          className={`tour-card${centred ? ' tour-card--center' : ''}${placed ? ' tour-card--placed' : ''}`}
          style={placed ? { top: pos.y, left: pos.x } : undefined}
        >
          <div className="tour-card-top">
            <span className={step.center ? 'tour-title tour-title--big' : 'tour-title'} id="tour-title">
              {step.title}
            </span>
            <button type="button" className="link-button" onClick={onFinish}>
              Skip tour
            </button>
          </div>
          <p className="tour-body" id="tour-body">
            {step.body}
          </p>
          <div className="tour-card-foot">
            <span className="tour-count">
              {index + 1} of {STEPS.length}
            </span>
            <div className="tour-buttons">
              {index > 0 && (
                <button type="button" className="link-button" onClick={() => setIndex(index - 1)}>
                  Back
                </button>
              )}
              <button
                ref={ctaRef}
                type="button"
                className="button button--small"
                onClick={() => (last ? onFinish() : setIndex(index + 1))}
              >
                {step.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
