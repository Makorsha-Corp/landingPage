const testimonials = [
  {
    quote: "Marker transformed how we manage our textile mill. We used to spend hours tracking orders across spreadsheets — now everything is in one place and our team actually enjoys using it.",
    author: 'Sarah Chen',
    role: 'Operations Director',
    company: 'Pacific Cotton Mills',
    avatar: 'SC',
    avatarBg: 'bg-purple-500',
  },
  {
    quote: "The production planning module alone saved us 20% on material waste. Being able to track expected vs actual outputs across batches gave us insights we never had before.",
    author: 'Ahmed Hassan',
    role: 'Plant Manager',
    company: 'Delta Textiles',
    avatar: 'AH',
    avatarBg: 'bg-blue-500',
  },
  {
    quote: "Finally, an ERP that doesn't require a 6-month implementation. We were up and running in a week, and the support team actually understands manufacturing.",
    author: 'Maria Rodriguez',
    role: 'CEO',
    company: 'Sunrise Fabrics',
    avatar: 'MR',
    avatarBg: 'bg-green-500',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Trusted by manufacturers worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about running their operations with Marker.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`animate-fade-up delay-${(index + 1) * 100} relative rounded-2xl border border-border bg-card p-6 sm:p-8`}
            >
              {/* Quote Icon */}
              <svg
                className="absolute top-6 right-6 h-8 w-8 text-primary/20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${testimonial.avatarBg} text-white font-semibold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Logos */}
        <div className="mt-16 border-t border-border pt-12">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Powering operations at companies of all sizes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            {['Pacific Cotton', 'Delta Textiles', 'Sunrise Fabrics', 'Global Mills', 'Apex Manufacturing'].map((company) => (
              <div key={company} className="text-lg font-semibold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
