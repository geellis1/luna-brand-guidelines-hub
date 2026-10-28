import { useMemo } from 'react'
import { logoMarkup } from '../lib/logo'

// The Luna logo inline, with LUNA and CIVIC STRATEGIES in their own colours.
export function Logo({ luna, civic, className = '', label }) {
  const markup = useMemo(() => logoMarkup({ luna, civic }), [luna, civic])
  return (
    <span
      className={`logo ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
