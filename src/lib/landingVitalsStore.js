const vitalsState = {
  lcpMs: null,
  cls: 0,
  inpMs: null,
  longTaskCount: 0,
  longTaskMs: 0,
  ttfbMs: null,
  domContentLoadedMs: null,
  started: false,
}

let observers = []

function readNavigationTiming() {
  if (typeof performance === 'undefined') return
  const [nav] = performance.getEntriesByType?.('navigation') ?? []
  if (!nav) return
  vitalsState.ttfbMs = Math.round(nav.responseStart - nav.requestStart)
  vitalsState.domContentLoadedMs = Math.round(nav.domContentLoadedEventEnd - nav.startTime)
}

export function startLandingVitalsObservers() {
  if (vitalsState.started || typeof window === 'undefined') return
  vitalsState.started = true
  readNavigationTiming()

  if (typeof PerformanceObserver === 'undefined') return

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) vitalsState.lcpMs = Math.round(last.startTime)
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(lcpObserver)
  } catch {
    // unsupported
  }

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) vitalsState.cls += entry.value
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    observers.push(clsObserver)
  } catch {
    // unsupported
  }

  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = entry.duration ?? entry.processingEnd - entry.processingStart
        if (duration > 0) {
          vitalsState.inpMs =
            vitalsState.inpMs == null ? Math.round(duration) : Math.max(vitalsState.inpMs, Math.round(duration))
        }
      }
    })
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 })
    observers.push(inpObserver)
  } catch {
    try {
      const fallback = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input' && entry.processingStart != null) {
            vitalsState.inpMs = Math.round(entry.processingStart - entry.startTime)
          }
        }
      })
      fallback.observe({ type: 'first-input', buffered: true })
      observers.push(fallback)
    } catch {
      // unsupported
    }
  }

  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        vitalsState.longTaskCount += 1
        vitalsState.longTaskMs += entry.duration
      }
    })
    longTaskObserver.observe({ type: 'longtask', buffered: true })
    observers.push(longTaskObserver)
  } catch {
    // unsupported
  }
}

export function getVitalsSnapshot() {
  readNavigationTiming()
  return {
    lcpMs: vitalsState.lcpMs,
    cls: Math.round(vitalsState.cls * 1000) / 1000,
    inpMs: vitalsState.inpMs,
    longTaskCount: vitalsState.longTaskCount,
    longTaskMs: Math.round(vitalsState.longTaskMs),
    ttfbMs: vitalsState.ttfbMs,
    domContentLoadedMs: vitalsState.domContentLoadedMs,
  }
}

export function stopLandingVitalsObservers() {
  observers.forEach((observer) => observer.disconnect())
  observers = []
  vitalsState.started = false
}
