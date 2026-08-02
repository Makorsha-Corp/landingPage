export const HERO_CARD_LAYOUTS = ['none', 'wrap_all', 'below_copy', 'split']

export const HERO_CARD_STYLES = ['glass_dark', 'glass_light', 'elevated_solid', 'subtle_ring']

export const DEFAULT_HERO_CARD = {
  layout: 'none',
  style: 'glass_dark',
}

const LAYOUT_LABELS = {
  none: 'None',
  wrap_all: 'Wrap all',
  below_copy: 'Below copy',
  split: 'Split',
}

const STYLE_LABELS = {
  glass_dark: 'Glass dark',
  glass_light: 'Glass light',
  elevated_solid: 'Elevated',
  subtle_ring: 'Subtle ring',
}

export function normalizeHeroCardPrefs(prefs) {
  const layout = HERO_CARD_LAYOUTS.includes(prefs?.layout)
    ? prefs.layout
    : DEFAULT_HERO_CARD.layout
  const style = HERO_CARD_STYLES.includes(prefs?.style) ? prefs.style : DEFAULT_HERO_CARD.style
  return { layout, style }
}

export function getHeroCardLayoutLabel(layout) {
  return LAYOUT_LABELS[layout] ?? LAYOUT_LABELS.none
}

export function getHeroCardStyleLabel(style) {
  return STYLE_LABELS[style] ?? STYLE_LABELS.glass_dark
}

export function cycleHeroCardLayout(current) {
  const index = HERO_CARD_LAYOUTS.indexOf(current)
  const nextIndex = index >= 0 ? (index + 1) % HERO_CARD_LAYOUTS.length : 0
  return HERO_CARD_LAYOUTS[nextIndex]
}

export function cycleHeroCardStyle(current) {
  const index = HERO_CARD_STYLES.indexOf(current)
  const nextIndex = index >= 0 ? (index + 1) % HERO_CARD_STYLES.length : 0
  return HERO_CARD_STYLES[nextIndex]
}

export function getHeroCardShellClass(style, theme) {
  const base = 'rounded-2xl border'

  switch (style) {
    case 'glass_light':
      return theme === 'dark'
        ? `${base} border-white/10 bg-black/45 text-white backdrop-blur-md shadow-2xl`
        : `${base} border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-2xl shadow-black/10`
    case 'elevated_solid':
      return `${base} border-0 rounded-3xl bg-card text-foreground shadow-2xl ring-1 ring-border/70`
    case 'subtle_ring':
      return theme === 'dark'
        ? `${base} border-white/20 bg-black/15 text-white ring-1 ring-white/10 backdrop-blur-sm shadow-lg`
        : `${base} border-white/50 bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-sm shadow-lg`
    case 'glass_dark':
    default:
      return `${base} border-white/10 bg-black/45 text-white backdrop-blur-md shadow-2xl`
  }
}

export function getHeroCardContentColors(style, theme) {
  if (style === 'elevated_solid') {
    return {
      badge: 'text-muted-foreground',
      title: 'text-foreground',
      subtitle: 'text-muted-foreground',
      textShadow: '',
    }
  }

  if (style === 'glass_light' && theme === 'light') {
    return {
      badge: 'text-muted-foreground',
      title: 'text-foreground',
      subtitle: 'text-muted-foreground',
      textShadow: '',
    }
  }

  return {
    badge: 'text-white/80',
    title: 'text-white',
    subtitle: 'text-white',
    textShadow: '[text-shadow:0_2px_12px_rgba(0,0,0,0.65)]',
  }
}

export function getHeroFloatingTextClasses() {
  return {
    wrap: 'text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]',
    badge: 'text-xs font-semibold uppercase tracking-[0.2em] text-white/80',
    title:
      'mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.7)]',
  }
}
