import { useState } from 'react'

const faqs = [
  {
    question: 'How long does it take to get started?',
    answer: 'Most teams are up and running within a day. We offer guided onboarding to help you import your existing data (suppliers, inventory, products) and configure workflows for your specific operation. No lengthy implementation required.',
  },
  {
    question: 'Can I import my existing data?',
    answer: 'Yes! Marker supports importing data from spreadsheets (Excel, CSV) for items, suppliers, customers, and inventory. Our onboarding team can help you map your existing data to Marker\'s structure.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade security including encryption at rest and in transit, regular backups, and SOC 2 compliant infrastructure. Your data is hosted on secure cloud servers with 99.9% uptime.',
  },
  {
    question: 'What\'s included in the free trial?',
    answer: 'The 14-day free trial includes full access to all features in the Pro plan. No credit card required. At the end of the trial, you can choose to subscribe or downgrade to the Starter plan.',
  },
  {
    question: 'Can I switch plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle. No penalties or hidden fees.',
  },
  {
    question: 'Do you offer training and support?',
    answer: 'All plans include email support and access to our documentation. Pro plans include priority support with faster response times. Enterprise customers get a dedicated account manager and optional on-site training.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Can't find what you're looking for?{' '}
            <a href="mailto:support@marker.io" className="text-primary hover:underline">
              Contact our team
            </a>
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`animate-fade-up delay-${Math.min((index + 1) * 100, 500)} rounded-xl border border-border bg-card overflow-hidden transition-all ${
                openIndex === index ? 'shadow-md' : ''
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
