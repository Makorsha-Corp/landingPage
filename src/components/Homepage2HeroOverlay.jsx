import { memo } from 'react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import {
  getHeroCardShellClasses,
  getHeroCardTextClasses,
  getHeroExploreButtonVariant,
} from '../lib/heroCardStyles'
import Button from './ui/Button'
import Homepage2HeroSettings from '../pages/Homepage2HeroSettings'

export function HeroButtons({
  onGoWaitlist,
  onGoExplore,
  signUpVariant = 'brand',
  signUpRef,
  exploreVariant = 'heroGlass',
}) {
  return (
    <div className="mt-8 flex flex-row items-center justify-center gap-3 sm:gap-4">
      <RainbowButton
        ref={signUpRef}
        type="button"
        onClick={(event) =>
          onGoWaitlist?.(event.currentTarget.getBoundingClientRect(), event.currentTarget)
        }
        variant={signUpVariant}
        size="lg"
        className="min-w-0 flex-1 sm:flex-none sm:w-auto"
      >
        Sign Up
      </RainbowButton>
      <Button
        onClick={onGoExplore}
        variant={exploreVariant}
        size="lg"
        className="min-w-0 flex-1 sm:flex-none sm:w-auto"
      >
        Explore
      </Button>
    </div>
  )
}

export function HeroBadge({ className, children }) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>
      {children}
    </span>
  )
}

export function HeroTitle({ className, textShadow, children }) {
  return (
    <h1 className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight ${className} ${textShadow}`}>
      {children}
    </h1>
  )
}

export function HeroSubtitle({ className, textShadow, children, compactTop = false }) {
  const topCls = compactTop ? 'mt-4' : 'mt-5'
  return (
    <p
      className={`mx-auto ${topCls} max-w-2xl text-lg sm:text-xl font-medium leading-relaxed ${className} ${textShadow}`}
    >
      {children}
    </p>
  )
}

export function HeroBodyParagraphs({ hero, className, textShadow }) {
  const paragraphs = [hero.paragraph, hero.paragraph2].filter(Boolean)
  const hasSubtitle = Boolean(hero.subtitle?.trim())

  return paragraphs.map((text, index) => (
    <HeroSubtitle
      key={index}
      className={className}
      textShadow={textShadow}
      compactTop={hasSubtitle || index > 0}
    >
      {text}
    </HeroSubtitle>
  ))
}

function Homepage2HeroOverlay({
  hero,
  editMode,
  heroActive,
  onGoWaitlist,
  onGoExplore,
  onHeroChange,
  heroSignUpButtonVariant = 'brand',
  heroSignUpRef,
  theme = 'dark',
  cardShellRef,
  contentRef,
  hideCardShell = false,
}) {
  if (editMode && heroActive) {
    return (
      <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/20 bg-black/50 p-6 px-6 shadow-2xl backdrop-blur-md ring-2 ring-primary/50">
        <Homepage2HeroSettings hero={hero} onChange={onHeroChange} />
      </div>
    )
  }

  const shellCls = getHeroCardShellClasses(theme)
  const textCls = getHeroCardTextClasses(theme)
  const exploreVariant = getHeroExploreButtonVariant(theme)

  return (
    <div
      ref={cardShellRef}
      className={`${shellCls} ${textCls.wrap} ${hideCardShell ? 'is-compositor-hidden' : ''}`}
    >
      <div ref={contentRef}>
        <HeroBadge className={textCls.badge}>{hero.badge}</HeroBadge>
        <HeroTitle className={textCls.title} textShadow={textCls.titleShadow}>
          {hero.title}
        </HeroTitle>
        {hero.subtitle?.trim() ? (
          <HeroSubtitle className={textCls.body} textShadow={textCls.bodyShadow}>
            {hero.subtitle}
          </HeroSubtitle>
        ) : null}
        <HeroBodyParagraphs hero={hero} className={textCls.body} textShadow={textCls.bodyShadow} />
        <HeroButtons
          onGoWaitlist={onGoWaitlist}
          onGoExplore={onGoExplore}
          signUpVariant={heroSignUpButtonVariant}
          signUpRef={heroSignUpRef}
          exploreVariant={exploreVariant}
        />
      </div>
    </div>
  )
}

export default memo(Homepage2HeroOverlay)
