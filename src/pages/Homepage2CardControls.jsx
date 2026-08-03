export const DEFAULT_CARD = {
  x: '6%',
  y: '50%',
  widthPx: 640,
  heightPx: null,
  maxWidthVw: 92,
}

const NUDGE_STEP = 2
const CARD_CLAMP_MIN = 2
const CARD_CLAMP_MAX = 98
const WIDTH_MIN = 320
const WIDTH_MAX = 960
const WIDTH_STEP = 16
const HEIGHT_MIN = 200
const HEIGHT_MAX = 800

const LEGACY_REF_W = 1280
const LEGACY_REF_H = 720
const LEGACY_DEFAULT_H = 200

/** Top-left x/y presets (640px-wide card on ~1280px stage). */
export const CARD_PRESETS = {
  'top-left': { x: '6%', y: '12%' },
  'top-right': { x: '44%', y: '12%' },
  'bottom-left': { x: '6%', y: '58%' },
  'bottom-right': { x: '44%', y: '58%' },
}

const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'
const labelOverlayCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60'
const dpadBtnCls =
  'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40'
const dpadBtnOverlayCls =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/30 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40'

function getControlTheme(variant) {
  if (variant === 'overlay') {
    return {
      label: labelOverlayCls,
      dpadBtn: dpadBtnOverlayCls,
      center:
        'flex h-9 w-9 flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/20 px-1 text-[10px] leading-tight text-white/70',
    }
  }

  return {
    label: labelCls,
    dpadBtn: dpadBtnCls,
    center:
      'flex h-10 w-10 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-1 text-[10px] leading-tight text-muted-foreground',
  }
}

export function parsePercent(value) {
  if (typeof value === 'number') return value
  const n = parseFloat(String(value || '0').replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

export function formatPercent(value) {
  return `${Math.round(parsePercent(value))}%`
}

function clampPercent(value) {
  return Math.min(CARD_CLAMP_MAX, Math.max(CARD_CLAMP_MIN, Math.round(value)))
}

function legacyAnchorToTopLeft(card) {
  const x = parsePercent(card.x)
  const y = parsePercent(card.y)
  const widthPx = card.widthPx ?? DEFAULT_CARD.widthPx
  const maxWidthVw = card.maxWidthVw ?? DEFAULT_CARD.maxWidthVw
  const width = Math.min(widthPx, (maxWidthVw / 100) * LEGACY_REF_W)
  const height = card.heightPx ?? LEGACY_DEFAULT_H
  const widthPct = (width / LEGACY_REF_W) * 100
  const heightPct = (height / LEGACY_REF_H) * 100

  switch (card.anchor) {
    case 'bottom-right':
      return {
        x: formatPercent(clampPercent(x - widthPct)),
        y: formatPercent(clampPercent(y - heightPct)),
      }
    case 'bottom-left':
      return {
        x: formatPercent(clampPercent(x)),
        y: formatPercent(clampPercent(y - heightPct)),
      }
    case 'top-right':
      return {
        x: formatPercent(clampPercent(x - widthPct)),
        y: formatPercent(clampPercent(y)),
      }
    case 'top-left':
    default:
      return {
        x: formatPercent(clampPercent(x)),
        y: formatPercent(clampPercent(y)),
      }
  }
}

export function normalizeCard(card, fallback = DEFAULT_CARD) {
  const merged = { ...DEFAULT_CARD, ...fallback, ...(card || {}) }
  if (merged.widthPx == null) merged.widthPx = DEFAULT_CARD.widthPx
  if (merged.maxWidthVw == null) merged.maxWidthVw = DEFAULT_CARD.maxWidthVw
  if (merged.heightPx === undefined) merged.heightPx = null

  if (merged.anchor && merged.anchor !== 'top-left') {
    const { anchor: _anchor, ...rest } = merged
    return { ...rest, ...legacyAnchorToTopLeft(merged) }
  }

  const { anchor: _anchor, ...withoutAnchor } = merged
  return withoutAnchor
}

export function getCardStyle(card, fallback = DEFAULT_CARD) {
  const c = normalizeCard(card, fallback)
  return {
    width: `${c.widthPx}px`,
    maxWidth: `${c.maxWidthVw}vw`,
    ...(c.heightPx ? { height: `${c.heightPx}px`, overflowY: 'auto' } : {}),
  }
}

function matchesPreset(card, preset) {
  return (
    Math.abs(parsePercent(card.x) - parsePercent(preset.x)) <= 1 &&
    Math.abs(parsePercent(card.y) - parsePercent(preset.y)) <= 1
  )
}

export function CardPlacementDpad({ card, onChange, compact = false, variant = 'default' }) {
  const safeCard = normalizeCard(card)
  const theme = getControlTheme(variant)

  const applyPreset = (key) => {
    onChange({ ...CARD_PRESETS[key] })
  }

  const nudge = (dx, dy) => {
    onChange({
      x: formatPercent(clampPercent(parsePercent(safeCard.x) + dx)),
      y: formatPercent(clampPercent(parsePercent(safeCard.y) + dy)),
    })
  }

  const cornerActive = (key) => matchesPreset(safeCard, CARD_PRESETS[key])
  const btnSize = compact || variant === 'overlay' ? 'h-8 w-8 text-xs' : 'h-10 w-10'
  const overlayBtnSize = variant === 'overlay' ? '!h-9 !w-9' : ''

  return (
    <div className="space-y-3">
      <div className="inline-grid grid-cols-3 gap-1.5">
        <button
          type="button"
          className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize} ${cornerActive('top-left') ? 'border-primary bg-primary/20 text-primary' : ''}`}
          onClick={() => applyPreset('top-left')}
          aria-label="Place card top left"
        >
          ↖
        </button>
        <button type="button" className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize}`} onClick={() => nudge(0, -NUDGE_STEP)} aria-label="Nudge up">
          ↑
        </button>
        <button
          type="button"
          className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize} ${cornerActive('top-right') ? 'border-primary bg-primary/20 text-primary' : ''}`}
          onClick={() => applyPreset('top-right')}
          aria-label="Place card top right"
        >
          ↗
        </button>

        <button type="button" className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize}`} onClick={() => nudge(-NUDGE_STEP, 0)} aria-label="Nudge left">
          ←
        </button>
        <div className={`${theme.center} ${overlayBtnSize}`}>
          <span>{formatPercent(safeCard.x)}</span>
          <span>{formatPercent(safeCard.y)}</span>
        </div>
        <button type="button" className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize}`} onClick={() => nudge(NUDGE_STEP, 0)} aria-label="Nudge right">
          →
        </button>

        <button
          type="button"
          className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize} ${cornerActive('bottom-left') ? 'border-primary bg-primary/20 text-primary' : ''}`}
          onClick={() => applyPreset('bottom-left')}
          aria-label="Place card bottom left"
        >
          ↙
        </button>
        <button type="button" className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize}`} onClick={() => nudge(0, NUDGE_STEP)} aria-label="Nudge down">
          ↓
        </button>
        <button
          type="button"
          className={`${theme.dpadBtn} ${btnSize} ${overlayBtnSize} ${cornerActive('bottom-right') ? 'border-primary bg-primary/20 text-primary' : ''}`}
          onClick={() => applyPreset('bottom-right')}
          aria-label="Place card bottom right"
        >
          ↘
        </button>
      </div>
    </div>
  )
}

export function CardSizeControls({ card, onChange, compact = false, variant = 'default' }) {
  const safeCard = normalizeCard(card)
  const heightAuto = safeCard.heightPx == null
  const theme = getControlTheme(variant)
  const sliderCls = variant === 'overlay' ? 'mt-1 w-full accent-primary' : 'mt-1 w-full accent-primary'
  const autoLabelCls =
    variant === 'overlay'
      ? 'flex items-center gap-1.5 text-xs text-white/60'
      : 'flex items-center gap-1.5 text-xs text-muted-foreground'

  return (
    <div className={`space-y-3 ${compact ? '' : ''}`}>
      <div>
        <label className={theme.label} htmlFor="card-width">
          Width ({safeCard.widthPx}px)
        </label>
        <input
          id="card-width"
          type="range"
          min={WIDTH_MIN}
          max={WIDTH_MAX}
          step={WIDTH_STEP}
          value={safeCard.widthPx}
          onChange={(e) => onChange({ widthPx: Number(e.target.value) })}
          className={sliderCls}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={theme.label} htmlFor="card-height">
            Height
          </label>
          <label className={autoLabelCls}>
            <input
              type="checkbox"
              checked={heightAuto}
              onChange={(e) => onChange({ heightPx: e.target.checked ? null : 400 })}
              className="rounded border-border accent-primary"
            />
            Auto
          </label>
        </div>
        {!heightAuto && (
          <input
            id="card-height"
            type="range"
            min={HEIGHT_MIN}
            max={HEIGHT_MAX}
            step={16}
            value={safeCard.heightPx ?? 400}
            onChange={(e) => onChange({ heightPx: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        )}
      </div>
    </div>
  )
}
