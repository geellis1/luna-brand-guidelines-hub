import { useId, useState } from 'react'
import { BLACK, COLORS, SIZES } from '../lib/brand'
import { logoPng } from '../lib/logo'
import { useDownload } from '../hooks/useDownload'
import { Logo } from './Logo'

const SWATCHES = [...COLORS, BLACK]

export function LogoBuilder() {
  const [luna, setLuna] = useState(BLACK.hex)
  const [civic, setCivic] = useState(BLACK.hex)
  const [sizeKey, setSizeKey] = useState('medium')
  const { busy, error, run } = useDownload()
  const size = SIZES.find((s) => s.key === sizeKey)

  const download = () =>
    run('builder', () => logoPng({ luna, civic, width: size.width, height: size.height }), `luna-logo-${size.key}@2x.png`)

  return (
    <section aria-labelledby="builder-title">
      <h1 id="builder-title" className="hub-heading">
        Logo Builder
      </h1>

      <div className="builder-stage">
        <Logo className="builder-logo" luna={luna} civic={civic} label="Logo preview" />
      </div>

      <div className="builder-controls">
        <SwatchRow label="LUNA color" value={luna} onChange={setLuna} />
        <SwatchRow label="CIVIC STRATEGIES color" value={civic} onChange={setCivic} />

        <div className="control">
          <span className="control-label" id="size-label">
            Size
          </span>
          <div className="size-picker" role="group" aria-labelledby="size-label">
            {SIZES.map((s) => (
              <button
                key={s.key}
                type="button"
                className="size-option"
                aria-pressed={s.key === sizeKey}
                onClick={() => setSizeKey(s.key)}
              >
                {s.label}
                <span className="size-dims">
                  {s.width} × {s.height}px · @2x
                </span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="button button--primary builder-download" onClick={download} disabled={busy === 'builder'}>
          {busy === 'builder' ? 'Preparing…' : 'Download PNG'}
        </button>
        {error && (
          <p className="hub-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

function SwatchRow({ label, value, onChange }) {
  const labelId = useId()
  return (
    <div className="control">
      <span className="control-label" id={labelId}>
        {label}
      </span>
      <div className="swatch-row" role="radiogroup" aria-labelledby={labelId}>
        {SWATCHES.map((c) => (
          <button
            key={c.hex}
            type="button"
            role="radio"
            aria-checked={value === c.hex}
            aria-label={c.name}
            title={`${c.name} ${c.hex}`}
            className="swatch"
            style={{ background: c.hex }}
            onClick={() => onChange(c.hex)}
          />
        ))}
      </div>
    </div>
  )
}
