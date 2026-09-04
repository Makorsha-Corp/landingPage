import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clamp } from '../lib/tourScrollMath'

const restoreSnap = (scroller) => {
  scroller.style.removeProperty('scroll-snap-type')
}

function getScrollDest(scroller, target) {
  return (
    scroller.scrollTop +
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top
  )
}

export default function useSectionScroll({
  scrollerRef,
  sectionRefMap,
  sectionIds,
  reducedMotion,
}) {
  const observedTargets = useMemo(
    () => sectionIds.map((id) => ({ id, ref: sectionRefMap[id] })),
    [sectionIds, sectionRefMap],
  )
  const [activeSection, setActiveSection] = useState('tour')
  const snapOwnerRef = useRef(null)
  const glideRafRef = useRef(0)
  const glideCleanupRef = useRef(null)

  const cancelGlide = useCallback(() => {
    if (glideRafRef.current) {
      cancelAnimationFrame(glideRafRef.current)
      glideRafRef.current = 0
    }
    if (glideCleanupRef.current) {
      glideCleanupRef.current()
      glideCleanupRef.current = null
    }
    snapOwnerRef.current = null
    const scroller = scrollerRef.current
    if (scroller) restoreSnap(scroller)
  }, [scrollerRef])

  const glideTo = useCallback(
    (targetRef) => {
      const scroller = scrollerRef.current
      const target = targetRef?.current
      if (!scroller || !target) return

      cancelGlide()

      const dest = getScrollDest(scroller, target)

      if (reducedMotion) {
        scroller.scrollTo({ top: dest, behavior: 'auto' })
        restoreSnap(scroller)
        return
      }

      const start = scroller.scrollTop
      const change = dest - start
      const duration = clamp(Math.abs(change) * 0.22, 450, 900)
      const startTime = performance.now()
      snapOwnerRef.current = 'glide'
      scroller.style.scrollSnapType = 'none'

      const onInterrupt = () => cancelGlide()
      scroller.addEventListener('wheel', onInterrupt, { passive: true })
      scroller.addEventListener('touchstart', onInterrupt, { passive: true })
      window.addEventListener('keydown', onInterrupt)

      glideCleanupRef.current = () => {
        scroller.removeEventListener('wheel', onInterrupt)
        scroller.removeEventListener('touchstart', onInterrupt)
        window.removeEventListener('keydown', onInterrupt)
      }

      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

      const step = (now) => {
        if (snapOwnerRef.current !== 'glide') return

        const t = clamp((now - startTime) / duration, 0, 1)
        scroller.scrollTop = start + change * ease(t)

        if (t < 1) {
          glideRafRef.current = requestAnimationFrame(step)
        } else {
          if (glideCleanupRef.current) {
            glideCleanupRef.current()
            glideCleanupRef.current = null
          }
          snapOwnerRef.current = null
          glideRafRef.current = 0
          restoreSnap(scroller)
        }
      }

      glideRafRef.current = requestAnimationFrame(step)
    },
    [cancelGlide, reducedMotion, scrollerRef],
  )

  const navigateToSection = useCallback(
    (sectionId) => {
      const targetRef = sectionRefMap[sectionId]
      if (!targetRef) return
      glideTo(targetRef)
    },
    [glideTo, sectionRefMap],
  )

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let raf = 0

    // Ratio-based detection cannot work here: the tour section spans several
    // viewports, so its intersection ratio never competes with the single-screen
    // panels below it. Pick whichever panel owns the viewport midpoint instead.
    const readActiveSection = () => {
      const scrollerTop = scroller.getBoundingClientRect().top
      const midpoint = scroller.clientHeight / 2
      let fallbackId = null
      let fallbackDistance = Infinity

      for (const { id, ref } of observedTargets) {
        const node = ref?.current
        if (!node) continue

        const rect = node.getBoundingClientRect()
        const top = rect.top - scrollerTop
        const bottom = top + rect.height

        if (midpoint >= top && midpoint < bottom) return id

        const distance = Math.min(Math.abs(top - midpoint), Math.abs(bottom - midpoint))
        if (distance < fallbackDistance) {
          fallbackDistance = distance
          fallbackId = id
        }
      }

      return fallbackId
    }

    const sync = () => {
      raf = 0
      const nextId = readActiveSection()
      if (nextId) setActiveSection((current) => (current === nextId ? current : nextId))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }

    sync()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [observedTargets, scrollerRef])

  useEffect(() => () => cancelGlide(), [cancelGlide])

  return {
    activeSection,
    glideTo,
    navigateToSection,
    cancelGlide,
    snapOwnerRef,
  }
}
