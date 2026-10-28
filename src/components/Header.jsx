import { Logo } from './Logo'

// Logo top left, the three tabs beneath it. Nothing else.
export function Header({ views, view, onViewChange }) {
  return (
    <header className="hub-header">
      <Logo className="hub-logo" luna="currentColor" civic="currentColor" label="Luna Civic Strategies" />
      <nav className="hub-tabs" aria-label="Sections">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            className="hub-tab"
            aria-current={v.key === view ? 'page' : undefined}
            onClick={() => onViewChange(v.key)}
          >
            {v.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
