import { useEffect, useState } from 'react'
import { useUrlParam } from '../hooks/useUrlParam'
import { useSvg } from '../hooks/useSvg'
import { assetUrl } from '../lib/supabase'
import { isSvgUrl, loadSvg } from '../lib/svg'
import { PaletteStrip } from './PaletteStrip'
import { LogoRail } from './LogoRail'
import { LogoMark } from './LogoMark'
import { CommentsPanel } from './CommentsPanel'
import { SavedLooks } from './SavedLooks'
import { BottomSheet } from './BottomSheet'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { RoundSwitch } from './RoundSwitch'

const pad = (n) => String(n).padStart(2, '0')
// B&W shows the artwork's original near-black.
const BLACK = { name: 'Black', hex: '#020202' }
const sameHex = (a, b) => a?.replace('#', '').toLowerCase() === b?.replace('#', '').toLowerCase()
const isBlack = (hex) => ['#020202', '#010101', '#111111', '#000000'].some((b) => sameHex(b, hex))
// No accent on either side counts as a match.
const sameAccent = (a, b) => (!a && !b) || sameHex(a, b)

function isTyping(target) {
  return target.closest?.('input, textarea, select, [contenteditable], dialog[open]')
}

const roundOf = (item) => item?.round ?? 1

export function Visualizer({ allLogos, allPalettes, hasRound2, commentsFor, saved, ...threadProps }) {
  // Logos and palettes each pick a round, so Round 1 logos can be compared
  // against Round 2 palettes. Both default to the active round.
  const defaultRound = hasRound2 ? 2 : 1
  const [lroundParam, setLroundParam] = useUrlParam('lround')
  const [proundParam, setProundParam] = useUrlParam('pround')
  const pickRound = (param) => (param === '1' || param === '2' ? Number(param) : defaultRound)
  const logoRound = hasRound2 ? pickRound(lroundParam) : 1
  const paletteRound = hasRound2 ? pickRound(proundParam) : 1
  const setLogoRound = (r) => setLroundParam(r === defaultRound ? null : String(r))
  const setPaletteRoundParam = (r) => setProundParam(r === defaultRound ? null : String(r))
  const logos = allLogos.filter((l) => roundOf(l) === logoRound)
  const palettes = allPalettes.filter((p) => roundOf(p) === paletteRound)

  const [logoSlug, setLogoSlug] = useUrlParam('logo')
  const [paletteSlug, setPaletteSlug] = useUrlParam('palette')
  const [markParam, setMarkParam] = useUrlParam('mark')
  // Optional accent colour for logos with an accent element; null = match the mark.
  const [accentParam, setAccentParam] = useUrlParam('accent')
  const [saveState, setSaveState] = useState({ busy: false, error: null })
  // Last palette colour picked, so "View in color" can bring it back.
  const [lastColor, setLastColor] = useState(null)
  // Phones get compact controls: collapsed pickers and a comments drawer.
  const isMobile = useMediaQuery('(max-width: 720px)')
  const [openPicker, setOpenPicker] = useState(null) // 'mark' | 'accent' | null
  const [commentsOpen, setCommentsOpen] = useState(false)
  const togglePicker = (which) => setOpenPicker((cur) => (cur === which ? null : which))

  const logoIndex = Math.max(0, logos.findIndex((l) => l.slug === logoSlug))
  const paletteIndex = Math.max(0, palettes.findIndex((p) => p.slug === paletteSlug))
  const logo = logos[logoIndex]
  const palette = palettes[paletteIndex]

  // Mark colour: B&W by default, or any colour from the selected palette.
  const colors = palette?.data?.colors ?? []
  const mark = colors.find((c) => sameHex(c.hex, markParam)) ?? BLACK

  const logoSrc = assetUrl(logo?.image_url)
  const { hasAccent } = useSvg(isSvgUrl(logoSrc) ? logoSrc : null)
  const accentOptions = [BLACK, ...colors]
  const accent = hasAccent ? (accentOptions.find((c) => sameHex(c.hex, accentParam)) ?? null) : null
  const inColor = mark !== BLACK || Boolean(accent)

  // A new palette starts back in B&W, so colour is always a conscious choice.
  const selectPalette = (p) => {
    setPaletteSlug(p.slug)
    setMarkParam(null)
    setAccentParam(null)
    setLastColor(null)
  }
  const selectMark = (c) => {
    setLastColor(c.hex)
    setMarkParam(c.hex.replace('#', ''))
  }
  const viewInColor = () => {
    const c = colors.find((x) => sameHex(x.hex, lastColor)) ?? colors[0]
    if (c) selectMark(c)
  }
  // B&W resets every fill, accent included, back to the original near-black.
  const viewInBW = () => {
    setMarkParam(null)
    setAccentParam(null)
  }
  const selectAccent = (c) => setAccentParam(c ? c.hex.replace('#', '') : null)
  // A different palette set means different colours, so start back in B&W.
  const setPaletteRound = (r) => {
    setPaletteRoundParam(r)
    setMarkParam(null)
    setAccentParam(null)
    setLastColor(null)
  }

  // The onboarding tour asks for a logo with an accent, so the picker is on screen.
  useEffect(() => {
    async function showAccentLogo() {
      if (hasAccent) return
      for (const l of logos) {
        const src = assetUrl(l.image_url)
        if (!isSvgUrl(src)) continue
        const { hasAccent: has } = await loadSvg(src).catch(() => ({}))
        if (has) return setLogoSlug(l.slug)
      }
    }
    window.addEventListener('luna:show-accent-logo', showAccentLogo)
    return () => window.removeEventListener('luna:show-accent-logo', showAccentLogo)
  }, [hasAccent, logos, setLogoSlug])

  // ↑/↓ steps through logos, ←/→ through palettes.
  useEffect(() => {
    function onKey(e) {
      if (document.documentElement.classList.contains('touring')) return
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1 }[e.key]
      if (!step) return
      e.preventDefault()
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        setLogoSlug(logos[(logoIndex + step + logos.length) % logos.length].slug)
      } else {
        setPaletteSlug(palettes[(paletteIndex + step + palettes.length) % palettes.length].slug)
        setMarkParam(null)
        setAccentParam(null)
        setLastColor(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [logos, palettes, logoIndex, paletteIndex, setLogoSlug, setPaletteSlug, setMarkParam, setAccentParam])

  const roundControls = hasRound2 && (
    <div className="viz-rounds">
      <RoundSwitch label="Logos" round={logoRound} onChange={setLogoRound} short />
      <RoundSwitch label="Palettes" round={paletteRound} onChange={setPaletteRound} short />
    </div>
  )

  if (!logo || !palette) {
    return (
      <>
        {roundControls}
        <p className="loading">No logos or palettes in this round yet.</p>
      </>
    )
  }

  const current = saved.looks.find(
    (l) =>
      l.logo_id === logo.id &&
      l.palette_id === palette.id &&
      (mark === BLACK ? isBlack(l.mark_hex) : sameHex(l.mark_hex, mark.hex)) &&
      sameAccent(l.accent_hex, accent?.hex),
  )
  const canSave = saved.status !== 'offline' && threadProps.user

  async function save() {
    setSaveState({ busy: true, error: null })
    try {
      await saved.saveLook({ logo, palette, mark, accent })
      setSaveState({ busy: false, error: null })
    } catch (err) {
      setSaveState({ busy: false, error: err.message ?? 'Could not save.' })
    }
  }

  function openLook(look) {
    const l = allLogos.find((x) => x.id === look.logo_id)
    const p = allPalettes.find((x) => x.id === look.palette_id)
    if (!l || !p) return
    // A saved look may come from either round: switch both sets to match it.
    setLroundParam(roundOf(l) === defaultRound ? null : String(roundOf(l)))
    setProundParam(roundOf(p) === defaultRound ? null : String(roundOf(p)))
    setLogoSlug(l.slug)
    setPaletteSlug(p.slug)
    if (isBlack(look.mark_hex)) {
      setMarkParam(null)
    } else {
      setLastColor(look.mark_hex)
      setMarkParam(look.mark_hex.replace('#', ''))
    }
    setAccentParam(look.accent_hex ? look.accent_hex.replace('#', '') : null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const markSwatches = (
    <div className="mark-swatches" role="radiogroup" aria-label="Logo mark colour" data-tour="mark-colors">
      {colors.map((c, i) => (
        <button
          key={c.hex + i}
          type="button"
          role="radio"
          aria-checked={inColor && c === mark}
          aria-label={c.name}
          title={`${c.name} ${c.hex.toUpperCase()}`}
          className="mark-swatch"
          style={{ background: c.hex }}
          onClick={() => selectMark(c)}
        />
      ))}
    </div>
  )

  const accentSwatches = (
    <>
      <button
        type="button"
        role="radio"
        aria-checked={!accent}
        className="accent-match"
        title="Match the main colour"
        onClick={() => selectAccent(null)}
      >
        <span className="accent-match-dot" style={{ background: mark.hex }} aria-hidden="true" />
        Match
      </button>
      {accentOptions.map((c, i) => (
        <button
          key={c.hex + i}
          type="button"
          role="radio"
          aria-checked={accent === c}
          aria-label={`${c.name} accent`}
          title={`${c.name} ${c.hex.toUpperCase()}`}
          className="mark-swatch mark-swatch--small"
          style={{ background: c.hex }}
          onClick={() => selectAccent(c)}
        />
      ))}
    </>
  )

  const saveButton = canSave && (
    <button
      type="button"
      className={`button viz-save${isMobile ? ' viz-save--full' : ' button--small'}`}
      data-tour="save-look"
      onClick={save}
      disabled={Boolean(current) || saveState.busy}
    >
      {current ? 'Saved ✓' : saveState.busy ? 'Saving…' : 'Save this look'}
    </button>
  )

  const commentTabs = [
    { key: 'logo', label: 'On this logo', item: logo, subject: logo.name },
    { key: 'palette', label: 'On this palette', item: palette, subject: `Palette ${pad(paletteIndex + 1)} · ${palette.name}` },
  ]
  const commentCount = (commentsFor[logo.id]?.length ?? 0) + (commentsFor[palette.id]?.length ?? 0)

  // Palette colours as a conic swatch for the mobile colour toggle.
  const paletteRing = `conic-gradient(${colors.map((c, i) => `${c.hex} ${(i / colors.length) * 360}deg ${((i + 1) / colors.length) * 360}deg`).join(', ')})`

  return (
    <div className="visualizer">
      {roundControls}
      <div className="viz-grid">
        <PaletteStrip palettes={palettes} selectedId={palette.id} onSelect={selectPalette} />
        <LogoRail logos={logos} selectedId={logo.id} onSelect={(l) => setLogoSlug(l.slug)} />

        <div className="viz-card">
          <div className="viz-stage">
            <div className="viz-stage-top">
              <span className="combo-label" aria-live="polite">
                {logo.name}
                {logo.data?.fromRound1 && ' · from Round 1'} · Palette {pad(paletteIndex + 1)} · {mark.name}
                {accent && ` + ${accent.name} accent`}
              </span>
              {isMobile && (
                <button
                  type="button"
                  className="color-toggle"
                  data-tour="color-toggle"
                  aria-pressed={inColor}
                  aria-label={inColor ? 'View in B&W' : 'View in color'}
                  title={inColor ? 'View in B&W' : 'View in color'}
                  onClick={inColor ? viewInBW : viewInColor}
                  disabled={!colors.length}
                  style={{ background: inColor ? paletteRing : undefined }}
                />
              )}
            </div>
            <div className="viz-hero">
              <LogoMark item={logo} color={mark.hex} accent={accent?.hex} className="logo-mark--hero" />
            </div>

            {isMobile ? (
              <div className="viz-compact">
                <div className="viz-compact-row">
                  <button
                    type="button"
                    className="swatch-trigger"
                    data-tour="mark-colors"
                    aria-expanded={openPicker === 'mark'}
                    aria-label={`Logo colour: ${mark.name}. Tap to change`}
                    onClick={() => togglePicker('mark')}
                  >
                    <span className="mark-swatch" style={{ background: mark.hex }} aria-hidden="true" />
                    <span className="swatch-trigger-label">{mark.name}</span>
                  </button>
                  {hasAccent && (
                    <button
                      type="button"
                      className="accent-trigger"
                      data-tour="accent-picker"
                      aria-expanded={openPicker === 'accent'}
                      aria-label={`Accent colour: ${accent ? accent.name : 'matches'}. Tap to change`}
                      onClick={() => togglePicker('accent')}
                    >
                      <span className="accent-dot" style={{ background: (accent ?? mark).hex }} aria-hidden="true" />
                      <span className="swatch-trigger-label">Accent</span>
                    </button>
                  )}
                </div>
                {openPicker === 'mark' && <div className="viz-compact-picker">{markSwatches}</div>}
                {openPicker === 'accent' && hasAccent && (
                  <div className="viz-compact-picker accent-picker" role="radiogroup" aria-label="Accent colour">
                    {accentSwatches}
                  </div>
                )}
                {saveButton}
              </div>
            ) : (
              <div className="viz-tools">
                <div className="view-toggle" role="group" aria-label="Preview colour" data-tour="color-toggle">
                  <button type="button" aria-pressed={!inColor} onClick={viewInBW}>
                    View in B&amp;W
                  </button>
                  <button type="button" aria-pressed={inColor} onClick={viewInColor} disabled={!colors.length}>
                    View in color
                  </button>
                </div>
                {markSwatches}
                {hasAccent && (
                  <div className="accent-picker" role="radiogroup" aria-label="Accent colour" data-tour="accent-picker">
                    <span className="accent-label">Accent</span>
                    {accentSwatches}
                  </div>
                )}
                {saveButton}
              </div>
            )}
            {saveState.error && <p className="form-error viz-error">{saveState.error}</p>}
          </div>

          {isMobile ? (
            <button type="button" className="comments-trigger" onClick={() => setCommentsOpen(true)}>
              <span>
                Comments <span className="tab-count">{commentCount}</span>
              </span>
              <span aria-hidden="true">⌃</span>
            </button>
          ) : (
            <CommentsPanel tabs={commentTabs} commentsFor={commentsFor} {...threadProps} />
          )}
        </div>
      </div>

      {isMobile && (
        <BottomSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} title="Comments">
          <CommentsPanel tabs={commentTabs} commentsFor={commentsFor} {...threadProps} />
        </BottomSheet>
      )}

      {saved.status !== 'offline' && (
        <SavedLooks
          looks={saved.looks}
          logos={allLogos}
          palettes={allPalettes}
          showRounds={hasRound2}
          user={threadProps.user}
          currentId={current?.id}
          onOpen={openLook}
          onDelete={(id) => saved.deleteLook(id).catch((err) => setSaveState({ busy: false, error: err.message }))}
        />
      )}
    </div>
  )
}
