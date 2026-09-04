import SectionEyebrow from './SectionEyebrow'
import { useTheme } from '../context/ThemeContext'
import { getStoryCardStaticClasses } from '../lib/storyCardStyles'
import {
  sectionHeaderWrap,
  sectionLead,
  sectionTitle,
} from '../lib/loginSurfaceStyles'
import { BRAND_NAME } from '../lib/brand.js'

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

const ORIGIN_LEAD = `${BRAND_NAME} was designed on the floor of a cotton mill, not in a product meeting. Every workflow on this page exists because somebody needed it to get through their day.`

function QuotePanel({ testimonial, theme, isDark }) {
  const quoteCls = isDark
    ? 'border-l-[3px] border-primary/50 pl-5 text-lg leading-relaxed text-white/90 sm:text-xl'
    : 'border-l-[3px] border-primary/40 pl-5 text-lg leading-relaxed text-foreground sm:text-xl'
  const authorCls = isDark ? 'font-semibold text-white' : 'font-semibold text-foreground'
  const roleCls = isDark ? 'text-sm text-white/65' : 'text-sm text-muted-foreground'
  const avatarCls =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary'

  const attribution = `${testimonial.role}, ${testimonial.company}`

  return (
    <figure className={getStoryCardStaticClasses(theme)}>
      <blockquote className={quoteCls}>&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-4">
        <div className={avatarCls} aria-hidden="true">
          {testimonial.avatar}
        </div>
        <div>
          <p className={authorCls}>{testimonial.author}</p>
          <p className={roleCls}>{attribution}</p>
        </div>
      </figcaption>
    </figure>
  )
}

export default function Testimonials({ testimonials = DEFAULT_TESTIMONIALS }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const headlineCls = isDark ? `${sectionTitle} text-white` : sectionTitle
  const leadCls = isDark ? `${sectionLead} text-white/75` : sectionLead

  return (
    <section className="flex h-full min-h-0 w-full flex-1 flex-col justify-center py-20">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 sm:mb-10 ${sectionHeaderWrap}`}>
          <SectionEyebrow>Proof</SectionEyebrow>
          <h2 className={`mt-3 ${headlineCls}`}>Built inside a working mill</h2>
          <p className={`mt-3 ${leadCls}`}>{ORIGIN_LEAD}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {testimonials.map((testimonial) => (
            <QuotePanel
              key={testimonial.author}
              testimonial={testimonial}
              theme={theme}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
