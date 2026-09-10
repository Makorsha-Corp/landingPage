/** Opt-in scroll/snap diagnostics — append `?debug=scroll` to the landing URL. */

export function isLandingScrollDebugEnabled() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === 'scroll'
}

function getSession() {
  return typeof window !== 'undefined' ? window.__LANDING_SCROLL_DEBUG__ : null
}

export function readScrollerSnapshot(scroller, tourRef, tourPanelRefs, getTourPanelScrollTop) {
  if (!scroller) {
    return { scroller: null }
  }

  const scrollerRect = scroller.getBoundingClientRect()
  const panelList = tourPanelRefs?.current ?? []
  const panels = panelList.map((panel, i) => {
    if (!panel) return { i, missing: true }
    const rect = panel.getBoundingClientRect()
    const destTop = getTourPanelScrollTop?.(i)
    return {
      i,
      top: Math.round(rect.top - scrollerRect.top),
      height: Math.round(rect.height),
      destScrollTop: destTop != null ? Math.round(destTop) : null,
    }
  })

  const style = getComputedStyle(scroller)
  const tour = tourRef?.current ?? null
  const scrollable = tour ? tour.offsetHeight - scroller.clientHeight : null
  const progress = scrollable > 0 ? scroller.scrollTop / scrollable : null

  let nearestPanel = 0
  let nearestDist = Infinity
  for (const panel of panels) {
    if (panel.destScrollTop == null) continue
    const dist = Math.abs(scroller.scrollTop - panel.destScrollTop)
    if (dist < nearestDist) {
      nearestDist = dist
      nearestPanel = panel.i
    }
  }

  return {
    scrollTop: Math.round(scroller.scrollTop),
    scrollHeight: scroller.scrollHeight,
    clientHeight: scroller.clientHeight,
    scrollable: scrollable != null ? Math.round(scrollable) : null,
    progress: progress != null ? Number(progress.toFixed(4)) : null,
    nearestPanel,
    nearestDist: Math.round(nearestDist),
    snapType: scroller.style.scrollSnapType || style.scrollSnapType,
    hasHomepage2Class: document.documentElement.classList.contains('homepage2-page'),
    rootHeight: document.getElementById('root')?.offsetHeight ?? null,
    tourHeight: tour?.offsetHeight ?? null,
    innerHeight: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height ?? null,
    panels,
  }
}

export function formatLandingScrollDebugReport(session = getSession()) {
  if (!session) return 'Scroll debug not active — open with ?debug=scroll'
  const lines = [
    'Landing scroll debug',
    `entries: ${session.log.length}`,
    `mount: ${new Date(session.mountIso).toISOString()}`,
    '',
    ...session.log.map((entry) => JSON.stringify(entry)),
  ]
  return lines.join('\n')
}

export function bootstrapLandingScrollDebug() {
  if (!isLandingScrollDebugEnabled()) return null
  if (typeof window === 'undefined') return null

  const existing = getSession()
  if (existing) return existing

  const log = []
  const session = {
    log,
    mountTime: performance.now(),
    mountIso: Date.now(),
    scrollEventCount: 0,
    record(phase, snapshot = {}) {
      const entry = {
        atMs: Math.round(performance.now() - this.mountTime),
        phase,
        ...snapshot,
      }
      log.push(entry)
      // eslint-disable-next-line no-console
      console.log('[landing-scroll-debug]', phase, entry)
      return entry
    },
    copyReport() {
      return formatLandingScrollDebugReport(this)
    },
  }

  window.__LANDING_SCROLL_DEBUG__ = session

  session.record('bootstrap:before-react', {
    docScrollTop: document.documentElement.scrollTop,
    bodyScrollTop: document.body.scrollTop,
    scrollRestoration: history.scrollRestoration,
    innerHeight: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height ?? null,
  })

  window.addEventListener(
    'pageshow',
    (event) => {
      session.record('window:pageshow', {
        persisted: event.persisted,
        docScrollTop: document.documentElement.scrollTop,
      })
    },
    { capture: true },
  )

  return session
}

export function attachLandingScrollProbe({
  scrollerRef,
  tourRef,
  tourPanelRefs,
  getTourPanelScrollTop,
}) {
  const session = getSession()
  if (!session) return () => {}

  const snap = (phase, extra = {}) => {
    const scroller = scrollerRef.current
    const data = readScrollerSnapshot(scroller, tourRef, tourPanelRefs, getTourPanelScrollTop)
    session.record(phase, { ...data, ...extra })
    return data
  }

  snap('probe:attached')

  let lastScrollTop = null
  let pollRaf = 0
  const pollEnd = performance.now() + 5000

  const poll = () => {
    const scroller = scrollerRef.current
    if (scroller) {
      const top = scroller.scrollTop
      if (lastScrollTop != null && Math.abs(top - lastScrollTop) > 1) {
        snap('poll:scrollTop-changed', {
          from: Math.round(lastScrollTop),
          to: Math.round(top),
          delta: Math.round(top - lastScrollTop),
        })
      }
      lastScrollTop = top
    }

    if (performance.now() < pollEnd) {
      pollRaf = requestAnimationFrame(poll)
    } else {
      snap('poll:ended')
    }
  }
  pollRaf = requestAnimationFrame(poll)

  const scheduleRafSample = (frames, label) => {
    let count = 0
    const tick = () => {
      if (count < frames) {
        count += 1
        requestAnimationFrame(tick)
        return
      }
      snap(`timing:${label}`)
    }
    requestAnimationFrame(tick)
  }

  scheduleRafSample(0, 'raf+0')
  scheduleRafSample(1, 'raf+1')
  scheduleRafSample(2, 'raf+2')
  scheduleRafSample(5, 'raf+5')
  scheduleRafSample(10, 'raf+10')

  const onLoad = () => snap('window:load')
  window.addEventListener('load', onLoad, { once: true })

  const scroller = scrollerRef.current
  const onScroll = () => {
    if (session.scrollEventCount >= 10) return
    session.scrollEventCount += 1
    snap(`scroll-event:${session.scrollEventCount}`)
  }

  scroller?.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    cancelAnimationFrame(pollRaf)
    window.removeEventListener('load', onLoad)
    scrollerRef.current?.removeEventListener('scroll', onScroll)
  }
}
