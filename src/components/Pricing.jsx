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

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`animate-fade-up delay-${(index + 1) * 100} relative rounded-2xl border ${
                tier.highlighted
                  ? 'border-primary bg-card shadow-xl shadow-primary/10 scale-105 z-10'
                  : 'border-border bg-card'
              } p-8 transition-all hover:shadow-lg`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-primary mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.name === 'Enterprise' ? '#contact' : 'https://frontend-theta-dusky-91.vercel.app/login2'}
                className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All prices in USD. Billed monthly or annually (save 20%). 
          <a href="#faq" className="text-primary hover:underline ml-1">
            See FAQ for more details
          </a>
        </p>
      </div>
    </section>
  )
}
