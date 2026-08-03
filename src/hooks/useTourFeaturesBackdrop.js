import { useEffect, useState } from 'react'
import { computeTourToFeaturesBackdropProgress } from '../lib/tourScrollMath'

const PROGRESS_EPSILON = 0.003

export default function useTourFeaturesBackdrop({ scrollerRef, featuresRef, enabled }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setProgress(0)
      return
    }

    const scroller = scrollerRef.current
    if (!scroller) return

    let raf = 0

    const sync = () => {
      raf = 0
      const next = computeTourToFeaturesBackdropProgress(scroller, featuresRef.current)
      setProgress((current) => (Math.abs(current - next) < PROGRESS_EPSILON ? current : next))
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
  }, [enabled, featuresRef, scrollerRef])

  return progress
}
