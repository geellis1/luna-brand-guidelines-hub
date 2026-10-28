// Two-option pill for switching between the active round and the archive.
export function RoundSwitch({ round, onChange, label, short = false }) {
  const options = [
    { value: 2, text: 'Round 2', note: 'Active' },
    { value: 1, text: 'Round 1', note: 'Archive' },
  ]
  return (
    <div className={`round-switch${short ? ' round-switch--short' : ''}`} role="group" aria-label={label ?? 'Review round'}>
      {label && <span className="round-switch-label">{label}</span>}
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={round === o.value} onClick={() => onChange(o.value)}>
          {o.text}
          {!short && <span className="round-switch-note"> — {o.note}</span>}
        </button>
      ))}
    </div>
  )
}
