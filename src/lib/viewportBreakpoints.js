/** Tailwind `md` — tour mobile/desktop split (JS + CSS). */
export const TOUR_MD_MIN_PX = 768
export const TOUR_MD_MAX_PX = TOUR_MD_MIN_PX - 1

/** Tailwind default `lg`. */
export const DESKTOP_LG_MIN_PX = 1024

export const MOBILE_TOUR_QUERY = `(max-width: ${TOUR_MD_MAX_PX}px)`
export const DESKTOP_MD_QUERY = `(min-width: ${TOUR_MD_MIN_PX}px)`
export const DESKTOP_LG_QUERY = `(min-width: ${DESKTOP_LG_MIN_PX}px)`

export function readViewportLayoutSignals() {
  if (typeof window === 'undefined') return null

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    isMobileTour: window.matchMedia(MOBILE_TOUR_QUERY).matches,
    isDesktopMd: window.matchMedia(DESKTOP_MD_QUERY).matches,
    isDesktopLg: window.matchMedia(DESKTOP_LG_QUERY).matches,
  }
}
