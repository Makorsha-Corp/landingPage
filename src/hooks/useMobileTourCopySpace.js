import { useCallback, useLayoutEffect, useState } from 'react'

const GAP_PX = 12
const MIN_BOTTOM_INSET_PX = 16

function readBottomInsetPx() {
  if (typeof document === 'undefined') return MIN_BOTTOM_INSET_PX

  const probe = document.createElement('div')
  probe.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom, 0px))'
  probe.style.visibility = 'hidden'
  probe.style.position = 'fixed'
  document.body.appendChild(probe)
  const px = probe.offsetHeight
  document.body.removeChild(probe)
  return Math.max(px, MIN_BOTTOM_INSET_PX)
}

export default function useMobileTourCopySpace(containerRef, stageRef, enabled = true) {
  const [space, setSpace] = useState({ availablePx: 0, sceneBottomPx: 0 })

  const measure = useCallback(() => {
    const containerEl = containerRef?.current
    const stageEl = stageRef?.current
    if (!enabled || !containerEl || !stageEl) return

    const sceneBottomPx = stageEl.offsetTop + stageEl.offsetHeight
    const bottomInsetPx = readBottomInsetPx()
    const availablePx = Math.max(
      0,
      containerEl.clientHeight - sceneBottomPx - bottomInsetPx - GAP_PX,
    )

    setSpace({ availablePx, sceneBottomPx })
  }, [containerRef, stageRef, enabled])

  useLayoutEffect(() => {
    if (!enabled) return undefined

    measure()

    const containerEl = containerRef?.current
    const stageEl = stageRef?.current
    if (!containerEl || !stageEl) return undefined

    const observer = new ResizeObserver(measure)
    observer.observe(containerEl)
    observer.observe(stageEl)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [containerRef, stageRef, enabled, measure])

  return space
}
