import { createPerfSessionCollector, sampleFpsBurst } from './landingPerfMetrics'

const SETTLE_AFTER_SCROLL_MS = 900

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function scrollScrollerTo(scroller, destTop, { reducedMotion = false } = {}) {
  return new Promise((resolve) => {
    if (!scroller) {
      resolve()
      return
    }

    scroller.style.scrollSnapType = 'none'
    const startTop = scroller.scrollTop
    const change = destTop - startTop

    const finish = () => {
      scroller.style.removeProperty('scroll-snap-type')
      resolve()
    }

    if (reducedMotion || Math.abs(change) < 2) {
      scroller.scrollTop = Math.max(0, destTop)
      finish()
      return
    }

    scroller.scrollTo({ top: Math.max(0, destTop), behavior: 'smooth' })

    if ('onscrollend' in scroller) {
      scroller.addEventListener('scrollend', finish, { once: true })
      return
    }

    const duration = Math.min(Math.max(Math.abs(change) * 0.22, 450), 900)
    window.setTimeout(finish, duration + 80)
  })
}

/**
 * Auto-scroll landing page checkpoints while recording frame metrics.
 * @param {object} options
 * @param {() => Promise<void>[]} options.steps — ordered scroll actions
 * @param {() => object} options.getTourContext — tour snapshot for markers/report
 * @param {boolean} [options.reducedMotion]
 */
export async function runLandingPerfAudit({ steps = [], getTourContext, reducedMotion = false }) {
  const collector = createPerfSessionCollector()
  collector.start()

  try {
    for (const step of steps) {
      await step()
      await wait(reducedMotion ? 120 : SETTLE_AFTER_SCROLL_MS)
      const live = collector.getLiveMetrics()
      const tour = getTourContext?.() ?? {}
      const label =
        tour.activeSection === 'tour'
          ? `tour · hero ${tour.heroActive ? 'on' : 'off'} · stop ${tour.activeIndex ?? 0}`
          : `section · ${tour.activeSection ?? 'unknown'}`
      collector.recordPhaseMarker(label, live)
    }

    await wait(reducedMotion ? 80 : 400)
    const burst = await sampleFpsBurst(1000)
    const snapshot = collector.getSnapshot(getTourContext?.() ?? {})
    snapshot.burst = burst
    return { snapshot, burst }
  } finally {
    collector.stop()
  }
}
