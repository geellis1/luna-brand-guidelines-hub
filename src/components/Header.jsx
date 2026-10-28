// Full-width editorial masthead with the primary view tabs beneath it.
export function Header({ user, onSignOut, onOpenType, onStartTour, views, view, onViewChange }) {
  return (
    <header className="masthead">
      <div className="masthead-utility">
        <span>Phase 1 · Private</span>
        <div className="masthead-actions">
          {onOpenType && (
            <button type="button" className="link-button" onClick={onOpenType}>
              Type pairing
            </button>
          )}
          {onStartTour && (
            <button type="button" className="help-button" onClick={onStartTour} aria-label="How to use this">
              ?<span className="help-tooltip" aria-hidden="true">How to use this</span>
            </button>
          )}
          {onSignOut && (
            <button type="button" className="link-button" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      </div>
      <h1 className="masthead-title">
        Luna Civic Strategies <span className="masthead-sub">Brand Explorer</span>
      </h1>
      <nav className="view-tabs" aria-label="Views">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            className="view-tab"
            data-tour={`tab-${v.key}`}
            aria-current={v.key === view ? 'page' : undefined}
            onClick={() => onViewChange(v.key)}
          >
            {v.label}
            {v.count != null && <sup className="view-count">{v.count}</sup>}
          </button>
        ))}
      </nav>
    </header>
  )
}
