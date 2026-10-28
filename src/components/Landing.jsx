import { useEffect, useState } from 'react'
import { HUB_PASSWORD } from '../hooks/useHubAccess'

// Each word types in its brand face: Shunsine for the name, Cotoris for the rest.
// `line` groups words, so CIVIC STRATEGIES sits on one line beneath LUNA.
const WORDS = [
  { text: 'LUNA', font: 'shunsine', line: 0 },
  { text: 'CIVIC', font: 'cotoris', line: 1 },
  { text: 'STRATEGIES', font: 'cotoris', line: 1 },
]
const LENGTHS = WORDS.map((w) => w.text.length)
const LINES = [0, 1].map((line) => WORDS.map((w, i) => ({ ...w, i })).filter((w) => w.line === line))

// Unhurried timing: a soft start, an even typing pace, a breath between words.
const START_DELAY = 700
const CHAR_MS = 100
const WORD_PAUSE = 360
const TAGLINE_AFTER = 450
const FORM_AFTER = 1300

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Types each word in turn; returns characters shown per word and whether it's finished.
function useTypewriter(lengths, skip) {
  const [counts, setCounts] = useState(() => lengths.map(() => 0))
  const done = counts.every((n, i) => n === lengths[i])

  useEffect(() => {
    if (skip) {
      setCounts([...lengths])
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
      if (char < lengths[word]) {
        // Slight variation keeps it feeling hand-typed rather than mechanical.
        timer = setTimeout(tick, CHAR_MS + Math.random() * 40 - 20)
      } else if (word < lengths.length - 1) {
        word += 1
        char = 0
        timer = setTimeout(tick, WORD_PAUSE)
      }
    }
    timer = setTimeout(tick, START_DELAY)
    return () => clearTimeout(timer)
  }, [lengths, skip])

  return { counts, done }
}

// Entry point for visitors without access: collage, typed masthead, shared password.
export function Landing({ onUnlock }) {
  const [skip, setSkip] = useState(prefersReducedMotion)
  const { counts, done } = useTypewriter(LENGTHS, skip)
  const [stage, setStage] = useState(skip ? 'form' : 'typing') // typing → tagline → form

  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [shaking, setShaking] = useState(false)

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
  const active = counts.findIndex((n, i) => n < LENGTHS[i])
  const cursorAt = done ? -1 : active

  return (
    <main className={`landing landing--${stage}`}>
      <div className="landing-art">
        <img
          className="landing-image"
          src="/images/landing-collage.webp"
          width="1254"
          height="1254"
          alt="Editorial collage: a 1950s woman in a tweed jacket studies paint swatches behind a bank of press microphones, surrounded by torn paper, the Capitol dome and crowd photographs."
          fetchPriority="high"
        />
      </div>

      <div className="landing-copy-col">
        <h1 className="landing-title" aria-label="Luna Civic Strategies">
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

        <p className="landing-copy">Luna Civic Strategies · Brand Hub</p>

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
