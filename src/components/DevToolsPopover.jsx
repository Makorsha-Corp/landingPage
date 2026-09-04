import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from './ui/Button'
import useFloatingPanelDrag from '../hooks/useFloatingPanelDrag'
import useViewportLayoutSignals from '../hooks/useViewportLayoutSignals'
import { getBackdropOpacityLabel } from '../lib/homepageWash'
import {
  DEFAULT_TOUR_TRANSITION_SPEED,
  DEFAULT_TOUR_CARD_CONTENT_SPEED,
  TOUR_TRANSITION_SPEED_MAX,
  TOUR_TRANSITION_SPEED_MIN,
} from '../lib/tourScrollMath'
import { DESKTOP_LG_MIN_PX, TOUR_MD_MIN_PX } from '../lib/viewportBreakpoints'

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

function TransitionSpeedSlider({ label, helperText, speed, defaultSpeed, onChange, ariaLabel }) {
  if (!onChange) return null

  const value = speed ?? defaultSpeed
  const minPercent = Math.round(TOUR_TRANSITION_SPEED_MIN * 100)
  const maxPercent = Math.round(TOUR_TRANSITION_SPEED_MAX * 100)
  const percent = Math.round(value * 100)

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
      <label className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
        <span className="w-24 shrink-0 text-xs font-medium text-foreground">{label}</span>
        <input
          type="range"
          min={minPercent}
          max={maxPercent}
          step={25}
          value={percent}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
          aria-label={ariaLabel}
        />
        <span className="w-10 shrink-0 tabular-nums text-right text-foreground">
          {(value).toFixed(2).replace(/\.?0+$/, '')}×
        </span>
      </label>
      {helperText ? (
        <p className="pl-[6.5rem] text-[10px] leading-snug text-muted-foreground/80">{helperText}</p>
      ) : null}
    </div>
  )
}

function CollapsibleDevSection({ title, description, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const sectionId = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="lg:col-span-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`devtools-section-${sectionId}`}
        className="flex w-full items-start justify-between gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="min-w-0">
          <span className={sectionLabelCls}>{title}</span>
          {description ? (
            <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 pt-0.5 text-sm text-muted-foreground" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div id={`devtools-section-${sectionId}`} className="mt-2">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function ViewportLayoutReadout({ isMobileTour }) {
  const signals = useViewportLayoutSignals()
  const tailwindMdProbeRef = useRef(null)
  const [tailwindMdActive, setTailwindMdActive] = useState(null)

  useLayoutEffect(() => {
    const probe = tailwindMdProbeRef.current
    if (!probe) return
    setTailwindMdActive(getComputedStyle(probe).display !== 'none')
  }, [signals.innerWidth, signals.innerHeight])

  const flag = (on) => (on ? 'yes' : 'no')

  const cssMdMismatch =
    tailwindMdActive !== null && tailwindMdActive !== signals.isDesktopMd

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
      <span ref={tailwindMdProbeRef} className="hidden md:block" aria-hidden="true" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <dt className="font-medium text-foreground">Viewport</dt>
        <dd className="tabular-nums">
          {signals.innerWidth}×{signals.innerHeight}px
        </dd>
        <dt className="font-medium text-foreground">Tour JS</dt>
        <dd>
          {signals.isMobileTour ? 'mobile' : 'desktop'}
          {isMobileTour !== signals.isMobileTour ? ' (hook mismatch)' : ''}
        </dd>
        <dt className="font-medium text-foreground">CSS md ({TOUR_MD_MIN_PX}+)</dt>
        <dd>{flag(signals.isDesktopMd)}</dd>
        <dt className="font-medium text-foreground">Tailwind md:</dt>
        <dd>
          {tailwindMdActive === null ? '…' : flag(tailwindMdActive)}
          {cssMdMismatch ? ' (CSS broken)' : ''}
        </dd>
        <dt className="font-medium text-foreground">CSS lg ({DESKTOP_LG_MIN_PX}+)</dt>
        <dd>{flag(signals.isDesktopLg)}</dd>
      </dl>
      {cssMdMismatch ? (
        <p className="mt-2 leading-snug text-[10px] font-medium text-amber-600 dark:text-amber-400">
          Tailwind md: utilities not applying — nav/pricing may stay mobile. Tour uses JS fallback.
        </p>
      ) : null}
      <p className="mt-2 leading-snug text-[10px] text-muted-foreground/80">
        Floating story card + right bar when md=yes. Pricing grid when md=yes (carousel when md=no).
        Width-only detection — no Safari or device sniffing.
      </p>
    </div>
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
  tourTransitionSpeed,
  onTourTransitionSpeedChange,
  tourCardContentSpeed,
  onTourCardContentSpeedChange,
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
  lightSignUpVariant,
  onLightSignUpVariantChange,
  darkSignUpVariant,
  onDarkSignUpVariantChange,
  signUpButtonVariants = [],
  waitlistFabStyle,
  onWaitlistFabStyleChange,
  waitlistFabStyles = [],
  brandLogoLightVariant,
  onBrandLogoLightVariantChange,
  brandLogoLightVariants = [],
  perfHudEnabled = false,
  onTogglePerfHud,
  showPerfHudToggle = false,
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
            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Editor</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
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
                  {showPerfHudToggle && onTogglePerfHud ? (
                    <Button
                      type="button"
                      onClick={onTogglePerfHud}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-4 !text-sm ${perfHudEnabled ? activeCls : ''}`}
                      aria-pressed={perfHudEnabled}
                    >
                      Perf HUD
                    </Button>
                  ) : null}
                </div>
                <div className="ml-auto flex shrink-0 flex-wrap justify-end gap-2">
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
              </div>
              {isMobileTour && factoryPanMode ? (
                <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                  D-pad on hero edits mobile factory framing. Desktop hero camera stays separate.
                </p>
              ) : null}
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

            <CollapsibleDevSection
              title="Viewport / layout"
              description="Live breakpoint flags — share with anyone seeing the wrong mobile or desktop layout."
            >
              <ViewportLayoutReadout isMobileTour={isMobileTour} />
            </CollapsibleDevSection>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Story transitions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Camera + hero-exit smoothing. Below 1× slows pan/zoom for debugging; above 1× speeds up.
              </p>
              <div className="mt-2 grid gap-2">
                <TransitionSpeedSlider
                  label="Story speed"
                  helperText="Camera, blur, card position"
                  speed={tourTransitionSpeed}
                  defaultSpeed={DEFAULT_TOUR_TRANSITION_SPEED}
                  onChange={onTourTransitionSpeedChange}
                  ariaLabel="Story transition speed"
                />
                <TransitionSpeedSlider
                  label="Card copy"
                  helperText="Text swap and height"
                  speed={tourCardContentSpeed}
                  defaultSpeed={DEFAULT_TOUR_CARD_CONTENT_SPEED}
                  onChange={onTourCardContentSpeedChange}
                  ariaLabel="Card copy transition speed"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Sign Up — light mode</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hero + nav CTA when theme is light. Rainbow border uses preset above.
              </p>
              {onLightSignUpVariantChange && signUpButtonVariants.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {signUpButtonVariants.map(({ id, label }) => (
                    <Button
                      key={`light-${id}`}
                      type="button"
                      onClick={() => onLightSignUpVariantChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${lightSignUpVariant === id ? activeCls : ''}`}
                      aria-pressed={lightSignUpVariant === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Sign Up — dark mode</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hero + nav CTA when theme is dark. Toggle theme above to preview on the page.
              </p>
              {onDarkSignUpVariantChange && signUpButtonVariants.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {signUpButtonVariants.map(({ id, label }) => (
                    <Button
                      key={`dark-${id}`}
                      type="button"
                      onClick={() => onDarkSignUpVariantChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${darkSignUpVariant === id ? activeCls : ''}`}
                      aria-pressed={darkSignUpVariant === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Brand logo — light surfaces</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nav + footer pen mark. Waitlist brand panel stays white-on-purple.
              </p>
              {onBrandLogoLightVariantChange && brandLogoLightVariants.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {brandLogoLightVariants.map(({ id, label }) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => onBrandLogoLightVariantChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${brandLogoLightVariant === id ? activeCls : ''}`}
                      aria-pressed={brandLogoLightVariant === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <p className={sectionLabelCls}>Waitlist FAB style</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bottom-right CTA after hero — compare layouts before picking a default.
              </p>
              {onWaitlistFabStyleChange && waitlistFabStyles.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {waitlistFabStyles.map(({ id, label }) => (
                    <Button
                      key={id}
                      type="button"
                      onClick={() => onWaitlistFabStyleChange(id)}
                      variant="navGhost"
                      size="default"
                      className={`${menuBtnCls} !h-10 !px-3 !text-sm ${waitlistFabStyle === id ? activeCls : ''}`}
                      aria-pressed={waitlistFabStyle === id}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ) : null}
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
