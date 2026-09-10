/** Snap-safe scroller reset for landing mount — mirrors useSectionScroll glide pattern. */

export function disableScrollerSnap(scroller) {
  if (!scroller) return
  scroller.style.scrollSnapType = 'none'
}

export function restoreScrollerSnap(scroller) {
  if (!scroller) return
  scroller.style.removeProperty('scroll-snap-type')
}

export function resetScrollerTop(scroller) {
  if (!scroller) return
  scroller.scrollTop = 0
}

/**
 * Force hero on load: gate snap, zero scrollTop, re-assert after layout settles, restore snap.
 * @returns cleanup
 */
export function runLandingScrollerMountReset(scroller) {
  if (!scroller) return () => {}

  const reassert = () => {
    disableScrollerSnap(scroller)
    resetScrollerTop(scroller)
  }

  reassert()

  let raf1 = 0
  let raf2 = 0
  raf1 = requestAnimationFrame(() => {
    reassert()
    raf2 = requestAnimationFrame(reassert)
  })

  const onLoad = () => reassert()
  window.addEventListener('load', onLoad, { once: true })

  const restoreSnapTimer = window.setTimeout(() => {
    resetScrollerTop(scroller)
    restoreScrollerSnap(scroller)
  }, 120)

  return () => {
    cancelAnimationFrame(raf1)
    cancelAnimationFrame(raf2)
    window.removeEventListener('load', onLoad)
    clearTimeout(restoreSnapTimer)
  }
}
