import { Logo } from './Logo'

// Sticky nav bar: logo on the left, the three tabs on the right.
export function Header({ views, view, onViewChange }) {
  return (
    <header className="hub-nav">
      <div className="hub-nav-inner">
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
      </div>
    </header>
  )
}
