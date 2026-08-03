import { useEffect, useState } from 'react'

export const MOBILE_TOUR_QUERY = '(max-width: 767px)'

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
