export interface LandingMotionState {
  reducedMotion: false
}

/**
 * Landing motion policy — bypass OS prefers-reduced-motion.
 *
 * Windows "Animation effects" off sets prefers-reduced-motion: reduce in the browser.
 * Product decision: core landing UX (scroll tour, waitlist, sections) always animates.
 * Do not replace this with matchMedia / useReducedMotion.
 */
export default function useLandingMotion(): LandingMotionState {
  return { reducedMotion: false }
}
