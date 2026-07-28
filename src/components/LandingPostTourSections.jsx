import { memo } from 'react'
import Capabilities from './Capabilities'
import Testimonials from './Testimonials'
import Pricing from './Pricing'
import FAQ from './FAQ'
import SignUpSection from './SignUpSection'

const SECTION_SNAP_CLASS = 'deck-panel'
const FAQ_SECTION_SNAP_CLASS = SECTION_SNAP_CLASS

function LandingPostTourSections({
  capabilitiesRef,
  testimonialsRef,
  pricingRef,
  faqRef,
  signupRef,
  waitlistSource,
  displayCapabilities,
  reducedMotion,
  editMode,
  onCapabilitiesChange,
  onSaveCapabilities,
  displayFaq,
  onFaqChange,
  onSaveFaq,
  onFaqClick,
  onJoinWaitlist,
}) {
  return (
    <>
      <div ref={capabilitiesRef} id="capabilities" className={SECTION_SNAP_CLASS}>
        <Capabilities
          capabilities={displayCapabilities}
          reducedMotion={reducedMotion}
          editMode={editMode}
          onCapabilitiesChange={onCapabilitiesChange}
          onSave={onSaveCapabilities}
        />
      </div>

      <div ref={testimonialsRef} id="proof" className={SECTION_SNAP_CLASS}>
        <Testimonials />
      </div>

      <div ref={pricingRef} className={SECTION_SNAP_CLASS}>
        <Pricing onFaqClick={onFaqClick} onJoinWaitlist={onJoinWaitlist} />
      </div>

      <div ref={faqRef} className={FAQ_SECTION_SNAP_CLASS}>
        <FAQ
          faq={displayFaq}
          reducedMotion={reducedMotion}
          editMode={editMode}
          onFaqChange={onFaqChange}
          onSave={onSaveFaq}
        />
      </div>

      <div ref={signupRef} id="waitlist" className={SECTION_SNAP_CLASS}>
        <SignUpSection source={waitlistSource} />
      </div>
    </>
  )
}

export default memo(LandingPostTourSections)
