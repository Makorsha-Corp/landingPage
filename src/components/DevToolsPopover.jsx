import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from './ui/Button'
import NavLayoutToggle from './NavLayoutToggle'
import useFloatingPanelDrag from '../hooks/useFloatingPanelDrag'
import { getBackdropOpacityLabel } from '../lib/homepageWash'

const activeCls =
  'border-brand-primary bg-brand-primary text-white hover:bg-brand-primary hover:text-white'

const sectionLabelCls =
  'px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'

function BackdropOpacitySlider({ label, theme, backdropOpacity, onChange }) {
  const themeKey = theme === 'dark' ? 'dark' : 'light'
  const value = backdropOpacity?.[themeKey] ?? 0

  if (!onChange) return null

  return (
    <label className="flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
      <span className="w-24 shrink-0 text-xs font-medium text-foreground">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(themeKey, Number(event.target.value))}
        className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
        aria-label={`${label} background opacity`}
      />
      <span className="w-10 shrink-0 tabular-nums text-right text-foreground">{value}%</span>
    </label>
  )
}

function HeroFactoryBlurSlider({ heroFactoryBlurPx, onChange }) {
  if (!onChange) return null

  return (
    <label className="flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
      <span className="w-24 shrink-0 text-xs font-medium text-foreground">Hero blur</span>
      <input
        type="range"
        min={0}
        max={32}
        step={1}
        value={heroFactoryBlurPx ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
        aria-label="Hero factory blur"
      />
      <span className="w-10 shrink-0 tabular-nums text-right text-foreground">{heroFactoryBlurPx ?? 0}px</span>
    </label>
  )
}

function HeroOverlayScrimSlider({ theme, heroOverlayScrimStrength, onChange, disabled = false }) {
  if (!onChange) return null

  const themeKey = theme === 'dark' ? 'dark' : 'light'
  const value = heroOverlayScrimStrength?.[themeKey] ?? 0

  return (
    <label
      className={`flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground ${disabled ? 'opacity-50' : ''}`}
    >
      <span className="w-24 shrink-0 text-xs font-medium text-foreground">Strength</span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(themeKey, Number(event.target.value))}
        className="h-2 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
        aria-label="Hero dark scrim strength"
      />
      <span className="w-10 shrink-0 tabular-nums text-right text-foreground">{value}%</span>
    </label>
  )
}

function DevToolsFloatingPanel({
  open,
  onClose,
  buttonRef,
  theme,
  editMode,
  onToggleEditMode,
  factoryPanMode,
  onToggleFactoryPanMode,
  mobileCameraPanMode,
  onToggleMobileCameraPanMode,
  isMobileTour,
  barVariant,
  onCycleBarVariant,
  heroCardLayout,
  heroCardStyle,
  onCycleHeroCardLayout,
  onCycleHeroCardStyle,
  heroFactoryBlurPx,
  onHeroFactoryBlurPxChange,
  heroOverlayScrimStrength,
  onHeroOverlayScrimStrengthChange,
  heroOverlayScrimStyle,
  onHeroOverlayScrimStyleChange,
  heroOverlayScrimStyles = [],
  tourBackdropOpacity,
  onTourBackdropOpacityChange,
  sectionsBackdropOpacity,
  onSectionsBackdropOpacityChange,
  sectionBackdrops,
  backdropSections,
  onToggleSectionBackdrop,
  onCopyForCode,
  rainbowColorPreset,
  onRainbowColorPresetChange,
  rainbowColorPresets = [],
}) {
  const boundsRef = useRef(null)
  const panelRef = useRef(null)
  const [copyState, setCopyState] = useState('idle')
  const { panelStyle, handleProps } = useFloatingPanelDrag({
    boundsRef,
    panelRef,
    defaultPosition: { x: null, y: null },
    margin: 16,
  })

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const onPointerDown = (event) => {
      const target = event.target
      if (panelRef.current?.contains(target)) return
      if (buttonRef.current?.contains(target)) return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, onClose, buttonRef])

  if (!open) return null

  const menuBtnCls = 'shrink-0 whitespace-nowrap'

  return createPortal(
    <div ref={boundsRef} className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Dev tools"
        className="pointer-events-auto absolute flex max-h-[min(82vh,44rem)] w-[min(40rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/98 shadow-2xl backdrop-blur-md ring-2 ring-primary/30"
        style={panelStyle}
      >
        <div
          {...handleProps}
          className={`flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-5 py-4 ${handleProps.className}`}
        >
          <div className="min-w-0">
            <p className={sectionLabelCls}>Dev tools</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">Homepage tuning</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              Drag header to move. Changes apply live this session.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-lg text-muted-foreground/50" aria-hidden="true">
              ⠿
            </span>
            <Button
              type="button"
              variant="navGhost"
              size="default"
              className="!h-9 !px-3 !text-sm"
              onClick={onClose}
              aria-label="Close dev tools"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className={sectionLabelCls}>Editor</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={onToggleEditMode}
                  variant="navGhost"
                  size="default"
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm ${editMode ? activeCls : ''}`}
                  aria-pressed={editMode}
                >
                  Edit mode
                </Button>
                <Button
                  type="button"
                  onClick={onToggleFactoryPanMode}
                  variant="navGhost"
                  size="default"
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm ${factoryPanMode ? activeCls : ''}`}
                  aria-pressed={factoryPanMode}
                >
                  Factory pan
                </Button>
                <Button
                  type="button"
                  onClick={onToggleMobileCameraPanMode}
                  variant="navGhost"
                  size="default"
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm ${mobileCameraPanMode ? activeCls : ''}`}
                  aria-pressed={mobileCameraPanMode}
                >
                  Mobile camera
                </Button>
              </div>
              {!isMobileTour && mobileCameraPanMode ? (
                <p className="mt-2 text-[11px] leading-snug text-amber-600 dark:text-amber-400">
                  Mobile camera is on — resize below md or use device mode to see controls on tour stops.
                </p>
              ) : null}
              {isMobileTour && mobileCameraPanMode ? (
                <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                  D-pad appears top-left on each tour stop. Overrides persist this session.
                </p>
              ) : null}
            </div>

            <div>
              <p className={sectionLabelCls}>Layout</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={onCycleBarVariant}
                  variant="navGhost"
                  size="default"
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm`}
                >
                  Bar: {barVariant}
                </Button>
                <NavLayoutToggle className="!inline-flex shrink-0 !h-10" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Hero card</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Experiment with card layout and surface style on the opening screen.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={onCycleHeroCardLayout}
                  variant="navGhost"
                  size="default"
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm`}
                >
                  Layout: {heroCardLayout}
                </Button>
                <Button
                  type="button"
                  onClick={onCycleHeroCardStyle}
                  variant="navGhost"
                  size="default"
                  disabled={heroCardLayout === 'None'}
                  className={`${menuBtnCls} !h-10 !px-4 !text-sm ${heroCardLayout === 'None' ? 'opacity-40' : ''}`}
                >
                  Style: {heroCardStyle}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Rainbow colors</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Preset palettes for hero Sign Up rainbow + waitlist shine border.
              </p>
              {onRainbowColorPresetChange && rainbowColorPresets.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {rainbowColorPresets.map(({ id, label }) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => onRainbowColorPresetChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${rainbowColorPreset === id ? activeCls : ''}`}
                      aria-pressed={rainbowColorPreset === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Section backdrops</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Campus photo on vs gradient-only for each section.
              </p>
              {onToggleSectionBackdrop && backdropSections.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {backdropSections.map(({ id, label }) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => onToggleSectionBackdrop(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${sectionBackdrops[id] ? activeCls : ''}`}
                      aria-pressed={Boolean(sectionBackdrops[id])}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Hero factory blur</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Backdrop blur on opening screen (&ldquo;Your factory at your fingertips&rdquo;).
              </p>
              <div className="mt-2">
                <HeroFactoryBlurSlider
                  heroFactoryBlurPx={heroFactoryBlurPx}
                  onChange={onHeroFactoryBlurPxChange}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Dark scrim</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Overlay on hero copy and building (not campus photo dim). Strength follows current theme.
              </p>
              {onHeroOverlayScrimStyleChange && heroOverlayScrimStyles.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {heroOverlayScrimStyles.map(({ id, label }) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => onHeroOverlayScrimStyleChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${heroOverlayScrimStyle === id ? activeCls : ''}`}
                      aria-pressed={heroOverlayScrimStyle === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className="mt-2">
                <HeroOverlayScrimSlider
                  theme={theme}
                  heroOverlayScrimStrength={heroOverlayScrimStrength}
                  onChange={onHeroOverlayScrimStrengthChange}
                  disabled={heroOverlayScrimStyle === 'none'}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>{getBackdropOpacityLabel()}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Dim strength over campus photo / gradients — separate for tour vs other sections.
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <BackdropOpacitySlider
                  label="Tour"
                  theme={theme}
                  backdropOpacity={tourBackdropOpacity}
                  onChange={onTourBackdropOpacityChange}
                />
                <BackdropOpacitySlider
                  label="Sections"
                  theme={theme}
                  backdropOpacity={sectionsBackdropOpacity}
                  onChange={onSectionsBackdropOpacityChange}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Persist to code</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Copies only changes since last copy (or code defaults on first copy).
              </p>
              {onCopyForCode ? (
                <div className="mt-2">
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        const result = await onCopyForCode()
                        setCopyState(result?.hadChanges === false ? 'none' : 'copied')
                        window.setTimeout(() => setCopyState('idle'), 2000)
                      } catch {
                        setCopyState('failed')
                        window.setTimeout(() => setCopyState('idle'), 2500)
                      }
                    }}
                    variant="navGhost"
                    size="default"
                    className={`${menuBtnCls} !h-10 !px-4 !text-sm ${copyState === 'copied' ? activeCls : ''}`}
                  >
                    {copyState === 'copied'
                      ? 'Copied diff!'
                      : copyState === 'none'
                        ? 'No changes'
                        : copyState === 'failed'
                          ? 'Copy failed'
                          : 'Copy diff for code'}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function DevToolsPopover({
  showTrigger = true,
  open: controlledOpen,
  onOpenChange,
  buttonRef: externalButtonRef,
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const internalButtonRef = useRef(null)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const buttonRef = externalButtonRef ?? internalButtonRef

  return (
    <>
      {showTrigger ? (
        <span ref={buttonRef} className="inline-flex">
          <Button
            type="button"
            variant="navGhost"
            size="default"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="Open dev tools"
            className={`!h-10 !px-4 !text-sm ${open ? activeCls : ''}`}
          >
            Dev tools
          </Button>
        </span>
      ) : null}

      <DevToolsFloatingPanel
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        buttonRef={buttonRef}
      />
    </>
  )
}
