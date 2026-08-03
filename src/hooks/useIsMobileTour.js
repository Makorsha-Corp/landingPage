import { useEffect, useState } from 'react'
import { MOBILE_TOUR_QUERY } from '../lib/viewportBreakpoints'

export { MOBILE_TOUR_QUERY } from '../lib/viewportBreakpoints'

export default function useIsMobileTour() {
  const [isMobileTour, setIsMobileTour] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_TOUR_QUERY).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_TOUR_QUERY)
    const onChange = (event) => setIsMobileTour(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobileTour
}
