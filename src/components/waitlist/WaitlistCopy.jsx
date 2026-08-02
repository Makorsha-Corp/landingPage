import SectionEyebrow from '../SectionEyebrow'
import { sectionLead, sectionTitle } from '../../lib/loginSurfaceStyles'
import { TRUST_BULLETS, WAITLIST_COPY } from './waitlistContent'

function CheckIcon({ className = 'text-primary' }) {
  return (
    <svg
      className={`mt-0.5 h-5 w-5 shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function WaitlistCopyHeader({
  eyebrowClassName = '',
  titleClassName = sectionTitle,
  leadClassName = sectionLead,
}) {
  return (
    <div className="text-left">
      <SectionEyebrow className={eyebrowClassName}>{WAITLIST_COPY.eyebrow}</SectionEyebrow>
      <h2 className={`mt-3 ${titleClassName}`}>{WAITLIST_COPY.title}</h2>
      <p className={`mt-3 ${leadClassName}`}>{WAITLIST_COPY.lead}</p>
    </div>
  )
}

export function WaitlistTrustList({ inverted = false, className = '' }) {
  const iconCls = inverted ? 'text-white' : 'text-primary'
  const textCls = inverted ? 'text-white/85' : 'text-muted-foreground'

  return (
    <ul className={`space-y-2 text-sm sm:text-base ${className}`}>
      {TRUST_BULLETS.map((text) => (
        <li key={text} className={`flex items-start gap-2.5 ${textCls}`}>
          <CheckIcon className={iconCls} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}
