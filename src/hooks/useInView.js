import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll hook for elements inside the homepage snap scroller.
 * Returns [ref, inView] — inView latches true after first intersection.
 */
export default function useInView({ enabled = true, threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!enabled || inView) return
    const element = ref.current
    if (!element) return

    const root = element.closest('.homepage2-scroller')
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { root, threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, inView, threshold, rootMargin])

  return [ref, inView]
}
