import { BRAND_NAME } from '../../lib/brand'

export interface WaitlistCopy {
  brandName: string
  eyebrow: string
  titleLine1: string
  titleLine2: string
  lead: string
  secondaryPrompt: string
  secondaryLinkLabel: string
  secondaryLinkHref: string
  formEyebrow: string
}

export const WAITLIST_COPY: WaitlistCopy = {
  brandName: BRAND_NAME,
  eyebrow: 'Early access',
  titleLine1: 'Join the',
  titleLine2: 'waitlist.',
  lead: `Be first to know when ${BRAND_NAME} opens. We'll email you when your spot is ready.`,
  secondaryPrompt: 'Questions?',
  secondaryLinkLabel: 'See FAQ',
  secondaryLinkHref: '#faq',
  formEyebrow: 'Details',
}
