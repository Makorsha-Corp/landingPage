import { useCallback, useEffect, useRef, useState } from 'react'
import {
  computeWindowMetrics,
  createPerfSessionCollector,
  percentile,
  sampleFpsBurst,
} from '../lib/landingPerfMetrics'

const STATS_EVERY_N_FRAMES = 4

const initialStats = () => ({
  fps: 0,
  avgFps: 0,
  p95FrameMs: 0,
  jankPercent: 0,
  worstFrameMs: 0,
  droppedFrames: 0,
  longTaskCount: 0,
  longTaskMs: 0,
  sessionDurationMs: 0,
  totalFrames: 0,
  totalDropped: 0,
  sessionWorstMs: 0,
  sessionLowestAvgFps: 60,
  sessionP99Ms: 0,
})

export { sampleFpsBurst }

export default function usePerfMonitor(enabled = false) {
  const [stats, setStats] = useState(initialStats)
  const collectorRef = useRef(null)
  const syncRafRef = useRef(0)
  const frameCounterRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      collectorRef.current?.stop()
      collectorRef.current = null
      return undefined
    }

    const collector = createPerfSessionCollector()
    collectorRef.current = collector
    frameCounterRef.current = 0
    collector.start()

    const sync = () => {
      const live = collector.getLiveMetrics()
      const snapshot = collector.getSnapshot()
      frameCounterRef.current += 1

      if (frameCounterRef.current % STATS_EVERY_N_FRAMES === 0) {
        setStats({
          ...live,
          longTaskCount: snapshot.longTaskCount,
          longTaskMs: snapshot.longTaskMs,
          sessionDurationMs: snapshot.sessionDurationMs,
          totalFrames: snapshot.totalFrames,
          totalDropped: snapshot.totalDropped,
          sessionWorstMs: snapshot.sessionWorstMs,
          sessionLowestAvgFps: snapshot.sessionLowestAvgFps,
          sessionP99Ms: snapshot.sessionP99Ms,
        })
      }

      syncRafRef.current = requestAnimationFrame(sync)
    }

    syncRafRef.current = requestAnimationFrame(sync)

    return () => {
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
      collector.stop()
      collectorRef.current = null
    }
  }, [enabled])

  const resetLongTasks = useCallback(() => {
    collectorRef.current?.resetLongTasks()
    setStats((current) => ({ ...current, longTaskCount: 0, longTaskMs: 0 }))
  }, [])

  const resetSession = useCallback(() => {
    if (!collectorRef.current) return
    collectorRef.current.stop()
    const collector = createPerfSessionCollector()
    collectorRef.current = collector
    collector.start()
    frameCounterRef.current = 0
    setStats(initialStats())
  }, [])

  const recordPhaseMarker = useCallback((label, context = {}) => {
    collectorRef.current?.recordPhaseMarker(label, context)
  }, [])

  const getSessionSnapshot = useCallback((tour = {}) => {
    return collectorRef.current?.getSnapshot(tour) ?? { ...initialStats(), phaseMarkers: [], tour }
  }, [])

  return {
    stats: enabled ? stats : initialStats(),
    resetLongTasks,
    resetSession,
    recordPhaseMarker,
    getSessionSnapshot,
  }
}

export { computeWindowMetrics, createPerfSessionCollector, percentile }
