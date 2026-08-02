import SectionEyebrow from './SectionEyebrow'
import {
  iconTileLg,
  marketingCardInteractive,
  sectionHeaderWrap,
  sectionLead,
  sectionTitle,
} from '../lib/loginSurfaceStyles'

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    author: 'Ashfaque Abir',
    role: 'Operations Manager',
    company: 'Akbar Cotton Mill',
    avatar: 'AA',
  },
]

export default function Testimonials({ testimonials = DEFAULT_TESTIMONIALS }) {
  const count = testimonials.length
  const gridCols =
    count === 1
      ? 'grid-cols-1 max-w-3xl mx-auto'
      : count === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-3'

  return (
    <section className="flex h-full min-h-0 w-full flex-1 flex-col justify-center py-20">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className={`mb-10 ${sectionHeaderWrap}`}>
          <SectionEyebrow>Proof</SectionEyebrow>
          <h2 className={`mt-3 ${sectionTitle}`}>Built inside a working mill</h2>
          <p className={`mt-3 ${sectionLead}`}>
            Marker was designed on the floor of a cotton mill, not in a product meeting. Every
            workflow on this page exists because somebody needed it to get through their day.
          </p>
        </div>

        <div className={`grid gap-6 ${gridCols}`}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className={`relative sm:p-6 ${marketingCardInteractive}`}>
              <svg
                className="absolute right-5 top-5 h-8 w-8 text-primary/20"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <blockquote className="mb-6 text-lg leading-relaxed text-foreground sm:text-xl">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className={iconTileLg}>{testimonial.avatar}</div>
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

        <div className="mt-10 border-t border-border/80 pt-8">
          <p className="mb-6 text-center text-sm text-muted-foreground">In production at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-lg font-semibold text-muted-foreground">Akbar Cotton Mill</div>
          </div>
        </div>
      </div>
    </section>
  )
}
