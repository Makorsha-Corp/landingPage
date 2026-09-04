import { useEffect, useRef } from 'react'
import { useLandingPerf } from '../context/LandingPerfContext'

const WASH_THRESHOLD = 0.12

export default function LandingPerfTourSync({
  theme,
  isMobileTour,
  activeSection,
  heroActive,
  heroExitAdvanced,
  activeIndex,
  mobileTourDrawerVisible,
  featuresBackdropProgress,
  tourMetricsRef,
}) {
  const { setTourContext, recordPhaseMarker, stats, perfMonitorEnabled } = useLandingPerf()
  const prevRef = useRef({
    heroActive,
    activeIndex,
    mobileTourDrawerVisible,
    washAbove: featuresBackdropProgress >= WASH_THRESHOLD,
  })

  useEffect(() => {
    setTourContext({
      theme,
      isMobileTour,
      activeSection,
      heroActive,
      heroExitAdvanced,
      activeIndex,
      mobileTourDrawerVisible,
      featuresBackdropProgress,
      displayHeroExitT: tourMetricsRef?.current?.displayHeroExitT ?? 0,
    })
  }, [
    theme,
    isMobileTour,
    activeSection,
    heroActive,
    heroExitAdvanced,
    activeIndex,
    mobileTourDrawerVisible,
    featuresBackdropProgress,
    tourMetricsRef,
    setTourContext,
  ])

  useEffect(() => {
    if (!perfMonitorEnabled) return

    const prev = prevRef.current
    const markerContext = {
      fps: stats.fps,
      avgFps: stats.avgFps,
      droppedWindow: stats.droppedFrames,
      worstWindow: stats.worstFrameMs,
    }

    if (prev.heroActive !== heroActive) {
      recordPhaseMarker(heroActive ? 'hero on' : 'hero off', markerContext)
    }
    if (prev.activeIndex !== activeIndex) {
      recordPhaseMarker(`stop ${activeIndex}`, markerContext)
    }
    if (prev.mobileTourDrawerVisible !== mobileTourDrawerVisible) {
      recordPhaseMarker(mobileTourDrawerVisible ? 'drawer on' : 'drawer off', markerContext)
    }

    const washAbove = featuresBackdropProgress >= WASH_THRESHOLD
    if (prev.washAbove !== washAbove) {
      recordPhaseMarker(washAbove ? 'wash high' : 'wash low', markerContext)
    }

    prevRef.current = {
      heroActive,
      activeIndex,
      mobileTourDrawerVisible,
      washAbove,
    }
  }, [
    perfMonitorEnabled,
    heroActive,
    activeIndex,
    mobileTourDrawerVisible,
    featuresBackdropProgress,
    recordPhaseMarker,
    stats.fps,
    stats.avgFps,
    stats.droppedFrames,
    stats.worstFrameMs,
  ])

  return null
}
