import Button from './ui/Button'
import Homepage2HeroSettings from '../pages/Homepage2HeroSettings'
import {
  getHeroCardContentColors,
  getHeroCardShellClass,
  getHeroFloatingTextClasses,
} from '../lib/heroCardStyles'

function HeroButtons({ onGoWaitlist, onGoExplore }) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        onClick={onGoWaitlist}
        variant="heroPrimary"
        size="lg"
        className="w-full sm:w-auto"
      >
        Sign Up
      </Button>
      <Button onClick={onGoExplore} variant="heroGlass" size="lg" className="w-full sm:w-auto">
        Explore
      </Button>
    </div>
  )
}

function HeroBadge({ className, children }) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>
      {children}
    </span>
  )
}

function HeroTitle({ className, children }) {
  return (
    <h1 className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  )
}

function HeroSubtitle({ className, textShadow, children }) {
  return (
    <p
      className={`mx-auto mt-5 max-w-2xl text-lg sm:text-xl font-medium leading-relaxed ${className} ${textShadow}`}
    >
      {children}
    </p>
  )
}

export default function Homepage2HeroOverlay({
  hero,
  theme,
  layout,
  style,
  editMode,
  heroActive,
  onGoWaitlist,
  onGoExplore,
  onHeroChange,
}) {
  if (editMode && heroActive) {
    return (
      <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/20 bg-black/50 p-6 px-6 shadow-2xl backdrop-blur-md ring-2 ring-primary/50">
        <Homepage2HeroSettings hero={hero} onChange={onHeroChange} />
      </div>
    )
  }

  const shellCls = getHeroCardShellClass(style, theme)
  const colors = getHeroCardContentColors(style, theme)
  const floating = getHeroFloatingTextClasses()

  const titleInCardCls = colors.textShadow
    ? `${colors.title} [text-shadow:0_4px_18px_rgba(0,0,0,0.7)]`
    : colors.title

  if (layout === 'wrap_all') {
    return (
      <div className={`relative mx-auto max-w-2xl px-6 text-center ${shellCls} p-6 sm:p-8`}>
        <HeroBadge className={colors.badge}>{hero.badge}</HeroBadge>
        <HeroTitle className={titleInCardCls}>{hero.title}</HeroTitle>
        <HeroSubtitle className={colors.subtitle} textShadow={colors.textShadow}>
          {hero.subtitle}
        </HeroSubtitle>
        <HeroButtons onGoWaitlist={onGoWaitlist} onGoExplore={onGoExplore} />
      </div>
    )
  }

  if (layout === 'below_copy' || layout === 'split') {
    const cardGap = layout === 'split' ? 'mt-4' : 'mt-6'
    const cardPadding = layout === 'split' ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
    const cardWidth = layout === 'split' ? 'max-w-xl' : 'max-w-2xl'

    return (
      <div className={`relative mx-auto max-w-2xl px-6 ${floating.wrap}`}>
        <HeroBadge className={floating.badge}>{hero.badge}</HeroBadge>
        <HeroTitle className={floating.title}>{hero.title}</HeroTitle>
        <div className={`${cardGap} mx-auto ${cardWidth} text-center ${shellCls} ${cardPadding}`}>
          <HeroSubtitle
            className={`${colors.subtitle} ${layout === 'split' ? 'mt-0 max-w-none text-base sm:text-lg' : ''}`}
            textShadow={colors.textShadow}
          >
            {hero.subtitle}
          </HeroSubtitle>
          <HeroButtons onGoWaitlist={onGoWaitlist} onGoExplore={onGoExplore} />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative mx-auto max-w-2xl px-6 ${floating.wrap}`}>
      <HeroBadge className={floating.badge}>{hero.badge}</HeroBadge>
      <HeroTitle className={floating.title}>{hero.title}</HeroTitle>
      <HeroSubtitle className="text-white" textShadow="[text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
        {hero.subtitle}
      </HeroSubtitle>
      <HeroButtons onGoWaitlist={onGoWaitlist} onGoExplore={onGoExplore} />
    </div>
  )
}
