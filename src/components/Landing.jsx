import { useEffect, useRef, useState } from 'react'
import { HUB_PASSWORD } from '../hooks/useHubAccess'
import { LandingGoddess } from './LandingGoddess'

// Each word types in its brand face: Shunsine for the name, Cotoris for the rest.
// `line` groups words, so CIVIC STRATEGIES sits on one line beneath LUNA.
// `charMs` paces each word: LUNA is slow (~1.5s), the rest types briskly.
const WORDS = [
  { text: 'LUNA', font: 'shunsine', line: 0, charMs: 450 },
  { text: 'CIVIC', font: 'cotoris', line: 1, charMs: 100 },
  { text: 'STRATEGIES', font: 'cotoris', line: 1, charMs: 100 },
]
const LINES = [0, 1].map((line) => WORDS.map((w, i) => ({ ...w, i })).filter((w) => w.line === line))

// LUNA starts typing at 0.5s, alongside the goddess reveal; a breath between
// words; then the tagline, and the form 500ms after that.
const START_DELAY = 500
const WORD_PAUSE = 360
const TAGLINE_AFTER = 300
const FORM_AFTER = 500

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Types each word in turn; returns characters shown per word and whether it's finished.
function useTypewriter(words, skip) {
  const [counts, setCounts] = useState(() => words.map(() => 0))
  const done = counts.every((n, i) => n === words[i].text.length)

  useEffect(() => {
    if (skip) {
      setCounts(words.map((w) => w.text.length))
      return
    }
    let timer
    let word = 0
    let char = 0
    const tick = () => {
      char += 1
      // Capture now: the updater runs later, after word/char may have moved on.
      const [w, c] = [word, char]
      setCounts((prev) => prev.map((n, i) => (i === w ? c : n)))
      if (char < words[word].text.length) {
        // Slight variation keeps it feeling hand-typed rather than mechanical.
        timer = setTimeout(tick, words[word].charMs + Math.random() * 40 - 20)
      } else if (word < words.length - 1) {
        word += 1
        char = 0
        timer = setTimeout(tick, WORD_PAUSE)
      }
    }
    timer = setTimeout(tick, START_DELAY)
    return () => clearTimeout(timer)
  }, [words, skip])

  return { counts, done }
}

// Gap between LUNA and CIVIC STRATEGIES as a share of LUNA's letter height,
// taken from the logo SVG (64 units of space under 492-unit-tall letters).
const LOCKUP_GAP = 64 / 492

// Fits the CIVIC STRATEGIES line to the LUNA line like the logo: letter-spacing
// so the letters start and end exactly where LUNA's do, and a tight logo gap.
// Measures the letter shapes themselves (not their boxes), so the two fonts'
// different side bearings and ascents don't throw it off.
function useLockup(titleRef) {
  useEffect(() => {
    const [luna, civic] = titleRef.current.querySelectorAll('.landing-line')
    const ctx = document.createElement('canvas').getContext('2d')
    const measure = (el, text) => {
      const cs = getComputedStyle(el)
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const m = ctx.measureText(text)
      const lineHeight = parseFloat(cs.lineHeight)
      // Where the baseline sits inside the line box.
      const baseline = (lineHeight - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent
      return {
        left: -m.actualBoundingBoxLeft,
        right: m.actualBoundingBoxRight,
        ascent: m.actualBoundingBoxAscent,
        descent: m.actualBoundingBoxDescent,
        lineHeight,
        baseline,
      }
    }
    const fit = () => {
      const text = 'CIVIC STRATEGIES'
      civic.style.letterSpacing = '0px'
      civic.style.marginLeft = '0px'
      const l = measure(luna, 'LUNA')
      const c = measure(civic, text)
      const spacing = (l.right - l.left - (c.right - c.left)) / (text.length - 1)
      const gap = LOCKUP_GAP * (l.ascent + l.descent)
      civic.style.letterSpacing = `${spacing}px`
      civic.style.marginLeft = `${l.left - c.left}px`
      civic.style.marginTop = `${gap - l.lineHeight + l.baseline + l.descent - c.baseline + c.ascent}px`
    }
    fit()
    document.fonts.ready.then(fit)
    document.fonts.addEventListener('loadingdone', fit)
    window.addEventListener('resize', fit)
    return () => {
      document.fonts.removeEventListener('loadingdone', fit)
      window.removeEventListener('resize', fit)
    }
  }, [titleRef])
}

// Entry point for visitors without access: goddess, typed masthead, shared password.
export function Landing({ onUnlock }) {
  const [skip, setSkip] = useState(prefersReducedMotion)
  const { counts, done } = useTypewriter(WORDS, skip)
  const [stage, setStage] = useState(skip ? 'form' : 'typing') // typing → tagline → form

  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [shaking, setShaking] = useState(false)
  const titleRef = useRef(null)
  useLockup(titleRef)

  useEffect(() => {
    if (!done) return
    if (skip) return setStage('form')
    const t1 = setTimeout(() => setStage('tagline'), TAGLINE_AFTER)
    const t2 = setTimeout(() => setStage('form'), TAGLINE_AFTER + FORM_AFTER)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [done, skip])

  // A click or key press while it's still typing jumps straight to the end.
  useEffect(() => {
    if (stage === 'form') return
    const finish = () => setSkip(true)
    window.addEventListener('pointerdown', finish, { once: true })
    window.addEventListener('keydown', finish, { once: true })
    return () => {
      window.removeEventListener('pointerdown', finish)
      window.removeEventListener('keydown', finish)
    }
  }, [stage])

  function submit(e) {
    e.preventDefault()
    if (HUB_PASSWORD && password === HUB_PASSWORD) return onUnlock()
    setError(HUB_PASSWORD ? 'Incorrect password' : 'No hub password is set yet (VITE_HUB_PASSWORD).')
    setShaking(true)
  }

  // Index of the word currently being typed (the cursor sits after it).
  const active = counts.findIndex((n, i) => n < WORDS[i].text.length)
  const cursorAt = done ? -1 : active

  return (
    <main className={`landing landing--${stage}`}>
      <div className="landing-art">
        <LandingGoddess skip={skip} />
      </div>

      <div className="landing-copy-col">
        <h1 ref={titleRef} className="landing-title" aria-label="Luna Civic Strategies">
          {LINES.map((words) => (
            <span key={words[0].text} className={`landing-line landing-line--${words[0].font}`} aria-hidden="true">
              {words.map(({ text, i }, n) => (
                <span key={text}>
                  {n > 0 && ' '}
                  <span>{text.slice(0, counts[i])}</span>
                  {cursorAt === i && <span className="type-cursor" />}
                  {/* The untyped remainder holds the line's width so nothing shifts. */}
                  <span className="type-ghost">{text.slice(counts[i])}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="landing-copy">Your brand hub. Built for the work ahead.</p>

        <div className="landing-form-wrap" aria-hidden={stage !== 'form'}>
          <form className="landing-form" onSubmit={submit}>
            <label className="visually-hidden" htmlFor="landing-password">
              Password
            </label>
            <input
              id="landing-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter password"
              className={shaking ? 'is-shaking' : undefined}
              onAnimationEnd={() => setShaking(false)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'landing-error' : undefined}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
            />
            <button type="submit" className="button landing-enter">
              Enter
            </button>
          </form>
          {error && (
            <p id="landing-error" className="landing-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
