import { useHubAccess } from './hooks/useHubAccess'
import { useUrlParam } from './hooks/useUrlParam'
import { Landing } from './components/Landing'
import { Header } from './components/Header'
import { BrandColors } from './components/BrandColors'
import { LogoBuilder } from './components/LogoBuilder'
import { DownloadsView } from './components/DownloadsView'

const VIEWS = [
  { key: 'colors', label: 'Brand colors' },
  { key: 'builder', label: 'Logo builder' },
  { key: 'downloads', label: 'Downloads' },
]

export default function App() {
  const hub = useHubAccess()
  const [viewParam, setView] = useUrlParam('view')

  // Everyone enters through the shared hub password on the landing page.
  // ?preview=landing shows the landing page even when unlocked (for design review).
  const previewLanding = new URLSearchParams(window.location.search).get('preview') === 'landing'
  if (!hub.unlocked || previewLanding) return <Landing onUnlock={hub.unlock} />

  const view = VIEWS.some((v) => v.key === viewParam) ? viewParam : 'colors'

  return (
    <div className="hub">
      <Header
        views={VIEWS}
        view={view}
        onViewChange={(key) => {
          setView(key)
          window.scrollTo({ top: 0 })
        }}
      />
      <main className="hub-main">
        {view === 'colors' && <BrandColors />}
        {view === 'builder' && <LogoBuilder />}
        {view === 'downloads' && <DownloadsView />}
      </main>
    </div>
  )
}
