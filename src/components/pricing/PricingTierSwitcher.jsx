export default function PricingTierSwitcher({ tiers, activeIndex, onSelect }) {
  return (
    <div
      className="mt-5 rounded-2xl border border-border/70 bg-muted/50 p-1 shadow-sm"
      role="tablist"
      aria-label="Pricing plans"
    >
      <div className="grid grid-cols-3 gap-1">
        {tiers.map((tier, index) => {
          const isActive = activeIndex === index
          return (
            <button
              key={tier.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`pricing-tier-panel-${tier.name}`}
              id={`pricing-tier-tab-${tier.name}`}
              onClick={() => onSelect(index)}
              className={`relative flex min-h-11 flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
                isActive
                  ? tier.highlighted
                    ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/30'
                    : 'bg-card text-foreground shadow-sm ring-1 ring-border/60'
                  : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
              }`}
            >
              <span
                className={`text-sm leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}
              >
                {tier.name}
              </span>
              <span
                className={`mt-0.5 text-[11px] leading-none ${
                  isActive
                    ? tier.highlighted
                      ? 'text-white/75'
                      : 'text-muted-foreground'
                    : 'text-muted-foreground/80'
                }`}
              >
                {tier.price}
                {tier.period}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
