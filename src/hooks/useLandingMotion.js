/**
 * Landing motion policy — bypass OS prefers-reduced-motion.
 *
 * Windows "Animation effects" off sets prefers-reduced-motion: reduce in the browser.
 * Product decision: core landing UX (scroll tour, waitlist, sections) always animates.
 * Do not replace this with matchMedia / useReducedMotion.
 *
 * @returns {{ reducedMotion: false }}
 */
export default function useLandingMotion() {
  return { reducedMotion: false }
}
