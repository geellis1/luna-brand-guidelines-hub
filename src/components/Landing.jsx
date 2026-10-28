import { useEffect, useState } from 'react'

const WORDS = ['Luna', 'Civic', 'Strategies']

// Unhurried timing: a soft start, an even typing pace, a breath between words.
const START_DELAY = 700
const CHAR_MS = 100
const WORD_PAUSE = 360
const TAGLINE_AFTER = 450
const FORM_AFTER = 1300

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Types each word in turn; returns characters shown per word and whether it's finished.
function useTypewriter(words, skip) {
  const [counts, setCounts] = useState(() => words.map(() => 0))
  const done = counts.every((n, i) => n === words[i].length)

  useEffect(() => {
    if (skip) {
      setCounts(words.map((w) => w.length))
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
      if (char < words[word].length) {
        // Slight variation keeps it feeling hand-typed rather than mechanical.
        timer = setTimeout(tick, CHAR_MS + Math.random() * 40 - 20)
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

// Entry point for signed-out visitors: collage, typed masthead, email + password form.
export function Landing({ auth }) {
  const [skip, setSkip] = useState(prefersReducedMotion)
  const { counts, done } = useTypewriter(WORDS, skip)
  const [stage, setStage] = useState(skip ? 'form' : 'typing') // typing → tagline → form

  const [mode, setMode] = useState('signup') // signup | signin
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState('idle') // idle | sending
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const switchMode = (next, message = null) => {
    setMode(next)
    setError(null)
    setNotice(message)
  }

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

  async function submit(e) {
    e.preventDefault()
    setState('sending')
    setError(null)
    setNotice(null)
    const cleanEmail = email.trim()
    try {
      if (mode === 'signup') {
        await auth.signUpWithPassword(cleanEmail, password, name.trim())
        // Signed in straight away; the app takes over from here.
      } else {
        await auth.signInWithPassword(cleanEmail, password)
      }
    } catch (err) {
      const msg = err.message ?? ''
      if (/already registered|already been registered/i.test(msg)) {
        switchMode('signin', 'You already have an account. Sign in with your password.')
      } else if (/invalid login credentials/i.test(msg)) {
        setError("That email and password don't match. Try again, or create your account if you're new.")
      } else if (msg === 'CONFIRM_EMAIL_ON') {
        setError('Account created, but Supabase still requires email confirmation. Turn off "Confirm email" in Supabase, then sign in.')
      } else {
        setError(msg || 'Something went wrong. Try again.')
      }
    }
    setState('idle')
  }

  const submitLabel = mode === 'signup' ? 'Enter' : 'Sign in'

  // Index of the word currently being typed (the cursor sits after it).
  const active = counts.findIndex((n, i) => n < WORDS[i].length)
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
        <p className="landing-kicker">Phase 1 · Brand exploration</p>

        <h1 className="landing-title" aria-label="Luna Civic Strategies">
          {WORDS.map((word, i) => (
            <span key={word} className="landing-line" aria-hidden="true">
              <span>{word.slice(0, counts[i])}</span>
              {cursorAt === i && <span className="type-cursor" />}
              {/* The untyped remainder holds the line's width so nothing shifts. */}
              <span className="type-ghost">{word.slice(counts[i])}</span>
            </span>
          ))}
        </h1>

        <p className="landing-copy">A private brand exploration space.</p>

        <div className="landing-form-wrap" aria-hidden={stage !== 'form'}>
            <form className={`landing-form landing-form--${mode}`} onSubmit={submit}>
              {mode === 'signup' && (
                <>
                  <label className="visually-hidden" htmlFor="landing-name">
                    Your name
                  </label>
                  <input
                    id="landing-name"
                    required
                    autoComplete="given-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}
              <label className="visually-hidden" htmlFor="landing-email">
                Email
              </label>
              <input
                id="landing-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="visually-hidden" htmlFor="landing-password">
                Password
              </label>
              <input
                id="landing-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'Choose a password (6+ characters)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="button" disabled={state === 'sending'}>
                {state === 'sending' ? 'One moment…' : submitLabel}
              </button>
            </form>
          {notice && <p className="landing-notice">{notice}</p>}
          {error && <p className="form-error">{error}</p>}
          <p className="landing-note">
            {mode === 'signup' ? (
              <>
                Been here before?{' '}
                <button type="button" className="link-button" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                First time?{' '}
                <button type="button" className="link-button" onClick={() => switchMode('signup')}>
                  Create your account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  )
}
