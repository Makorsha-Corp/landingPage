import { getStoryCardStyles } from './storyCardStyles'

const CARD_SHELL_BASE = 'relative mx-auto max-w-[640px] text-center rounded-2xl p-5 sm:p-7'

/** Subtle tour-card glass — dark stays lighter; light matches story card for handoff. */
const HERO_CARD_SHELL = {
  dark: `${CARD_SHELL_BASE} border border-white/8 bg-black/25 backdrop-blur-sm`,
  light: `${CARD_SHELL_BASE} ${getStoryCardStyles('light').card}`,
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
  return `${HERO_CARD_SHELL[themeKey(theme)]} tour-glass-shell isolate`
}

/** Same glass fill/blur as hero shell — for mobile story cards (no hero layout sizing). */
export function getHeroMatchedGlassClasses(theme = 'dark') {
  if (themeKey(theme) === 'dark') {
    return 'border border-white/8 bg-black/25 backdrop-blur-sm'
  }
  return getStoryCardStyles('light').card
}

export function getHeroCardTextClasses(theme = 'dark') {
  return { ...HERO_CARD_TEXT[themeKey(theme)] }
}

export function getHeroExploreButtonVariant(theme = 'dark') {
  return themeKey(theme) === 'light' ? 'marketingOutline' : 'heroGlass'
}
