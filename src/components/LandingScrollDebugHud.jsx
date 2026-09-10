import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  formatLandingScrollDebugReport,
  readScrollerSnapshot,
} from '../lib/landingScrollDebug'

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

export default function LandingScrollDebugHud({
  enabled = false,
  scrollerRef,
  tourRef,
  tourPanelRefs,
  getTourPanelScrollTop,
  activeIndex = 0,
  heroActive = true,
}) {
  const [live, setLive] = useState(null)
  const [entryCount, setEntryCount] = useState(0)
  const [copyState, setCopyState] = useState('idle')

  useEffect(() => {
    if (!enabled) return undefined

    let raf = 0
    const sync = () => {
      const scroller = scrollerRef?.current
      setLive(readScrollerSnapshot(scroller, tourRef, tourPanelRefs, getTourPanelScrollTop))
      setEntryCount(window.__LANDING_SCROLL_DEBUG__?.log?.length ?? 0)
      raf = requestAnimationFrame(sync)
    }

    raf = requestAnimationFrame(sync)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, scrollerRef, tourRef, tourPanelRefs, getTourPanelScrollTop])

  if (!enabled) return null

  const handleCopy = async () => {
    try {
      const ok = await copyText(formatLandingScrollDebugReport())
      setCopyState(ok ? 'copied' : 'failed')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }

  return createPortal(
    <div
      className="pointer-events-auto fixed bottom-3 right-3 z-[500] max-h-[min(72dvh,30rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border border-amber-300/30 bg-black/85 px-3 py-2 font-mono text-[10px] leading-relaxed text-amber-50 shadow-lg backdrop-blur-sm"
      aria-hidden="true"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/70">
          Scroll debug
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded border border-amber-200/25 px-2 py-0.5 text-[9px] uppercase tracking-wide text-amber-100 hover:bg-amber-100/10"
        >
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Failed' : 'Copy log'}
        </button>
      </div>

      <div className="space-y-0.5 text-white/85">
        <div>scrollTop: {live?.scrollTop ?? '—'}</div>
        <div>nearest panel: {live?.nearestPanel ?? '—'} (Δ {live?.nearestDist ?? '—'}px)</div>
        <div>progress: {live?.progress ?? '—'}</div>
        <div>camera: hero {heroActive ? 'on' : 'off'} · stop {activeIndex}</div>
        <div>snap: {live?.snapType ?? '—'}</div>
        <div>layout2: {live?.hasHomepage2Class ? 'yes' : 'no'}</div>
        <div>
          h: client {live?.clientHeight ?? '—'} · tour {live?.tourHeight ?? '—'} · scrollable{' '}
          {live?.scrollable ?? '—'}
        </div>
        <div>
          vp: inner {live?.innerHeight ?? '—'} · visual {live?.visualViewportHeight ?? '—'}
        </div>
        <div className="text-amber-200/60">log entries: {entryCount}</div>
      </div>

      {live?.panels?.length ? (
        <div className="mt-2 border-t border-white/10 pt-2 text-[9px] text-white/70">
          {live.panels.map((panel) =>
            panel.missing ? (
              <div key={panel.i}>p{panel.i}: missing</div>
            ) : (
              <div key={panel.i}>
                p{panel.i}: dest {panel.destScrollTop ?? '—'} · top {panel.top} · h {panel.height}
              </div>
            ),
          )}
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
