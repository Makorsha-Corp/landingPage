export const DEFAULT_CARD = {
  x: '6%',
  y: '50%',
  anchor: 'bottom-left',
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

export const CARD_PRESETS = {
  'top-left': { x: '6%', y: '12%', anchor: 'top-left' },
  'top-right': { x: '94%', y: '12%', anchor: 'top-right' },
  'bottom-left': { x: '6%', y: '88%', anchor: 'bottom-left' },
  'bottom-right': { x: '94%', y: '88%', anchor: 'bottom-right' },
}

const ANCHOR_LABELS = {
  'top-left': 'Top left',
  'top-right': 'Top right',
  'bottom-left': 'Bottom left',
  'bottom-right': 'Bottom right',
}

const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'
const dpadBtnCls =
  'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40'

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

export function normalizeCard(card, fallback = DEFAULT_CARD) {
  const merged = { ...DEFAULT_CARD, ...fallback, ...(card || {}) }
  if (merged.widthPx == null) merged.widthPx = DEFAULT_CARD.widthPx
  if (merged.maxWidthVw == null) merged.maxWidthVw = DEFAULT_CARD.maxWidthVw
  if (merged.heightPx === undefined) merged.heightPx = null
  return merged
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
    Math.abs(parsePercent(card.y) - parsePercent(preset.y)) <= 1 &&
    card.anchor === preset.anchor
  )
}

export function CardPlacementDpad({ card, onChange, compact = false }) {
  const safeCard = normalizeCard(card)

  const applyPreset = (key) => {
    onChange({ ...CARD_PRESETS[key] })
  }

  const nudge = (dx, dy) => {
    onChange({
      x: formatPercent(clampPercent(parsePercent(safeCard.x) + dx)),
      y: formatPercent(clampPercent(parsePercent(safeCard.y) + dy)),
    })
  }

  const setAnchor = (anchor) => {
    onChange({ anchor })
  }

  const cornerActive = (key) => matchesPreset(safeCard, CARD_PRESETS[key])
  const btnSize = compact ? 'h-8 w-8 text-xs' : 'h-10 w-10'

  return (
    <div className="space-y-3">
      <div className="inline-grid grid-cols-3 gap-1.5">
        <button
          type="button"
          className={`${dpadBtnCls} ${btnSize} ${cornerActive('top-left') ? 'border-primary bg-primary/10 text-primary' : ''}`}
          onClick={() => applyPreset('top-left')}
          aria-label="Place card top left"
        >
          ↖
        </button>
        <button type="button" className={`${dpadBtnCls} ${btnSize}`} onClick={() => nudge(0, -NUDGE_STEP)} aria-label="Nudge up">
          ↑
        </button>
        <button
          type="button"
          className={`${dpadBtnCls} ${btnSize} ${cornerActive('top-right') ? 'border-primary bg-primary/10 text-primary' : ''}`}
          onClick={() => applyPreset('top-right')}
          aria-label="Place card top right"
        >
          ↗
        </button>

        <button type="button" className={`${dpadBtnCls} ${btnSize}`} onClick={() => nudge(-NUDGE_STEP, 0)} aria-label="Nudge left">
          ←
        </button>
        <div className={`flex ${btnSize} flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-1 text-[10px] leading-tight text-muted-foreground`}>
          <span>{formatPercent(safeCard.x)}</span>
          <span>{formatPercent(safeCard.y)}</span>
        </div>
        <button type="button" className={`${dpadBtnCls} ${btnSize}`} onClick={() => nudge(NUDGE_STEP, 0)} aria-label="Nudge right">
          →
        </button>

        <button
          type="button"
          className={`${dpadBtnCls} ${btnSize} ${cornerActive('bottom-left') ? 'border-primary bg-primary/10 text-primary' : ''}`}
          onClick={() => applyPreset('bottom-left')}
          aria-label="Place card bottom left"
        >
          ↙
        </button>
        <button type="button" className={`${dpadBtnCls} ${btnSize}`} onClick={() => nudge(0, NUDGE_STEP)} aria-label="Nudge down">
          ↓
        </button>
        <button
          type="button"
          className={`${dpadBtnCls} ${btnSize} ${cornerActive('bottom-right') ? 'border-primary bg-primary/10 text-primary' : ''}`}
          onClick={() => applyPreset('bottom-right')}
          aria-label="Place card bottom right"
        >
          ↘
        </button>
      </div>

      {!compact && (
        <div>
          <span className={labelCls}>Anchor corner</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.keys(ANCHOR_LABELS).map((anchor) => (
              <button
                key={anchor}
                type="button"
                onClick={() => setAnchor(anchor)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  safeCard.anchor === anchor
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {ANCHOR_LABELS[anchor]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CardSizeControls({ card, onChange, compact = false }) {
  const safeCard = normalizeCard(card)
  const heightAuto = safeCard.heightPx == null

  return (
    <div className={`space-y-3 ${compact ? '' : ''}`}>
      <div>
        <label className={labelCls} htmlFor="card-width">
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
          className="mt-1 w-full accent-primary"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={labelCls} htmlFor="card-height">
            Height
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
