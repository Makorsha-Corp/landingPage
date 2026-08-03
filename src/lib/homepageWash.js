/** Background dim over photo / gradient — not a purple/white color wash. */
export const DEFAULT_TOUR_BACKDROP_OPACITY = { light: 35, dark: 45 }
export const DEFAULT_SECTIONS_BACKDROP_OPACITY = { light: 70, dark: 70 }

/** @deprecated use DEFAULT_TOUR_BACKDROP_OPACITY */
export const DEFAULT_TOUR_WASH_OPACITY = DEFAULT_TOUR_BACKDROP_OPACITY

/** @deprecated use DEFAULT_SECTIONS_BACKDROP_OPACITY */
export const DEFAULT_SECTIONS_WASH_OPACITY = DEFAULT_SECTIONS_BACKDROP_OPACITY

export function normalizeBackdropOpacity(value, fallback = DEFAULT_TOUR_BACKDROP_OPACITY) {
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

/** @deprecated use normalizeBackdropOpacity */
export const normalizeWashOpacity = normalizeBackdropOpacity

export function getBackgroundOverlayStyle(theme, opacityPair) {
  const opacity = theme === 'dark' ? opacityPair.dark : opacityPair.light
  return {
    backgroundColor: `hsl(var(--background) / ${opacity / 100})`,
  }
}

/** Interpolate tour → sections dim strength (0–1 progress). */
export function getBlendedBackgroundOverlayStyle(theme, tourPair, sectionsPair, progress) {
  const tour = theme === 'dark' ? tourPair.dark : tourPair.light
  const sections = theme === 'dark' ? sectionsPair.dark : sectionsPair.light
  const t = Math.min(Math.max(progress, 0), 1)
  const pct = tour + (sections - tour) * t
  return {
    backgroundColor: `hsl(var(--background) / ${pct / 100})`,
  }
}

/** @deprecated use getBackgroundOverlayStyle */
export const getWashStyle = getBackgroundOverlayStyle

export function getBackdropOpacityLabel() {
  return 'Background opacity'
}

/** @deprecated use getBackdropOpacityLabel */
export const getWashLabel = getBackdropOpacityLabel
