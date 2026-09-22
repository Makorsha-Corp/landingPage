import {
  createPerfSessionCollector,
  sampleFpsBurst,
  type PerfSessionSnapshot,
  type WindowMetrics,
} from './landingPerfMetrics'
import type { TourContext, BurstMetrics } from './landingPerfReport'

const SETTLE_AFTER_SCROLL_MS = 900

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function scrollScrollerTo(
  scroller: HTMLElement | null,
  destTop: number,
  { reducedMotion = false }: { reducedMotion?: boolean } = {},
): Promise<void> {
  return new Promise((resolve) => {
    if (!scroller) {
      resolve()
      return
    }

    scroller.style.scrollSnapType = 'none'
    const startTop = scroller.scrollTop
    const change = destTop - startTop

    const finish = (): void => {
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

interface NormalizedAuditStep {
  action: () => void | Promise<void>
  label: string | null
  recordMarker: boolean
}

type AuditStepInput =
  | (() => void | Promise<void>)
  | {
      action: () => void | Promise<void>
      label?: string | null
      recordMarker?: boolean
    }

function normalizeAuditStep(step: AuditStepInput): NormalizedAuditStep {
  if (typeof step === 'function') {
    return { action: step, label: null, recordMarker: true }
  }
  return {
    action: step.action,
    label: step.label ?? null,
    recordMarker: step.recordMarker !== false,
  }
}

function defaultMarkerLabel(tour: TourContext = {}): string {
  if (tour.activeSection === 'tour') {
    return `tour · hero ${tour.heroActive ? 'on' : 'off'} · stop ${tour.activeIndex ?? 0}`
  }
  return `section · ${tour.activeSection ?? 'unknown'}`
}

export interface LandingPerfAuditOptions {
  steps?: AuditStepInput[]
  getTourContext?: () => TourContext
  reducedMotion?: boolean
}

export interface LandingPerfAuditResult {
  snapshot: PerfSessionSnapshot
  burst: BurstMetrics
}

/**
 * Auto-scroll landing page checkpoints while recording frame metrics.
 */
export async function runLandingPerfAudit({
  steps = [],
  getTourContext,
  reducedMotion = false,
}: LandingPerfAuditOptions): Promise<LandingPerfAuditResult> {
  const collector = createPerfSessionCollector()
  collector.start()

  try {
    for (const rawStep of steps) {
      const { action, label, recordMarker } = normalizeAuditStep(rawStep)
      await action()
      await wait(reducedMotion ? 120 : SETTLE_AFTER_SCROLL_MS)

      if (!recordMarker) continue

      const live: WindowMetrics = collector.getLiveMetrics()
      const tour = getTourContext?.() ?? {}
      collector.recordPhaseMarker(label ?? defaultMarkerLabel(tour), live)
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
