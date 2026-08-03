import SectionEyebrow from './SectionEyebrow'
import PricingMobileCarousel from './pricing/PricingMobileCarousel'
import PricingTierCard from './pricing/PricingTierCard'
import { PRICING_TIERS } from '../lib/pricingTiers'
import {
  sectionHeaderWrap,
  sectionLead,
  sectionTitle,
} from '../lib/loginSurfaceStyles'

export default function Pricing({ onFaqClick, onJoinWaitlist }) {
  return (
    <section id="pricing" className="relative w-full py-20 sm:py-24">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 sm:mb-10 ${sectionHeaderWrap}`}>
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className={`mt-2 ${sectionTitle}`}>Simple, transparent pricing</h2>
          <p className={`mt-2 text-sm sm:text-base ${sectionLead}`}>
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="lg:hidden">
          <PricingMobileCarousel tiers={PRICING_TIERS} onJoinWaitlist={onJoinWaitlist} />
        </div>

        <div className="hidden items-stretch gap-5 lg:grid lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.name}
              tier={tier}
              presentation={tier.highlighted ? 'mobileHero' : 'mobileMuted'}
              reserveBadgeSpace
              interactive
              className={tier.highlighted ? 'z-10 h-full' : 'h-full'}
              onJoinWaitlist={onJoinWaitlist}
            />
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
