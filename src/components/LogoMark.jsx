import { assetUrl } from '../lib/supabase'
import { isSvgUrl } from '../lib/svg'
import { useSvg } from '../hooks/useSvg'
import { PlaceholderLogo } from './PlaceholderLogo'

// Renders a logo in a single mark colour.
//  • SVG files are inlined: dark fills follow `color`, red accent elements
//    follow `accent` (or `color` when no accent is given), light details stay light.
//  • Other images (PNG etc.) are applied as a CSS mask in `color`.
//  • No file yet → a generic placeholder shape.
export function LogoMark({ item, color, accent, className = '' }) {
  const src = assetUrl(item.image_url)

  if (isSvgUrl(src)) return <InlineSvg src={src} label={item.name} color={color} accent={accent} className={className} />

  if (src) {
    const mask = `url("${src}") center / contain no-repeat`
    return (
      <span
        className={`logo-mark ${className}`}
        role="img"
        aria-label={item.name}
        style={{ backgroundColor: color, WebkitMask: mask, mask }}
      />
    )
  }

  const wide = Boolean(item.data?.wide)
  return (
    <span className={`logo-mark${wide ? '' : ' logo-mark--square'} ${className}`} style={{ color }}>
      <PlaceholderLogo variant={item.data?.placeholder} title={item.name} wide={wide} />
    </span>
  )
}

function InlineSvg({ src, label, color, accent, className }) {
  const { markup, failed } = useSvg(src)

  return (
    <span
      className={`logo-mark ${className}${failed ? ' logo-mark--failed' : ''}`}
      role="img"
      aria-label={failed ? `${label} (couldn't load)` : label}
      style={{ color, '--logo-accent': accent || undefined }}
      // Markup comes from our own logo files and is sanitised in loadSvg.
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  )
}
