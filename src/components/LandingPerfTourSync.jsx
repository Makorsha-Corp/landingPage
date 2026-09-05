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
  mobileTourCopyVisible,
  featuresBackdropProgress,
  tourMetricsRef,
}) {
  const { setTourContext, recordPhaseMarker, stats, perfMonitorEnabled } = useLandingPerf()
  const prevRef = useRef({
    heroActive,
    activeIndex,
    mobileTourCopyVisible,
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
      mobileTourCopyVisible,
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
    mobileTourCopyVisible,
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
    if (prev.mobileTourCopyVisible !== mobileTourCopyVisible) {
      recordPhaseMarker(mobileTourCopyVisible ? 'copy on' : 'copy off', markerContext)
    }

    const washAbove = featuresBackdropProgress >= WASH_THRESHOLD
    if (prev.washAbove !== washAbove) {
      recordPhaseMarker(washAbove ? 'wash high' : 'wash low', markerContext)
    }

    prevRef.current = {
      heroActive,
      activeIndex,
      mobileTourCopyVisible,
      washAbove,
    }
  }, [
    perfMonitorEnabled,
    heroActive,
    activeIndex,
    mobileTourCopyVisible,
    featuresBackdropProgress,
    recordPhaseMarker,
    stats.fps,
    stats.avgFps,
    stats.droppedFrames,
    stats.worstFrameMs,
  ])

  return null
}
