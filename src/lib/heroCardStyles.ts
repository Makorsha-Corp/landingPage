const CARD_SHELL_BASE =
  'relative w-full max-w-none text-center rounded-none p-5 sm:p-7 md:mx-auto md:max-w-[640px] md:rounded-2xl'

/** Hero — over scrim + blur building. */
const HERO_DARK_GLASS_SHELL =
  'bg-card/75 text-card-foreground backdrop-blur-md md:border md:border-border/70'

/** Story — over sharp building, no scrim; lower fill + lighter blur for perceived parity with hero. */
const STORY_DARK_GLASS_SHELL =
  'border border-border/70 bg-card/90 text-card-foreground backdrop-blur-sm'

/** Story — over sharp building, no scrim. Keep in sync with storyCardStyles light card. */
const STORY_LIGHT_GLASS_SHELL =
  'border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-black/10'

/** Hero — over scrim + blur building; always-on chrome for mobile parity with story. */
const HERO_LIGHT_GLASS_SHELL =
  'bg-white/75 text-foreground backdrop-blur-md border border-white/60 ring-1 ring-inset ring-black/5 shadow-black/10'

/** Hero overlay glass — tuned separately from story for perceived see-through parity. */
const HERO_CARD_SHELL: Record<string, string> = {
  dark: `${CARD_SHELL_BASE} ${HERO_DARK_GLASS_SHELL}`,
  light: `${CARD_SHELL_BASE} ${HERO_LIGHT_GLASS_SHELL}`,
}

export interface HeroCardTextClasses {
  wrap: string
  badge: string
  title: string
  body: string
  titleShadow: string
  bodyShadow: string
}

const HERO_CARD_TEXT: Record<string, HeroCardTextClasses> = {
  dark: {
    wrap: 'text-card-foreground',
    badge: 'text-muted-foreground',
    title: 'text-card-foreground',
    body: 'text-muted-foreground',
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

function themeKey(theme: string): 'dark' | 'light' {
  return theme === 'dark' ? 'dark' : 'light'
}

export function getHeroCardShellClasses(theme: string = 'dark'): string {
  const edgeClass =
    themeKey(theme) === 'dark' ? 'hero-mobile-banner-edge-dark' : 'hero-mobile-banner-edge-light'
  return `${HERO_CARD_SHELL[themeKey(theme)]} tour-glass-shell isolate ${edgeClass}`
}

/** Story tour glass — desktop + mobile story cards. */
export function getHeroMatchedGlassClasses(theme: string = 'dark'): string {
  return getTourStoryCardShellClasses(theme)
}

export function getTourStoryCardShellClasses(theme: string = 'dark'): string {
  if (themeKey(theme) === 'dark') {
    return STORY_DARK_GLASS_SHELL
  }
  return STORY_LIGHT_GLASS_SHELL
}

export interface TourStoryCardTextClasses {
  title: string
  desc: string
}

/** Left-aligned tour story copy — desc keeps muted color, `.text-tour-story-desc` bumps weight. */
export function getTourStoryCardTextClasses(_theme: string = 'dark'): TourStoryCardTextClasses {
  return {
    title: 'text-foreground',
    desc: 'text-muted-foreground text-tour-story-desc',
  }
}

export function getHeroCardTextClasses(theme: string = 'dark'): HeroCardTextClasses {
  return { ...HERO_CARD_TEXT[themeKey(theme)] }
}

export function getHeroExploreButtonVariant(theme: string = 'dark'): string {
  return themeKey(theme) === 'light' ? 'marketingOutline' : 'heroGlass'
}
