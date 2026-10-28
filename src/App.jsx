import { useState } from 'react'
import { isConfigured } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useBrandItems } from './hooks/useBrandItems'
import { useComments } from './hooks/useComments'
import { useSavedLooks } from './hooks/useSavedLooks'
import { useReactions } from './hooks/useReactions'
import { useProfile } from './hooks/useProfile'
import { useUrlParam } from './hooks/useUrlParam'
import { Header } from './components/Header'
import { Landing } from './components/Landing'
import { LogosView } from './components/LogosView'
import { PalettesView } from './components/PalettesView'
import { Visualizer } from './components/Visualizer'
import { TypeDialog } from './components/TypeDialog'
import { NameDialog } from './components/NameDialog'
import { Tour } from './components/Tour'
import { RoundSwitch } from './components/RoundSwitch'

// Type pairing review is parked until the logo is finalized; flip to re-enable.
const SHOW_TYPE_PAIRING = false

export default function App() {
  const auth = useAuth()
  const { byType, loading, error } = useBrandItems()
  const comments = useComments()
  const saved = useSavedLooks()
  const reactions = useReactions(auth.user)
  const me = useProfile(auth.user)
  const [nameOpen, setNameOpen] = useState(false)
  const [namePromptDismissed, setNamePromptDismissed] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [viewParam, setView] = useUrlParam('view')
  const [tourOpen, setTourOpen] = useState(false)
  const [autoTourDone, setAutoTourDone] = useState(false)

  // Review rounds: Round 2 is the active default once its content exists;
  // Round 1 stays available as an archive (?round=1).
  const [roundParam, setRoundParam] = useUrlParam('round')
  const allLogos = byType.logo ?? []
  const allPalettes = byType.palette ?? []
  const roundOf = (item) => item.round ?? 1
  const hasRound2 = [...allLogos, ...allPalettes].some((i) => roundOf(i) === 2)
  const round = roundParam === '1' || !hasRound2 ? 1 : 2
  const setRound = (r) => setRoundParam(r === 2 ? null : '1')
  const logos = allLogos.filter((i) => roundOf(i) === round)
  const palettes = allPalettes.filter((i) => roundOf(i) === round)
  const typeItem = SHOW_TYPE_PAIRING ? byType.typography?.[0] : null

  const views = [
    { key: 'logos', label: 'Logos', count: logos.length },
    { key: 'palettes', label: 'Palettes', count: palettes.length },
    { key: 'visualizer', label: 'Visualizer' },
  ]
  const view = views.some((v) => v.key === viewParam) ? viewParam : 'logos'

  const threadProps = { api: comments, user: auth.user, commentsFor: comments.byItem }

  // Signed-out visitors see the landing page. Without Supabase (local
  // preview) there's no sign-in, so go straight to the explorer.
  if (isConfigured && !auth.ready) return null
  // ?preview=landing shows the landing page even when signed in (for design review).
  const previewLanding = new URLSearchParams(window.location.search).get('preview') === 'landing'
  if ((isConfigured && !auth.user) || previewLanding) return <Landing auth={auth} />

  // Ask once for a name if the profile doesn't have one yet.
  const needsName = me.loaded && !me.profile?.display_name && !namePromptDismissed

  // First visit: after the name prompt, run the tour once (=== false so it
  // stays off until the onboarding_completed column exists).
  const autoTour =
    me.loaded &&
    me.profile?.onboarding_completed === false &&
    !needsName &&
    !nameOpen &&
    !autoTourDone

  const finishTour = () => {
    setTourOpen(false)
    setAutoTourDone(true)
    // Land on the Logos tab, top of page. Drop the Visualizer's picks first,
    // or ?logo= would open that logo's lightbox.
    const url = new URL(window.location.href)
    for (const key of ['logo', 'mark', 'accent']) url.searchParams.delete(key)
    window.history.replaceState(null, '', url)
    setView('logos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (me.profile?.onboarding_completed === false) me.completeOnboarding().catch(() => {})
  }

  return (
    <>
      <Header
        user={auth.user}
        onStartTour={() => setTourOpen(true)}
        onSignOut={auth.signOut}
        onOpenType={typeItem ? () => setTypeOpen(true) : null}
        views={views}
        view={view}
        onViewChange={(key) => {
          setView(key)
          window.scrollTo({ top: 0 })
        }}
      />

      <main className="explorer">
        {!isConfigured && (
          <p className="notice">Preview mode: Supabase isn't connected, so sign-in, comments and saving are off.</p>
        )}
        {error && <p className="notice notice--error">Couldn't load brand items: {error.message}</p>}

        {loading ? (
          <p className="loading">Loading…</p>
        ) : view === 'visualizer' ? (
          <Visualizer
            allLogos={allLogos}
            allPalettes={allPalettes}
            hasRound2={hasRound2}
            saved={saved}
            {...threadProps}
          />
        ) : (
          <>
            {hasRound2 && (
              <div className="round-bar">
                <RoundSwitch round={round} onChange={setRound} />
                {round === 1 && (
                  <p className="round-note">You're viewing the archive. Earlier directions, with all comments and reactions kept.</p>
                )}
              </div>
            )}
            {view === 'logos' ? (
              <LogosView
                logos={logos}
                onOpenInVisualizer={(logo) => {
                  // ?logo= is already the open logo; show its round's logos there.
                  const url = new URL(window.location.href)
                  url.searchParams.set('lround', String(roundOf(logo ?? { round })))
                  window.history.replaceState(null, '', url)
                  setView('visualizer')
                  window.scrollTo({ top: 0 })
                }}
                {...threadProps}
              />
            ) : (
              <PalettesView palettes={palettes} reactions={reactions} {...threadProps} />
            )}
          </>
        )}
      </main>

      {auth.user && (
        <NameDialog
          open={nameOpen || needsName}
          required={!me.profile?.display_name}
          initialName={me.profile?.display_name}
          onSave={me.saveName}
          onClose={() => {
            setNameOpen(false)
            setNamePromptDismissed(true)
          }}
        />
      )}

      <Tour open={tourOpen || autoTour} setView={setView} onFinish={finishTour} />

      {typeItem && (
        <TypeDialog
          open={typeOpen}
          onClose={() => setTypeOpen(false)}
          item={typeItem}
          comments={comments.byItem[typeItem.id] ?? []}
          api={comments}
          user={auth.user}
        />
      )}
    </>
  )
}
