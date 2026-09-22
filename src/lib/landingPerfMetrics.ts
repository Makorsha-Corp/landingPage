import {
  collectDeviceContext,
  DROPPED_FRAME_THRESHOLD_MS,
  readVitalsSnapshot,
  type DeviceContext,
  type TourContext,
  type PhaseMarker,
  type BurstMetrics,
  type VitalsSnapshot,
} from './landingPerfReport'

const MAX_PHASE_MARKERS = 30
const MAX_P99_SAMPLES = 2400

export function percentile(values: number[], percent: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percent / 100) * sorted.length) - 1))
  return sorted[index]
}

export interface WindowMetrics {
  fps: number
  avgFps: number
  p95FrameMs: number
  jankPercent: number
  worstFrameMs: number
  droppedFrames: number
}

export function computeWindowMetrics(deltas: number[]): WindowMetrics {
  if (!deltas.length) {
    return { fps: 0, avgFps: 0, p95FrameMs: 0, jankPercent: 0, worstFrameMs: 0, droppedFrames: 0 }
  }

  const sum = deltas.reduce((total, value) => total + value, 0)
  const lastDelta = deltas[deltas.length - 1]
  const fps = Math.round(1000 / lastDelta)
  const avgFps = sum > 0 ? Math.round((deltas.length * 1000) / sum) : fps
  const worst = Math.max(...deltas)
  const dropped = deltas.filter((value) => value > DROPPED_FRAME_THRESHOLD_MS).length
  const p95FrameMs = Math.round(percentile(deltas, 95) * 10) / 10
  const jankPercent = Math.round((dropped / deltas.length) * 1000) / 10

  return {
    fps,
    avgFps,
    p95FrameMs,
    jankPercent,
    worstFrameMs: Math.round(worst * 10) / 10,
    droppedFrames: dropped,
  }
}

interface Sample {
  time: number
  delta: number
}

export interface PerfSessionSnapshot {
  fps: number
  avgFps: number
  p95FrameMs: number
  jankPercent: number
  worstFrameMs: number
  droppedFrames: number
  longTaskCount: number
  longTaskMs: number
  sessionDurationMs: number
  durationMs: number
  totalFrames: number
  totalDropped: number
  sessionWorstMs: number
  sessionLowestAvgFps: number
  sessionP99Ms: number
  phaseMarkers: PhaseMarker[]
  device: DeviceContext
  tour: TourContext
  vitals: VitalsSnapshot
  burst: BurstMetrics | null
  auditMode: boolean
}

export interface PerfSessionCollector {
  start(): void
  stop(): void
  getLiveMetrics(): WindowMetrics
  recordPhaseMarker(label: string, context?: Partial<WindowMetrics>): void
  getSnapshot(tour?: TourContext): PerfSessionSnapshot
  resetLongTasks(): void
}

/** Imperative perf session — used by HUD hook and page audit. */
export function createPerfSessionCollector(): PerfSessionCollector {
  const samplesRef: { current: Sample[] } = { current: [] }
  const longTaskCountRef: { current: number } = { current: 0 }
  const longTaskMsRef: { current: number } = { current: 0 }
  const lastFrameRef: { current: number } = { current: 0 }
  const rafRef: { current: number } = { current: 0 }
  const sessionStartRef: { current: number } = { current: 0 }
  const totalFramesRef: { current: number } = { current: 0 }
  const totalDroppedRef: { current: number } = { current: 0 }
  const sessionWorstRef: { current: number } = { current: 0 }
  const sessionLowestAvgRef: { current: number } = { current: 60 }
  const p99SamplesRef: { current: number[] } = { current: [] }
  const phaseMarkersRef: { current: PhaseMarker[] } = { current: [] }
  const liveMetricsRef: { current: WindowMetrics } = { current: computeWindowMetrics([]) }
  let longTaskObserver: PerformanceObserver | null = null

  const tick = (now: number): void => {
    const delta = now - lastFrameRef.current
    lastFrameRef.current = now

    if (delta > 0 && delta < 5000) {
      const samples = samplesRef.current
      samples.push({ time: now, delta })
      while (samples.length > 0 && now - samples[0].time > 1000) {
        samples.shift()
      }

      totalFramesRef.current += 1
      if (delta > DROPPED_FRAME_THRESHOLD_MS) totalDroppedRef.current += 1
      sessionWorstRef.current = Math.max(sessionWorstRef.current, delta)

      const p99Samples = p99SamplesRef.current
      p99Samples.push(delta)
      if (p99Samples.length > MAX_P99_SAMPLES) p99Samples.shift()

      const deltas = samples.map((sample) => sample.delta)
      const windowMetrics = computeWindowMetrics(deltas)
      liveMetricsRef.current = windowMetrics
      sessionLowestAvgRef.current = Math.min(sessionLowestAvgRef.current, windowMetrics.avgFps || 60)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  return {
    start() {
      samplesRef.current = []
      longTaskCountRef.current = 0
      longTaskMsRef.current = 0
      totalFramesRef.current = 0
      totalDroppedRef.current = 0
      sessionWorstRef.current = 0
      sessionLowestAvgRef.current = 60
      p99SamplesRef.current = []
      phaseMarkersRef.current = []
      sessionStartRef.current = performance.now()
      lastFrameRef.current = performance.now()
      liveMetricsRef.current = computeWindowMetrics([])

      if (typeof PerformanceObserver !== 'undefined') {
        try {
          longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              longTaskCountRef.current += 1
              longTaskMsRef.current += entry.duration
            }
          })
          longTaskObserver.observe({ entryTypes: ['longtask'] })
        } catch {
          longTaskObserver = null
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    },

    stop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      longTaskObserver?.disconnect()
      longTaskObserver = null
    },

    getLiveMetrics(): WindowMetrics {
      return { ...liveMetricsRef.current }
    },

    recordPhaseMarker(label: string, context: Partial<WindowMetrics> = {}) {
      phaseMarkersRef.current.push({
        label,
        elapsedMs: Math.round(performance.now() - sessionStartRef.current),
        fps: context.fps ?? liveMetricsRef.current.fps,
        avgFps: context.avgFps ?? liveMetricsRef.current.avgFps,
        droppedWindow: context.droppedFrames ?? liveMetricsRef.current.droppedFrames,
        worstWindow: context.worstFrameMs ?? liveMetricsRef.current.worstFrameMs,
      })
      if (phaseMarkersRef.current.length > MAX_PHASE_MARKERS) {
        phaseMarkersRef.current.shift()
      }
    },

    getSnapshot(tour: TourContext = {}): PerfSessionSnapshot {
      const live = liveMetricsRef.current
      const durationMs = Math.round(performance.now() - sessionStartRef.current)

      return {
        ...live,
        longTaskCount: longTaskCountRef.current,
        longTaskMs: Math.round(longTaskMsRef.current),
        sessionDurationMs: durationMs,
        durationMs,
        totalFrames: totalFramesRef.current,
        totalDropped: totalDroppedRef.current,
        sessionWorstMs: Math.round(sessionWorstRef.current * 10) / 10,
        sessionLowestAvgFps: sessionLowestAvgRef.current,
        sessionP99Ms: Math.round(percentile(p99SamplesRef.current, 99) * 10) / 10,
        phaseMarkers: [...phaseMarkersRef.current],
        device: collectDeviceContext(),
        tour,
        vitals: readVitalsSnapshot(),
        burst: null,
        auditMode: true,
      }
    },

    resetLongTasks() {
      longTaskCountRef.current = 0
      longTaskMsRef.current = 0
    },
  }
}

export function sampleFpsBurst(durationMs: number = 1000): Promise<BurstMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') {
      resolve({ avgFps: 0, worstFrameMs: 0, droppedFrames: 0, durationMs })
      return
    }

    const deltas: number[] = []
    let last = performance.now()
    const start = last
    let raf = 0

    const finish = (): void => {
      if (raf) cancelAnimationFrame(raf)
      resolve({ ...computeWindowMetrics(deltas), durationMs })
    }

    const tick = (now: number): void => {
      const delta = now - last
      last = now
      if (delta > 0 && delta < 5000) deltas.push(delta)
      if (now - start >= durationMs) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
  })
}

export { DROPPED_FRAME_THRESHOLD_MS }
