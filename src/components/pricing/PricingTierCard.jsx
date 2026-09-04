import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import useDynamicFeatureLimit from '../../hooks/useDynamicFeatureLimit'
import {
  elevatedCard,
  iconTileMd,
  marketingCard,
} from '../../lib/loginSurfaceStyles'

export const HIGHLIGHT_BADGE = 'Most benefits'

const TIER_CARD_SHELL =
  'relative flex min-h-[inherit] flex-col rounded-3xl p-5 shadow-2xl ring-1'

const TIER_CARD_HOVER_BASE =
  'lg:transition-[box-shadow,ring-color,border-color] lg:duration-300 lg:ease-out lg:hover:shadow-[0_28px_56px_-16px_rgba(0,0,0,0.22)]'

const TIER_CARD_HOVER_HERO = `${TIER_CARD_HOVER_BASE} lg:hover:ring-primary/50`

const TIER_CARD_HOVER_MUTED = `${TIER_CARD_HOVER_BASE} lg:hover:border-primary/35 lg:hover:ring-primary/25`

const BADGE_WRAP = 'mb-3 flex justify-center'

const BADGE_SIZE =
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold'

const MOBILE_ICON_TILE =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/12 text-brand-primary'

const MOBILE_HERO_ICON_TILE =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white'

const PRESENTATION_STYLES = {
  default: {
    shell: (tier, layoutOffset) =>
      `relative flex min-h-0 flex-col p-4 sm:p-5 ${
        tier.highlighted ? `z-10 ${elevatedCard} ring-2 ring-primary/20` : marketingCard
      } ${layoutOffset ? 'lg:-mt-1 lg:mb-1' : ''}`,
    showBadge: (tier) => tier.highlighted,
    badgeWrap: 'mb-3 flex justify-center',
    badge: 'inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white',
    title: 'text-lg font-semibold text-foreground',
    price: 'text-3xl font-bold tracking-tight text-foreground',
    period: 'text-sm text-muted-foreground',
    description: 'mt-2 text-xs leading-snug text-muted-foreground sm:text-sm',
    iconTile: iconTileMd,
    featureText: 'pt-1.5 text-xs leading-snug text-muted-foreground sm:text-sm',
    featureListSpacing: 'space-y-2',
    foldToggle:
      'mt-2 text-left text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
    buttonVariant: (tier) => (tier.highlighted ? 'marketing' : 'outline'),
  },
  mobileHero: {
    shell: () => `${TIER_CARD_SHELL} bg-primary ring-primary/30`,
    showBadge: () => true,
    badgeWrap: BADGE_WRAP,
    badge: `${BADGE_SIZE} bg-white/15 text-white`,
    title: 'text-lg font-semibold text-white',
    price: 'text-3xl font-bold tracking-tight text-white',
    period: 'text-sm text-white/70',
    description: 'mt-2 text-xs leading-snug text-white/85 sm:text-sm',
    iconTile: MOBILE_HERO_ICON_TILE,
    featureText: 'pt-1 text-xs leading-snug text-white/85 sm:text-sm',
    featureListSpacing: 'space-y-1.5',
    foldToggle:
      'mt-2 text-left text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
    buttonVariant: () => 'heroGlass',
  },
  mobileMuted: {
    shell: () => `${TIER_CARD_SHELL} border border-border/80 bg-card ring-border/50`,
    showBadge: () => false,
    badgeWrap: BADGE_WRAP,
    badge: `${BADGE_SIZE} bg-primary text-white`,
    title: 'text-lg font-semibold text-foreground',
    price: 'text-3xl font-bold tracking-tight text-foreground',
    period: 'text-sm text-muted-foreground',
    description: 'mt-2 text-xs leading-snug text-muted-foreground sm:text-sm',
    iconTile: MOBILE_ICON_TILE,
    featureText: 'pt-1 text-xs leading-snug text-muted-foreground sm:text-sm',
    featureListSpacing: 'space-y-1.5',
    foldToggle:
      'mt-2 text-left text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
    buttonVariant: () => 'outline',
  },
}

function FeatureRow({ feature, iconTileClass, featureTextClass, rowRef }) {
  return (
    <li ref={rowRef} className="flex items-start gap-2.5">
      <span className={iconTileClass}>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className={featureTextClass}>{feature}</span>
    </li>
  )
}

export default function PricingTierCard({
  tier,
  onJoinWaitlist,
  layoutOffset = false,
  presentation = 'default',
  foldFeatures = false,
  reserveBadgeSpace = false,
  interactive = false,
  className = '',
  style,
}) {
  const styles = PRESENTATION_STYLES[presentation] ?? PRESENTATION_STYLES.default
  const [featuresExpanded, setFeaturesExpanded] = useState(false)

  const cardRef = useRef(null)
  const headerRef = useRef(null)
  const actionsRef = useRef(null)
  const sampleRowRef = useRef(null)

  const dynamicLimit = useDynamicFeatureLimit({
    enabled: foldFeatures,
    expanded: featuresExpanded,
    totalCount: tier.features.length,
    cardRef,
    headerRef,
    actionsRef,
    sampleRowRef,
  })

  const canFoldFeatures = foldFeatures && !featuresExpanded && tier.features.length > dynamicLimit
  const visibleFeatures = featuresExpanded
    ? tier.features
    : tier.features.slice(0, foldFeatures ? dynamicLimit : tier.features.length)

  useEffect(() => {
    setFeaturesExpanded(false)
  }, [tier.name])

  const hoverCls =
    interactive && presentation === 'mobileHero'
      ? TIER_CARD_HOVER_HERO
      : interactive
        ? TIER_CARD_HOVER_MUTED
        : ''

  return (
    <div
      ref={cardRef}
      className={`${styles.shell(tier, layoutOffset)} ${hoverCls} ${className}`}
      style={style}
    >
      {styles.showBadge(tier) ? (
        <div className={styles.badgeWrap}>
          <span className={styles.badge}>{HIGHLIGHT_BADGE}</span>
        </div>
      ) : reserveBadgeSpace && styles.badgeWrap ? (
        <div className={`${styles.badgeWrap} invisible`} aria-hidden="true">
          <span className={styles.badge}>{HIGHLIGHT_BADGE}</span>
        </div>
      ) : null}

      <div ref={headerRef} className="mb-3 shrink-0">
        <h3 className={styles.title}>{tier.name}</h3>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={styles.price}>{tier.price}</span>
          {tier.period ? <span className={styles.period}>{tier.period}</span> : null}
        </div>
        <p className={styles.description}>{tier.description}</p>
      </div>

      <ul className={`mt-4 min-h-0 flex-1 ${styles.featureListSpacing}`}>
        {visibleFeatures.map((feature, index) => (
          <FeatureRow
            key={feature}
            feature={feature}
            iconTileClass={styles.iconTile}
            featureTextClass={styles.featureText}
            rowRef={index === 0 ? sampleRowRef : undefined}
          />
        ))}
      </ul>

      <div ref={actionsRef} className="mt-auto shrink-0">
        {canFoldFeatures ? (
          <button
            type="button"
            onClick={() => setFeaturesExpanded(true)}
            className={styles.foldToggle}
            aria-expanded={false}
          >
            {`Show all features (${tier.features.length})`}
          </button>
        ) : null}

        {featuresExpanded && foldFeatures && tier.features.length > dynamicLimit ? (
          <button
            type="button"
            onClick={() => setFeaturesExpanded(false)}
            className={styles.foldToggle}
            aria-expanded
          >
            Show less
          </button>
        ) : null}

        <Button
          as={tier.name === 'Enterprise' ? 'a' : 'button'}
          href={tier.name === 'Enterprise' ? '#contact' : undefined}
          type={tier.name === 'Enterprise' ? undefined : 'button'}
          onClick={
            tier.name === 'Enterprise'
              ? undefined
              : (event) =>
                  onJoinWaitlist?.(
                    'pricing',
                    event.currentTarget.getBoundingClientRect(),
                    {
                      label: tier.cta,
                      variant: styles.buttonVariant(tier),
                      face: 'button',
                    },
                    event.currentTarget,
                  )
          }
          variant={styles.buttonVariant(tier)}
          size="sm"
          className="mt-4 w-full sm:mt-5"
        >
          {tier.cta}
        </Button>
      </div>
    </div>
  )
}
