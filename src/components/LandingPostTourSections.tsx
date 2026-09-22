import { memo } from 'react'
import type { RefObject, CSSProperties } from 'react'
import Capabilities from './Capabilities'
import Testimonials from './Testimonials'
import Pricing from './Pricing'
import FAQ from './FAQ'
import LoginZonePanel from './LoginZonePanel'
import LoginZoneBackground from './LoginZoneBackground'
import { SHOW_PRICING_SECTION } from '../lib/landingFeatureFlags'

interface CapabilityCard {
  id: string
  title: string
  description: string
  icon?: string
  screenshotSrc?: string | null
  badge?: string | null
}

interface CapabilitiesData {
  eyebrow: string
  heading: string
  sub: string
  cards: CapabilityCard[]
}

interface FaqItem {
  id: string
  question: string
  answer: string
}

interface FaqData {
  items: FaqItem[]
}

interface WaitlistMeta {
  label: string
  variant: string
  face: 'rainbow' | 'button'
}

interface SectionBackdrops {
  features?: boolean
  proof?: boolean
  pricing?: boolean
  faq?: boolean
  [key: string]: boolean | undefined
}

interface LandingPostTourSectionsProps {
  capabilitiesRef: RefObject<HTMLDivElement | null>
  testimonialsRef: RefObject<HTMLDivElement | null>
  pricingRef: RefObject<HTMLDivElement | null>
  faqRef: RefObject<HTMLDivElement | null>
  displayCapabilities: CapabilitiesData
  reducedMotion: boolean
  editMode: boolean
  scrollerRef: RefObject<HTMLElement | null>
  theme: string
  sectionBackdrops?: SectionBackdrops
  sectionsBackdropStyle?: CSSProperties
  onFeatureOverlayOpenChange: (open: boolean) => void
  onCapabilitiesChange: (updated: CapabilitiesData) => void
  displayFaq: FaqData
  onFaqChange: (patch: Partial<FaqData>) => void
  onFaqClick: () => void
  onJoinWaitlist?: (
    source: string,
    rect: DOMRect,
    meta: WaitlistMeta,
    element: HTMLElement,
  ) => void
}

const CAMPUS_PANEL_CLASS = 'deck-panel'

function LandingPostTourSections({
  capabilitiesRef,
  testimonialsRef,
  pricingRef,
  faqRef,
  displayCapabilities,
  reducedMotion,
  editMode,
  scrollerRef,
  theme,
  sectionBackdrops = {},
  sectionsBackdropStyle,
  onFeatureOverlayOpenChange,
  onCapabilitiesChange,
  displayFaq,
  onFaqChange,
  onFaqClick,
  onJoinWaitlist,
}: LandingPostTourSectionsProps) {
  const featuresCampusBackdrop = Boolean(sectionBackdrops.features)
  const proofCampusBackdrop = Boolean(sectionBackdrops.proof)
  const pricingCampusBackdrop = Boolean(sectionBackdrops.pricing)
  const faqCampusBackdrop = Boolean(sectionBackdrops.faq)

  return (
    <>
      <div ref={capabilitiesRef} id="features" className={`${CAMPUS_PANEL_CLASS} deck-panel--flow relative`}>
        {!featuresCampusBackdrop ? (
          <LoginZoneBackground
            theme={theme}
            backdropStyle={sectionsBackdropStyle}
          />
        ) : null}
        <div className="relative z-[1]">
          <Capabilities
            capabilities={displayCapabilities}
            reducedMotion={reducedMotion}
            editMode={editMode}
            scrollerRef={scrollerRef}
            onOverlayOpenChange={onFeatureOverlayOpenChange}
            onCapabilitiesChange={onCapabilitiesChange}
          />
        </div>
      </div>

      <LoginZonePanel
        panelRef={testimonialsRef}
        id="proof"
        theme={theme}
        showGradientBackdrop={!proofCampusBackdrop}
        backdropStyle={sectionsBackdropStyle}
      >
        <Testimonials />
      </LoginZonePanel>

      {SHOW_PRICING_SECTION ? (
        <LoginZonePanel
          panelRef={pricingRef}
          flow
          theme={theme}
          showGradientBackdrop={!pricingCampusBackdrop}
          backdropStyle={sectionsBackdropStyle}
        >
          <Pricing onFaqClick={onFaqClick} onJoinWaitlist={onJoinWaitlist} />
        </LoginZonePanel>
      ) : null}

      <LoginZonePanel
        panelRef={faqRef}
        theme={theme}
        showGradientBackdrop={!faqCampusBackdrop}
        backdropStyle={sectionsBackdropStyle}
      >
        <FAQ
          faq={displayFaq}
          reducedMotion={reducedMotion}
          editMode={editMode}
          onFaqChange={onFaqChange}
        />
      </LoginZonePanel>
    </>
  )
}

export default memo(LandingPostTourSections)
