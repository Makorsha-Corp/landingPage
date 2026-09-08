import { getStoryCardStyles } from './storyCardStyles'

const CARD_SHELL_BASE =
  'relative w-full max-w-none text-center rounded-none p-5 sm:p-7 md:mx-auto md:max-w-[640px] md:rounded-2xl'

/** Shared dark tour glass — story cards only; hero uses lighter fill below. */
const DARK_TOUR_GLASS_SHELL =
  'border border-white/10 bg-black/45 text-white backdrop-blur-md'

const HERO_DARK_GLASS_SHELL =
  'bg-black/55 text-white backdrop-blur-md md:border md:border-white/10'

const HERO_LIGHT_GLASS_SHELL =
  'bg-white/55 text-foreground backdrop-blur-md md:border md:border-white/60 md:ring-1 md:ring-inset md:ring-black/5 md:shadow-black/10'

/** Hero overlay glass — slightly more transparent than story cards. */
const HERO_CARD_SHELL = {
  dark: `${CARD_SHELL_BASE} ${HERO_DARK_GLASS_SHELL}`,
  light: `${CARD_SHELL_BASE} ${HERO_LIGHT_GLASS_SHELL}`,
}

const HERO_CARD_TEXT = {
  dark: {
    wrap: 'text-white',
    badge: 'text-white/75',
    title: 'text-white',
    body: 'text-white/90',
    titleShadow: '',
    bodyShadow: '',
  },
  light: {
    wrap: '',
    badge: 'text-muted-foreground',
    title: 'text-foreground',
    body: 'text-muted-foreground',
    titleShadow: '',
    bodyShadow: '',
  },
}

function themeKey(theme) {
  return theme === 'dark' ? 'dark' : 'light'
}

export function getHeroCardShellClasses(theme = 'dark') {
  const edgeClass =
    themeKey(theme) === 'dark' ? 'hero-mobile-banner-edge-dark' : 'hero-mobile-banner-edge-light'
  return `${HERO_CARD_SHELL[themeKey(theme)]} tour-glass-shell isolate ${edgeClass}`
}

/** Same glass fill/blur as hero shell — for tour story cards (desktop + mobile). */
export function getHeroMatchedGlassClasses(theme = 'dark') {
  return getTourStoryCardShellClasses(theme)
}

export function getTourStoryCardShellClasses(theme = 'dark') {
  if (themeKey(theme) === 'dark') {
    return DARK_TOUR_GLASS_SHELL
  }
  return getStoryCardStyles('light').card
}

/** Left-aligned tour story copy — matches hero text opacities. */
export function getTourStoryCardTextClasses(theme = 'dark') {
  const text = HERO_CARD_TEXT[themeKey(theme)]
  return {
    title: text.title || 'text-foreground',
    desc: text.body,
  }
}

export function getHeroCardTextClasses(theme = 'dark') {
  return { ...HERO_CARD_TEXT[themeKey(theme)] }
}

export function getHeroExploreButtonVariant(theme = 'dark') {
  return themeKey(theme) === 'light' ? 'marketingOutline' : 'heroGlass'
}
