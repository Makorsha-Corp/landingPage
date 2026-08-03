/** Black overlay on hero — strength 0–100 per theme (100 = full style base). */
export const DEFAULT_HERO_OVERLAY_SCRIM_STRENGTH = { light: 50, dark: 50 }
export const DEFAULT_HERO_OVERLAY_SCRIM_STYLE = 'radial'

export const HERO_OVERLAY_SCRIM_STYLE_LIST = [
  { id: 'linear-top', label: 'Linear top' },
  { id: 'linear-bottom', label: 'Linear bottom' },
  { id: 'radial', label: 'Radial' },
  { id: 'solid', label: 'Solid' },
  { id: 'none', label: 'None' },
]

const SCRIM_BASE = 'pointer-events-none absolute inset-0'

const LINEAR_TOP = {
  light: 'bg-gradient-to-b from-black/18 via-black/8 to-transparent',
  dark: 'bg-gradient-to-b from-black/60 via-black/35 to-black/10',
}

const LINEAR_BOTTOM = {
  light: 'bg-gradient-to-t from-black/18 via-black/8 to-transparent',
  dark: 'bg-gradient-to-t from-black/60 via-black/35 to-black/10',
}

const RADIAL_BACKGROUND = {
  light: 'radial-gradient(ellipse 90% 75% at 50% 40%, rgb(0 0 0 / 0.22), transparent 70%)',
  dark: 'radial-gradient(ellipse 90% 75% at 50% 40%, rgb(0 0 0 / 0.58), transparent 72%)',
}

export function normalizeHeroOverlayScrimStrength(
  value,
  fallback = DEFAULT_HERO_OVERLAY_SCRIM_STRENGTH,
) {
  const clampPct = (n, fb) => {
    const parsed = Number(n)
    if (!Number.isFinite(parsed)) return fb
    return Math.min(100, Math.max(0, Math.round(parsed)))
  }
  return {
    light: clampPct(value?.light, fallback.light),
    dark: clampPct(value?.dark, fallback.dark),
  }
}

export function getHeroOverlayScrimStyle(styleId = DEFAULT_HERO_OVERLAY_SCRIM_STYLE) {
  return (
    HERO_OVERLAY_SCRIM_STYLE_LIST.find((entry) => entry.id === styleId)?.id ??
    DEFAULT_HERO_OVERLAY_SCRIM_STYLE
  )
}

/** Layer shape — opacity applied separately via getHeroOverlayScrimOpacity. */
export function getHeroOverlayScrimLayer(theme, styleId = DEFAULT_HERO_OVERLAY_SCRIM_STYLE) {
  const style = getHeroOverlayScrimStyle(styleId)
  const themeKey = theme === 'dark' ? 'dark' : 'light'

  if (style === 'none') {
    return { className: SCRIM_BASE, style: undefined }
  }

  if (style === 'solid') {
    return { className: `${SCRIM_BASE} bg-black`, style: undefined }
  }

  if (style === 'radial') {
    return {
      className: SCRIM_BASE,
      style: { background: RADIAL_BACKGROUND[themeKey] },
    }
  }

  if (style === 'linear-bottom') {
    return { className: `${SCRIM_BASE} ${LINEAR_BOTTOM[themeKey]}`, style: undefined }
  }

  return { className: `${SCRIM_BASE} ${LINEAR_TOP[themeKey]}`, style: undefined }
}

export function getHeroOverlayScrimOpacity(
  strengthPair,
  theme,
  styleId = DEFAULT_HERO_OVERLAY_SCRIM_STYLE,
) {
  if (getHeroOverlayScrimStyle(styleId) === 'none') {
    return 0
  }

  const themeKey = theme === 'dark' ? 'dark' : 'light'
  const strength = normalizeHeroOverlayScrimStrength(strengthPair)[themeKey]
  return strength / 100
}

/** @deprecated use getHeroOverlayScrimLayer */
export function getHeroOverlayScrimClass(theme) {
  return getHeroOverlayScrimLayer(theme, DEFAULT_HERO_OVERLAY_SCRIM_STYLE).className
}
