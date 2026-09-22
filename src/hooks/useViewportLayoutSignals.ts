import { useEffect, useState } from 'react'
import {
  DESKTOP_LG_QUERY,
  DESKTOP_MD_QUERY,
  MOBILE_TOUR_QUERY,
  readViewportLayoutSignals,
  type ViewportLayoutSignals,
} from '../lib/viewportBreakpoints'

const EMPTY_SIGNALS: ViewportLayoutSignals = {
  innerWidth: 0,
  innerHeight: 0,
  isMobileTour: false,
  isDesktopMd: false,
  isDesktopLg: false,
}

export default function useViewportLayoutSignals(): ViewportLayoutSignals {
  const [signals, setSignals] = useState<ViewportLayoutSignals>(
    () => readViewportLayoutSignals() ?? EMPTY_SIGNALS,
  )

  useEffect(() => {
    const update = (): void => setSignals(readViewportLayoutSignals() ?? EMPTY_SIGNALS)
    update()

    const mediaQueries = [
      window.matchMedia(MOBILE_TOUR_QUERY),
      window.matchMedia(DESKTOP_MD_QUERY),
      window.matchMedia(DESKTOP_LG_QUERY),
    ]
    mediaQueries.forEach((mq) => mq.addEventListener('change', update))
    window.addEventListener('resize', update)

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener('change', update))
      window.removeEventListener('resize', update)
    }
  }, [])

  return signals
}
