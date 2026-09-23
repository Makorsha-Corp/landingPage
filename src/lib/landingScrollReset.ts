/** Snap-safe scroller reset for landing mount — mirrors useSectionScroll glide pattern. */

export function disableScrollerSnap(scroller: HTMLElement | null): void {
  if (!scroller) return
  scroller.style.scrollSnapType = 'none'
}

export function restoreScrollerSnap(scroller: HTMLElement | null): void {
  if (!scroller) return
  scroller.style.removeProperty('scroll-snap-type')
}

export function resetScrollerTop(scroller: HTMLElement | null): void {
  if (!scroller) return
  scroller.scrollTop = 0
}

const SCROLL_UNTOUCHED_THRESHOLD = 8
const STABLE_FRAME_COUNT = 2
const MAX_SETTLE_MS = 300

export interface LandingScrollerMountResetOptions {
  onSettled?: () => void
}

/**
 * Force hero on load: gate snap, zero scrollTop, re-assert after layout settles, restore snap.
 * Snap restore waits for stable scroller height (2 frames) or MAX_SETTLE_MS cap.
 * window.load must never leave inline scroll-snap-type:none after settle.
 * @returns cleanup
 */
export function runLandingScrollerMountReset(
  scroller: HTMLElement | null,
  options: LandingScrollerMountResetOptions = {},
): () => void {
  if (!scroller) return () => {}

  const { onSettled } = options

  const reassertDuringSettle = (): void => {
    disableScrollerSnap(scroller)
    resetScrollerTop(scroller)
  }

  reassertDuringSettle()

  let raf1 = 0
  let raf2 = 0
  raf1 = requestAnimationFrame(() => {
    reassertDuringSettle()
    raf2 = requestAnimationFrame(reassertDuringSettle)
  })

  let settled = false
  let lastHeight = -1
  let stableFrames = 0
  let settleRaf = 0
  let maxTimer = 0
  let layoutRo: ResizeObserver | null = null
  let loadRaf = 0

  const finalizeAfterLoad = (): void => {
    if (scroller.scrollTop < SCROLL_UNTOUCHED_THRESHOLD) {
      resetScrollerTop(scroller)
    }
    restoreScrollerSnap(scroller)
  }

  const onLoad = (): void => finalizeAfterLoad()
  if (document.readyState === 'complete') {
    loadRaf = requestAnimationFrame(finalizeAfterLoad)
  } else {
    window.addEventListener('load', onLoad, { once: true })
  }

  const finishSettle = (): void => {
    if (settled) return
    settled = true
    if (scroller.scrollTop < SCROLL_UNTOUCHED_THRESHOLD) {
      resetScrollerTop(scroller)
    }
    restoreScrollerSnap(scroller)
    onSettled?.()
    layoutRo?.disconnect()
    if (settleRaf) cancelAnimationFrame(settleRaf)
    if (maxTimer) clearTimeout(maxTimer)
  }

  const tickStable = (): void => {
    if (settled) return
    const height = scroller.scrollHeight
    if (height === lastHeight) {
      stableFrames += 1
      if (stableFrames >= STABLE_FRAME_COUNT) {
        finishSettle()
        return
      }
    } else {
      lastHeight = height
      stableFrames = 0
    }
    settleRaf = requestAnimationFrame(tickStable)
  }

  layoutRo = new ResizeObserver(() => {
    stableFrames = 0
    lastHeight = -1
  })
  layoutRo.observe(scroller)

  settleRaf = requestAnimationFrame(tickStable)
  maxTimer = window.setTimeout(finishSettle, MAX_SETTLE_MS)

  return () => {
    cancelAnimationFrame(raf1)
    cancelAnimationFrame(raf2)
    if (loadRaf) cancelAnimationFrame(loadRaf)
    window.removeEventListener('load', onLoad)
    layoutRo?.disconnect()
    if (settleRaf) cancelAnimationFrame(settleRaf)
    if (maxTimer) clearTimeout(maxTimer)
  }
}
