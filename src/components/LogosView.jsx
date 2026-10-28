import { useUrlParam } from '../hooks/useUrlParam'
import { ItemCard } from './ItemCard'
import { LogoLightbox } from './LogoLightbox'
import { LogoMark } from './LogoMark'

export function LogosView({ logos, onOpenInVisualizer }) {
  // The open logo lives in the URL, so a link can point straight at it.
  const [openSlug, setOpenSlug] = useUrlParam('logo')
  const openIndex = logos.findIndex((l) => l.slug === openSlug)

  return (
    <>
      <div className="card-grid card-grid--logos" data-tour="logo-grid">
        {logos.map((logo) => (
          <ItemCard
            key={logo.id}
            item={logo}
            stageClass="card-stage--logo"
            onOpen={() => setOpenSlug(logo.slug)}
            openLabel={`Open ${logo.name} larger`}
          >
            <LogoMark item={logo} color="#020202" className="logo-mark--card" />
          </ItemCard>
        ))}
      </div>

      <LogoLightbox
        logos={logos}
        index={openIndex}
        onNavigate={(logo) => setOpenSlug(logo.slug)}
        onClose={() => setOpenSlug(null)}
        onOpenInVisualizer={onOpenInVisualizer}
      />
    </>
  )
}
