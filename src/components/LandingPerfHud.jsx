import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLandingPerf } from '../context/LandingPerfContext'
import { formatLandingPerfReport } from '../lib/landingPerfReport'

function readTourMetrics(tourMetricsRef) {
  return tourMetricsRef?.current ?? { displayHeroExitT: 0 }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

export default function LandingPerfHud({
  enabled = false,
  tourMetricsRef,
  heroActive = false,
  heroExitAdvanced = false,
  activeIndex = 0,
  mobileTourDrawerVisible = false,
  mobileTourDrawerExpanded = false,
  featuresBackdropProgress = 0,
}) {
  const { stats, resetLongTasks, resetSession, getSnapshot } = useLandingPerf()
  const [tourMetrics, setTourMetrics] = useState(() => readTourMetrics(tourMetricsRef))
  const [copyState, setCopyState] = useState('idle')

  useEffect(() => {
    if (!enabled) return undefined

    let raf = 0
    const sync = () => {
      setTourMetrics(readTourMetrics(tourMetricsRef))
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, tourMetricsRef])

  if (!enabled) return null

  const fpsTone =
    stats.avgFps >= 55 ? 'text-emerald-400' : stats.avgFps >= 45 ? 'text-amber-400' : 'text-red-400'

  const handleCopyReport = async () => {
    try {
      const text = formatLandingPerfReport(getSnapshot())
      const ok = await copyText(text)
      setCopyState(ok ? 'copied' : 'failed')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[500] max-h-[min(70dvh,28rem)] w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border border-white/15 bg-black/75 px-3 py-2 font-mono text-[10px] leading-relaxed text-white/90 shadow-lg backdrop-blur-sm"
      aria-hidden="true"
    >
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">
        Perf HUD
      </div>

      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">Live</div>
      <div className={`text-sm font-bold ${fpsTone}`}>
        {stats.fps} fps <span className="text-[10px] font-normal text-white/60">(avg {stats.avgFps})</span>
      </div>
      <div>p95 {stats.p95FrameMs}ms · jank {stats.jankPercent}%</div>
      <div>worst {stats.worstFrameMs}ms · dropped {stats.droppedFrames}</div>

      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">Session</div>
      <div>
        {Math.round(stats.sessionDurationMs / 1000)}s · {stats.totalFrames} frames · {stats.totalDropped} dropped
      </div>
      <div>
        peak worst {stats.sessionWorstMs}ms · low avg {stats.sessionLowestAvgFps} fps · p99 {stats.sessionP99Ms}ms
      </div>
      <div>
        long tasks {stats.longTaskCount} ({stats.longTaskMs}ms)
      </div>

      <div className="mt-1 border-t border-white/10 pt-1 text-white/70">
        hero {heroActive ? 'on' : 'off'} · exit {tourMetrics.displayHeroExitT.toFixed(2)} · adv{' '}
        {heroExitAdvanced ? 'Y' : 'N'}
      </div>
      <div>
        stop {activeIndex} · drawer{' '}
        {mobileTourDrawerExpanded ? 'expanded' : mobileTourDrawerVisible ? 'peek' : 'off'} · wash{' '}
        {featuresBackdropProgress.toFixed(2)}
      </div>

      <div className="pointer-events-auto mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/80 hover:bg-white/10"
          onClick={resetLongTasks}
        >
          Reset long tasks
        </button>
        <button
          type="button"
          className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/80 hover:bg-white/10"
          onClick={resetSession}
        >
          Reset session
        </button>
        <button
          type="button"
          className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/80 hover:bg-white/10"
          onClick={handleCopyReport}
        >
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy report'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
