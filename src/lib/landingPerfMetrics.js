import { collectDeviceContext, DROPPED_FRAME_THRESHOLD_MS, readVitalsSnapshot } from '../lib/landingPerfReport'

const MAX_PHASE_MARKERS = 30
const MAX_P99_SAMPLES = 2400

export function percentile(values, percent) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percent / 100) * sorted.length) - 1))
  return sorted[index]
}

export function computeWindowMetrics(deltas) {
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

/** Imperative perf session — used by HUD hook and page audit. */
export function createPerfSessionCollector() {
  const samplesRef = { current: [] }
  const longTaskCountRef = { current: 0 }
  const longTaskMsRef = { current: 0 }
  const lastFrameRef = { current: 0 }
  const rafRef = { current: 0 }
  const sessionStartRef = { current: 0 }
  const totalFramesRef = { current: 0 }
  const totalDroppedRef = { current: 0 }
  const sessionWorstRef = { current: 0 }
  const sessionLowestAvgRef = { current: 60 }
  const p99SamplesRef = { current: [] }
  const phaseMarkersRef = { current: [] }
  const liveMetricsRef = { current: computeWindowMetrics([]) }
  let longTaskObserver = null

  const tick = (now) => {
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

    getLiveMetrics() {
      return { ...liveMetricsRef.current }
    },

    recordPhaseMarker(label, context = {}) {
      phaseMarkersRef.current.push({
        label,
        elapsedMs: Math.round(performance.now() - sessionStartRef.current),
        fps: context.fps ?? liveMetricsRef.current.fps,
        avgFps: context.avgFps ?? liveMetricsRef.current.avgFps,
        droppedWindow: context.droppedWindow ?? liveMetricsRef.current.droppedFrames,
        worstWindow: context.worstWindow ?? liveMetricsRef.current.worstFrameMs,
      })
      if (phaseMarkersRef.current.length > MAX_PHASE_MARKERS) {
        phaseMarkersRef.current.shift()
      }
    },

    getSnapshot(tour = {}) {
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

export function sampleFpsBurst(durationMs = 1000) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') {
      resolve({ avgFps: 0, worstFrameMs: 0, droppedFrames: 0, durationMs })
      return
    }

    const deltas = []
    let last = performance.now()
    const start = last
    let raf = 0

    const finish = () => {
      if (raf) cancelAnimationFrame(raf)
      resolve({ ...computeWindowMetrics(deltas), durationMs })
    }

    const tick = (now) => {
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
