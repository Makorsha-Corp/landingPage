import SectionEyebrow from './SectionEyebrow'
import Button from './ui/Button'
import {
  elevatedCard,
  iconTileMd,
  marketingCard,
  sectionHeaderWrap,
  sectionLead,
  sectionTitle,
} from '../lib/loginSurfaceStyles'

const tiers = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small operations getting organized.',
    features: [
      'Up to 5 team members',
      '1 factory location',
      'Basic order management',
      'Inventory tracking',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/month',
    description: 'For growing businesses with multiple locations.',
    features: [
      'Up to 25 team members',
      'Unlimited factories',
      'Advanced workflows',
      'Machine tracking',
      'Production planning',
      'Custom reports',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large-scale operations with complex needs.',
    features: [
      'Unlimited team members',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment',
      '24/7 phone support',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

function FeatureRow({ feature }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={iconTileMd}>
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
      <span className="pt-1.5 text-xs leading-snug text-muted-foreground sm:text-sm">
        {feature}
      </span>
    </li>
  )
}

export default function Pricing({ onFaqClick, onJoinWaitlist }) {
  return (
    <section
      id="pricing"
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden py-8 sm:py-10"
    >
      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className={`mb-5 sm:mb-6 ${sectionHeaderWrap}`}>
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className={`mt-2 ${sectionTitle}`}>Simple, transparent pricing</h2>
          <p className={`mt-2 text-sm sm:text-base ${sectionLead}`}>
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid min-h-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative flex min-h-0 flex-col p-4 sm:p-5 ${
                tier.highlighted
                  ? `z-10 ${elevatedCard} ring-2 ring-primary/20`
                  : marketingCard
              } ${index === 1 ? 'lg:-mt-1 lg:mb-1' : ''}`}
            >
              {tier.highlighted ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </span>
                </div>
              ) : null}

              <div className="mb-3">
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  {tier.period ? (
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-snug text-muted-foreground sm:text-sm">
                  {tier.description}
                </p>
              </div>

              <ul className="mt-4 flex-1 space-y-2">
                {tier.features.map((feature) => (
                  <FeatureRow key={feature} feature={feature} />
                ))}
              </ul>

              <Button
                as={tier.name === 'Enterprise' ? 'a' : 'button'}
                href={tier.name === 'Enterprise' ? '#contact' : undefined}
                type={tier.name === 'Enterprise' ? undefined : 'button'}
                onClick={
                  tier.name === 'Enterprise' ? undefined : () => onJoinWaitlist?.('pricing')
                }
                variant={tier.highlighted ? 'marketing' : 'outline'}
                size="sm"
                className="mt-4 w-full sm:mt-5"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground sm:mt-5 sm:text-sm">
          All prices in USD. Billed monthly or annually (save 20%).
          {onFaqClick ? (
            <button
              type="button"
              onClick={onFaqClick}
              className="ml-1 text-primary hover:underline"
            >
              See FAQ for more details
            </button>
          ) : (
            <a href="#faq" className="ml-1 text-primary hover:underline">
              See FAQ for more details
            </a>
          )}
        </p>
      </div>
    </section>
  )
}
