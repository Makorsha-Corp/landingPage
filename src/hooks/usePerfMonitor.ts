import { useCallback, useEffect, useRef, useState } from 'react'
import {
  computeWindowMetrics,
  createPerfSessionCollector,
  percentile,
  sampleFpsBurst,
  type PerfSessionCollector,
  type PerfSessionSnapshot,
} from '../lib/landingPerfMetrics'
import type { TourContext } from '../lib/landingPerfReport'

const STATS_EVERY_N_FRAMES = 4

export interface PerfStats {
  fps: number
  avgFps: number
  p95FrameMs: number
  jankPercent: number
  worstFrameMs: number
  droppedFrames: number
  longTaskCount: number
  longTaskMs: number
  sessionDurationMs: number
  totalFrames: number
  totalDropped: number
  sessionWorstMs: number
  sessionLowestAvgFps: number
  sessionP99Ms: number
}

const initialStats = (): PerfStats => ({
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

export interface UsePerfMonitorReturn {
  stats: PerfStats
  resetLongTasks: () => void
  resetSession: () => void
  recordPhaseMarker: (label: string, context?: Record<string, number>) => void
  getSessionSnapshot: (tour?: TourContext) => PerfSessionSnapshot
}

export default function usePerfMonitor(enabled: boolean = false): UsePerfMonitorReturn {
  const [stats, setStats] = useState<PerfStats>(initialStats)
  const collectorRef = useRef<PerfSessionCollector | null>(null)
  const syncRafRef = useRef<number>(0)
  const frameCounterRef = useRef<number>(0)

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

    const sync = (): void => {
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

  const recordPhaseMarker = useCallback((label: string, context: Record<string, number> = {}) => {
    collectorRef.current?.recordPhaseMarker(label, context)
  }, [])

  const getSessionSnapshot = useCallback((tour: TourContext = {}): PerfSessionSnapshot => {
    return collectorRef.current?.getSnapshot(tour) ?? {
      ...initialStats(),
      durationMs: 0,
      phaseMarkers: [],
      tour,
      device: { deviceLabel: 'unknown', platform: 'unknown' },
      vitals: { lcpMs: null, cls: 0, inpMs: null, longTaskCount: 0, longTaskMs: 0, ttfbMs: null, domContentLoadedMs: null },
      burst: null,
      auditMode: false,
    }
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
