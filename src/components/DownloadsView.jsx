import { BLACK, COLORS, SIZES, WHITE } from '../lib/brand'
import { logoPng, swatchSheetPng } from '../lib/logo'
import { useDownload } from '../hooks/useDownload'
import { Logo } from './Logo'

const LOGOS = [
  { key: 'black', name: 'Black', hex: BLACK.hex },
  { key: 'white', name: 'White', hex: WHITE.hex, dark: true },
  { key: 'crimson', name: 'Deep Crimson', hex: COLORS[0].hex },
]

// Font files live in public/fonts.
const FONTS = [
  { name: 'Shunsine', use: 'Used for LUNA', family: "'ShunsineFont'", sample: 'LUNA', file: '/fonts/Shunsine.otf' },
  {
    name: 'Cotoris Bold',
    use: 'Used for CIVIC STRATEGIES',
    family: "'CotorisFont'",
    sample: 'CIVIC STRATEGIES',
    file: '/fonts/CotorisBold.otf',
  },
]

export function DownloadsView() {
  const { busy, error, run } = useDownload()

  return (
    <section aria-labelledby="downloads-title">
      <h1 id="downloads-title" className="hub-heading">
        Downloads
      </h1>
      {error && (
        <p className="hub-error" role="alert">
          {error}
        </p>
      )}

      <h2 className="hub-subheading">Logo</h2>
      <ul className="asset-grid">
        {LOGOS.map((logo) => (
          <li key={logo.key} className="asset-card">
            <div className={`asset-stage${logo.dark ? ' asset-stage--dark' : ''}`}>
              <Logo className="asset-logo" luna={logo.hex} civic={logo.hex} />
            </div>
            <div className="asset-body">
              <h3 className="asset-name">Logo — {logo.name}</h3>
              <p className="asset-meta">On transparent · PNG</p>
              <div className="asset-actions asset-actions--sizes">
                {SIZES.map((s) => {
                  const key = `${logo.key}-${s.key}`
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className="button button--outline"
                      disabled={busy === key}
                      aria-label={`Download ${logo.name} logo, ${s.label}, ${s.width} by ${s.height} pixels`}
                      onClick={() =>
                        run(key, () => logoPng({ luna: logo.hex, civic: logo.hex, width: s.width, height: s.height }), `luna-logo-${logo.key}-${s.key}.png`)
                      }
                    >
                      {busy === key ? '…' : s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="hub-subheading">Fonts</h2>
      <ul className="asset-grid">
        {FONTS.map((font) => (
          <li key={font.name} className="asset-card">
            <div className="asset-stage">
              <span className="asset-font-sample" style={{ fontFamily: font.family }}>
                {font.sample}
              </span>
            </div>
            <div className="asset-body">
              <h3 className="asset-name">{font.name}</h3>
              <p className="asset-meta">{font.use}</p>
              <div className="asset-actions">
                <a className="button button--primary" href={font.file} download>
                  Download .otf
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="hub-subheading">Brand colors</h2>
      <ul className="asset-grid">
        <li className="asset-card">
          <div className="asset-stage asset-stage--swatches" aria-hidden="true">
            {COLORS.map((c) => (
              <span key={c.hex} style={{ background: c.hex }} />
            ))}
          </div>
          <div className="asset-body">
            <h3 className="asset-name">Color swatch sheet</h3>
            <p className="asset-meta">All five colors with names and hex codes · PNG</p>
            <div className="asset-actions">
              <button
                type="button"
                className="button button--primary"
                disabled={busy === 'swatches'}
                onClick={() => run('swatches', swatchSheetPng, 'luna-brand-colors.png')}
              >
                {busy === 'swatches' ? 'Preparing…' : 'Download PNG'}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  )
}
