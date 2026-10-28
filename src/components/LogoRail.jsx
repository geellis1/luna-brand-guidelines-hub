import { useKeepSelectedVisible } from '../hooks/useKeepSelectedVisible'
import { LogoMark } from './LogoMark'

// Y axis: logo options as a quiet column of small marks.
export function LogoRail({ logos, selectedId, onSelect }) {
  const ref = useKeepSelectedVisible(selectedId)
  return (
    <div ref={ref} className="selector logo-rail" role="radiogroup" aria-label="Logo">
      {logos.map((logo) => (
        <button
          key={logo.id}
          type="button"
          role="radio"
          aria-checked={logo.id === selectedId}
          aria-label={logo.data?.fromRound1 ? `${logo.name}, from Round 1 (was ${logo.data.fromRound1})` : logo.name}
          title={logo.data?.fromRound1 ? `${logo.name} · from Round 1 (was ${logo.data.fromRound1})` : logo.name}
          className="selector-cell logo-option"
          onClick={() => onSelect(logo)}
        >
          <LogoMark item={logo} color="#111111" className="logo-mark--thumb" />
        </button>
      ))}
    </div>
  )
}
