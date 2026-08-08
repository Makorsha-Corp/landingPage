import { RainbowButton } from '@/components/ui/rainbow-button'
import Button from './ui/Button'
import Homepage2HeroSettings from '../pages/Homepage2HeroSettings'

const heroFloatingWrap =
  'text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]'
const heroFloatingBadge =
  'text-xs font-semibold uppercase tracking-[0.2em] text-white/80'
const heroFloatingTitle =
  'mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.7)]'
const heroBodyTextShadow = '[text-shadow:0_2px_12px_rgba(0,0,0,0.65)]'

function HeroButtons({ onGoWaitlist, onGoExplore, signUpVariant = 'brand', signUpRef }) {
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
        variant="heroGlass"
        size="lg"
        className="min-w-0 flex-1 sm:flex-none sm:w-auto"
      >
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

function HeroSubtitle({ className, textShadow, children, compactTop = false }) {
  const topCls = compactTop ? 'mt-4' : 'mt-5'
  return (
    <p
      className={`mx-auto ${topCls} max-w-2xl text-lg sm:text-xl font-medium leading-relaxed ${className} ${textShadow}`}
    >
      {children}
    </p>
  )
}

function HeroBodyParagraphs({ hero, className, textShadow }) {
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

export default function Homepage2HeroOverlay({
  hero,
  editMode,
  heroActive,
  onGoWaitlist,
  onGoExplore,
  onHeroChange,
  heroSignUpButtonVariant = 'brand',
  heroSignUpRef,
}) {
  if (editMode && heroActive) {
    return (
      <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/20 bg-black/50 p-6 px-6 shadow-2xl backdrop-blur-md ring-2 ring-primary/50">
        <Homepage2HeroSettings hero={hero} onChange={onHeroChange} />
      </div>
    )
  }

  return (
    <div className={`relative mx-auto max-w-2xl px-6 ${heroFloatingWrap}`}>
      <HeroBadge className={heroFloatingBadge}>{hero.badge}</HeroBadge>
      <HeroTitle className={heroFloatingTitle}>{hero.title}</HeroTitle>
      {hero.subtitle?.trim() ? (
        <HeroSubtitle className="text-white/95" textShadow={heroBodyTextShadow}>
          {hero.subtitle}
        </HeroSubtitle>
      ) : null}
      <HeroBodyParagraphs hero={hero} className="text-white/95" textShadow={heroBodyTextShadow} />
      <HeroButtons
        onGoWaitlist={onGoWaitlist}
        onGoExplore={onGoExplore}
        signUpVariant={heroSignUpButtonVariant}
        signUpRef={heroSignUpRef}
      />
    </div>
  )
}
