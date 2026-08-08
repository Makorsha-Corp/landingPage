import { memo } from 'react'
import Capabilities from './Capabilities'
import Testimonials from './Testimonials'
import Pricing from './Pricing'
import FAQ from './FAQ'
import LoginZonePanel from './LoginZonePanel'
import LoginZoneBackground from './LoginZoneBackground'
import { SHOW_PRICING_SECTION } from '../lib/landingFeatureFlags'

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
}) {
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
            reducedMotion={reducedMotion}
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
        reducedMotion={reducedMotion}
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
          reducedMotion={reducedMotion}
          showGradientBackdrop={!pricingCampusBackdrop}
          backdropStyle={sectionsBackdropStyle}
        >
          <Pricing onFaqClick={onFaqClick} onJoinWaitlist={onJoinWaitlist} />
        </LoginZonePanel>
      ) : null}

      <LoginZonePanel
        panelRef={faqRef}
        theme={theme}
        reducedMotion={reducedMotion}
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
