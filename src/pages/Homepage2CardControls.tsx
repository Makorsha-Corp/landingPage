import type { ChangeEvent, CSSProperties } from 'react'
import type { CardLayout } from '../lib/tourScrollMath'

export type { CardLayout }

export type CardPosition = NormalizedCard

interface DefaultCard {
  x: string
  y: string
  widthPx: number
  heightPx: null
  maxWidthVw: number
}

export const DEFAULT_CARD: DefaultCard = {
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
export const CARD_PRESETS: Record<string, { x: string; y: string }> = {
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

interface ControlTheme {
  label: string
  dpadBtn: string
  center: string
}

function getControlTheme(variant: string): ControlTheme {
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

export function parsePercent(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value
  const n = parseFloat(String(value || '0').replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

export function formatPercent(value: string | number | undefined | null): string {
  return `${Math.round(parsePercent(value))}%`
}

function clampPercent(value: number): number {
  return Math.min(CARD_CLAMP_MAX, Math.max(CARD_CLAMP_MIN, Math.round(value)))
}

function toNumber(value: number | null | undefined, fallback: number): number {
  return value != null ? value : fallback
}

function legacyAnchorToTopLeft(card: CardLayout): { x: string; y: string } {
  const x = parsePercent(card.x)
  const y = parsePercent(card.y)
  const effectiveWidthPx = toNumber(card.widthPx, DEFAULT_CARD.widthPx)
  const effectiveMaxWidthVw = toNumber(card.maxWidthVw, 92)
  const width = Math.min(effectiveWidthPx, (effectiveMaxWidthVw / 100) * LEGACY_REF_W)
  const height = toNumber(card.heightPx, LEGACY_DEFAULT_H)
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

export interface NormalizedCard {
  x: string
  y: string
  widthPx: number
  heightPx: number | null
  maxWidthVw: number
}

export function normalizeCard(
  card: CardLayout | null | undefined,
  fallback: CardLayout = DEFAULT_CARD,
): NormalizedCard {
  const merged = { ...DEFAULT_CARD, ...fallback, ...(card || {}) }
  if (merged.widthPx == null) merged.widthPx = DEFAULT_CARD.widthPx
  if (merged.maxWidthVw == null) merged.maxWidthVw = DEFAULT_CARD.maxWidthVw
  if (merged.heightPx === undefined) merged.heightPx = null

  const effectiveWidthPx = toNumber(merged.widthPx, DEFAULT_CARD.widthPx)
  const effectiveMaxWidthVw = toNumber(merged.maxWidthVw, DEFAULT_CARD.maxWidthVw)
  const effectiveHeightPx: number | null = merged.heightPx ?? null

  if (merged.anchor && merged.anchor !== 'top-left') {
    const converted = legacyAnchorToTopLeft(merged as CardLayout)
    return {
      x: converted.x,
      y: converted.y,
      widthPx: effectiveWidthPx,
      heightPx: effectiveHeightPx,
      maxWidthVw: effectiveMaxWidthVw,
    }
  }

  return {
    x: typeof merged.x === 'number' ? formatPercent(merged.x) : String(merged.x ?? DEFAULT_CARD.x),
    y: typeof merged.y === 'number' ? formatPercent(merged.y) : String(merged.y ?? DEFAULT_CARD.y),
    widthPx: effectiveWidthPx,
    heightPx: effectiveHeightPx,
    maxWidthVw: effectiveMaxWidthVw,
  }
}

export function getCardStyle(
  card: CardLayout | null | undefined,
  fallback: CardLayout = DEFAULT_CARD,
): CSSProperties {
  const c = normalizeCard(card, fallback)
  return {
    width: `${c.widthPx}px`,
    maxWidth: `${c.maxWidthVw}vw`,
    ...(c.heightPx ? { height: `${c.heightPx}px`, overflowY: 'auto' as const } : {}),
  }
}

function matchesPreset(card: CardLayout, preset: { x: string; y: string }): boolean {
  return (
    Math.abs(parsePercent(card.x) - parsePercent(preset.x)) <= 1 &&
    Math.abs(parsePercent(card.y) - parsePercent(preset.y)) <= 1
  )
}

interface CardPlacementDpadProps {
  card: CardLayout
  onChange: (patch: Partial<CardLayout>) => void
  compact?: boolean
  variant?: 'default' | 'overlay'
}

export function CardPlacementDpad({ card, onChange, compact = false, variant = 'default' }: CardPlacementDpadProps) {
  const safeCard = normalizeCard(card)
  const theme = getControlTheme(variant)

  const applyPreset = (key: keyof typeof CARD_PRESETS) => {
    onChange({ ...CARD_PRESETS[key] })
  }

  const nudge = (dx: number, dy: number) => {
    onChange({
      x: formatPercent(clampPercent(parsePercent(safeCard.x) + dx)),
      y: formatPercent(clampPercent(parsePercent(safeCard.y) + dy)),
    })
  }

  const cornerActive = (key: keyof typeof CARD_PRESETS) => matchesPreset(safeCard, CARD_PRESETS[key])
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

interface CardSizeControlsProps {
  card: CardLayout
  onChange: (patch: Partial<CardLayout>) => void
  compact?: boolean
  variant?: 'default' | 'overlay'
}

export function CardSizeControls({ card, onChange, variant = 'default' }: CardSizeControlsProps) {
  const safeCard = normalizeCard(card)
  const heightAuto = safeCard.heightPx == null
  const theme = getControlTheme(variant)
  const sliderCls = 'mt-1 w-full accent-primary'
  const autoLabelCls =
    variant === 'overlay'
      ? 'flex items-center gap-1.5 text-xs text-white/60'
      : 'flex items-center gap-1.5 text-xs text-muted-foreground'

  return (
    <div className="space-y-3">
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
          value={safeCard.widthPx ?? WIDTH_MIN}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ widthPx: Number(e.target.value) })}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ heightPx: e.target.checked ? null : 400 })}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ heightPx: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        )}
      </div>
    </div>
  )
}
