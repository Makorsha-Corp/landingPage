import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Pricing from '../components/Pricing'

/**
 * Focus stops. fx/fy are the focus point as a fraction (0..1) of the
 * building image; scale is how far to zoom in at that stop. These are
 * tuned by eye against /building.png (1024x831) and can be adjusted.
 */
const STOPS = [
  {
    id: 'overview',
    eyebrow: 'Welcome',
    title: 'Your whole operation, one building',
    desc: 'Marker brings every floor of your business together. Scroll to tour each level — from the executive office down to the loading dock.',
    fx: 0.5,
    fy: 0.5,
    scale: 1,
  },
  {
    id: 'reports',
    eyebrow: 'Top floor',
    title: 'Dashboard & Reports',
    desc: 'Get the full picture from the executive view — live KPIs, financial summaries, and reports that turn your operation into clear decisions.',
    fx: 0.52,
    fy: 0.20,
    scale: 2.1,
  },
  {
    id: 'orders',
    eyebrow: 'Second floor · left',
    title: 'Orders & Workflows',
    desc: 'Plan and track purchase, transfer, and sales orders through multi-stage workflows — from request to approval to completion.',
    fx: 0.33,
    fy: 0.47,
    scale: 2.2,
  },
  {
    id: 'accounts',
    eyebrow: 'Second floor · right',
    title: 'Accounts & Team',
    desc: 'Manage suppliers, customers, invoices, and payments — with your whole team working from one shared source of truth.',
    fx: 0.64,
    fy: 0.50,
    scale: 2.2,
  },
  {
    id: 'production',
    eyebrow: 'Ground floor · left',
    title: 'Production & Machines',
    desc: 'Formula-driven manufacturing on the factory floor — track machines, batches, and expected vs actual output for every run.',
    fx: 0.27,
    fy: 0.76,
    scale: 2.4,
  },
  {
    id: 'inventory',
    eyebrow: 'Ground floor · right',
    title: 'Inventory & Logistics',
    desc: 'Real-time stock across storage, machines, and projects — right up to the loading dock and out the door.',
    fx: 0.73,
    fy: 0.78,
    scale: 2.4,
  },
]

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const lerp = (a, b, t) => a + (b - a) * t
const smoothstep = (t) => t * t * (3 - 2 * t)

const BAR_VARIANTS = ['A', 'B', 'C', 'D', 'E', 'F']

// Inline icon paths keyed by stop id (variant E).
const STOP_ICON_PATHS = {
  overview: 'M4 6h16M4 12h16M4 18h16',
  reports: 'M3 3v18h18M7 14l3-3 3 3 5-5',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  accounts: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z',
  production: 'M10.34 3.94c.09-.54.56-.94 1.11-.94h1.09c.55 0 1.02.4 1.11.94l.15.89c.41.16.78.38 1.11.65l.84-.32c.51-.2 1.09.01 1.35.49l.55.94c.26.48.16 1.08-.24 1.45l-.68.6c.05.43.05.87 0 1.3l.68.6c.4.37.5.97.24 1.45l-.55.94c-.26.48-.84.69-1.35.49l-.84-.32c-.33.27-.7.49-1.11.65l-.15.89c-.09.54-.56.94-1.11.94h-1.09c-.55 0-1.02-.4-1.11-.94l-.15-.89a5.5 5.5 0 01-1.11-.65l-.84.32c-.51.2-1.09-.01-1.35-.49l-.55-.94c-.26-.48-.16-1.08.24-1.45l.68-.6a5.5 5.5 0 010-1.3l-.68-.6c-.4-.37-.5-.97-.24-1.45l.55-.94c.26-.48.84-.69 1.35-.49l.84.32c.33-.27.7-.49 1.11-.65l.15-.89zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
}

const counterCls =
  'text-xs font-semibold tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'

function RightBar({ variant, stops, activeIndex, progress, onJump }) {
  const total = stops.length
  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const wrap =
    'absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto'

  // A — Ticks + counter
  if (variant === 'A') {
    return (
      <div className={`${wrap} gap-4`}>
        <span className={counterCls}>{counter}</span>
        <div className="flex flex-col items-center gap-2">
          {stops.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => onJump(idx)}
              aria-label={s.title}
              aria-current={idx === activeIndex}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'h-8 bg-primary' : 'h-3 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  // B — Rail with section labels
  if (variant === 'B') {
    return (
      <div className={`${wrap} gap-0`}>
        <div className="relative flex flex-col items-center gap-4 py-2">
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 w-px h-5 bg-white/30" />
          {stops.map((s, idx) => {
            const active = idx === activeIndex
            return (
              <button
                key={s.id}
                onClick={() => onJump(idx)}
                aria-label={s.title}
                aria-current={active}
                className="group relative flex items-center"
              >
                {/* label */}
                <span
                  className={`absolute right-full mr-3 whitespace-nowrap rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {s.eyebrow}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    active
                      ? 'h-3 w-3 bg-primary scale-125'
                      : 'h-2 w-2 bg-white/40 group-hover:bg-white/80'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // C — Numbered nodes + progress line
  if (variant === 'C') {
    return (
      <div className={`${wrap} gap-4`}>
        <span className={counterCls}>{counter}</span>
        <div className="relative flex flex-col items-center gap-3">
          {/* track */}
          <span className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/25" />
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-primary transition-all duration-300"
            style={{ height: `${(activeIndex / (total - 1)) * 100}%` }}
          />
          {stops.map((s, idx) => {
            const active = idx === activeIndex
            const done = idx < activeIndex
            return (
              <button
                key={s.id}
                onClick={() => onJump(idx)}
                aria-label={s.title}
                aria-current={active}
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  active
                    ? 'bg-primary text-white scale-110'
                    : done
                      ? 'bg-primary/70 text-white'
                      : 'bg-black/40 text-white/70 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // D — Fill track (real scrollbar feel) + tick marks
  if (variant === 'D') {
    return (
      <div className={`${wrap} gap-4`}>
        <span className={counterCls}>{counter}</span>
        <div className="relative h-48 w-1.5 rounded-full bg-white/25">
          <div
            className="absolute top-0 left-0 w-full rounded-full bg-primary transition-all duration-300"
            style={{ height: `${progress * 100}%` }}
          />
          {stops.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => onJump(idx)}
              aria-label={s.title}
              aria-current={idx === activeIndex}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
              style={{ top: `${(idx / (total - 1)) * 100}%` }}
            >
              <span
                className={`block h-full w-full rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'bg-primary ring-2 ring-white/70 scale-110'
                    : 'bg-white/60 hover:bg-white'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // E — Per-section icon dots
  if (variant === 'E') {
    return (
      <div className={`${wrap} gap-3`}>
        {stops.map((s, idx) => {
          const active = idx === activeIndex
          return (
            <button
              key={s.id}
              onClick={() => onJump(idx)}
              aria-label={s.title}
              aria-current={active}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                active
                  ? 'bg-primary text-white scale-110'
                  : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/55'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={STOP_ICON_PATHS[s.id] || STOP_ICON_PATHS.overview} />
              </svg>
            </button>
          )
        })}
      </div>
    )
  }

  // F — Progress ring + dots
  const R = 16
  const C = 2 * Math.PI * R
  return (
    <div className={`${wrap} gap-4`}>
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center ${counterCls}`}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {stops.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => onJump(idx)}
            aria-label={s.title}
            aria-current={idx === activeIndex}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'bg-primary scale-150' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Homepage2() {
  const { theme, toggleTheme } = useTheme()
  const scrollerRef = useRef(null)
  const sectionRef = useRef(null)
  const pricingRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cardVariant, setCardVariant] = useState('glass') // 'glass' | 'light'
  const [barVariant, setBarVariant] = useState('A')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    let raf = 0
    const update = () => {
      raf = 0
      const section = sectionRef.current
      if (!section) return
      const scrollable = section.offsetHeight - scroller.clientHeight
      const p = scrollable > 0 ? clamp(scroller.scrollTop / scrollable, 0, 1) : 0
      setProgress(p)
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    update()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  // Derive interpolated focus + active stop from progress.
  const segments = STOPS.length - 1
  const scaled = progress * segments
  const i = clamp(Math.floor(scaled), 0, segments - 1)
  const frac = smoothstep(scaled - i)

  const from = STOPS[i]
  const to = STOPS[i + 1]
  const fx = lerp(from.fx, to.fx, frac)
  const fy = lerp(from.fy, to.fy, frac)
  const scale = lerp(from.scale, to.scale, frac)

  const activeIndex = clamp(Math.round(scaled), 0, STOPS.length - 1)
  const activeStop = STOPS[activeIndex]

  // translate so the focus point lands at the viewport center.
  const tx = (0.5 - fx) * 100 * scale
  const ty = (0.5 - fy) * 100 * scale

  // Hero shows on the overview screen; reappears when scrolled back to top.
  const heroActive = progress < 0.02

  const stageStyle = {
    transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
    filter: heroActive ? 'blur(8px)' : 'none',
    transition: reducedMotion
      ? 'none'
      : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease',
  }

  const scrollToStop = (idx) => {
    const scroller = scrollerRef.current
    const section = sectionRef.current
    if (!scroller || !section) return
    const scrollable = section.offsetHeight - scroller.clientHeight
    scroller.scrollTo({ top: (idx / segments) * scrollable, behavior: 'smooth' })
  }

  const goPricing = () => {
    const scroller = scrollerRef.current
    const target = pricingRef.current
    if (!scroller || !target) return
    const dest =
      scroller.scrollTop +
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top
    if (reducedMotion) {
      scroller.scrollTo({ top: dest, behavior: 'auto' })
      return
    }
    // Fixed-duration glide (snap off) so it scrolls there fast without
    // dwelling on each story section.
    const start = scroller.scrollTop
    const change = dest - start
    const duration = 700
    const startTime = performance.now()
    const prevSnap = scroller.style.scrollSnapType
    scroller.style.scrollSnapType = 'none'
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const step = (now) => {
      const t = clamp((now - startTime) / duration, 0, 1)
      scroller.scrollTop = start + change * ease(t)
      if (t < 1) window.requestAnimationFrame(step)
      else scroller.style.scrollSnapType = prevSnap
    }
    window.requestAnimationFrame(step)
  }
  const goExplore = () => {
    scrollToStop(1)
  }

  const glass = cardVariant === 'glass'
  const cardCls = glass
    ? 'border-white/10 bg-black/45 text-white'
    : 'border-border bg-card/90 text-card-foreground ring-1 ring-black/5'
  const eyebrowCls = glass ? 'text-white/60' : 'text-primary'
  const titleCls = glass ? '' : 'text-foreground'
  const descCls = glass ? 'text-white/80' : 'text-muted-foreground'

  return (
    <div
      ref={scrollerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory bg-background text-foreground"
    >
      {/* Minimal top bar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-card/70 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Marker</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setBarVariant((v) => BAR_VARIANTS[(BAR_VARIANTS.indexOf(v) + 1) % BAR_VARIANTS.length])
              }
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cycle right-bar design"
            >
              Bar: {barVariant}
            </button>
            <button
              onClick={() => setCardVariant((v) => (v === 'glass' ? 'light' : 'glass'))}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle card style"
            >
              Card: {cardVariant === 'glass' ? 'Glass' : 'Light'}
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <Link
              to="/"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Scroll-driven building experience */}
      <section ref={sectionRef} className="relative">
        {/* Building stage pinned over the snap panels */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <div
            className="relative h-screen aspect-[1024/831] will-change-transform"
            style={stageStyle}
          >
            <img
              src="/building.png"
              alt="Marker headquarters cutaway"
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>

          {/* Hero overlay (overview screen, blurred building behind) */}
          <div
            className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-500 ${
              heroActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative mx-auto max-w-2xl px-6 text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Marker ERP
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight [text-shadow:0_4px_18px_rgba(0,0,0,0.7)]">
                Run your whole factory from one place
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-white/90">
                Orders, inventory, accounts, machines, and production — one platform from the executive office down to the loading dock.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={goPricing}
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:-translate-y-0.5"
                >
                  Purchase
                </button>
                <button
                  onClick={goExplore}
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>

          {/* Feature callout */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-opacity duration-300 ${
              heroActive ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
              <div
                key={activeStop.id}
                className={`animate-fade-up pointer-events-auto max-w-md rounded-2xl border backdrop-blur-md p-6 shadow-2xl ${cardCls}`}
              >
                <span className={`text-xs font-semibold uppercase tracking-widest ${eyebrowCls}`}>
                  {activeStop.eyebrow}
                </span>
                <h2 className={`mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${titleCls}`}>
                  {activeStop.title}
                </h2>
                <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>
                  {activeStop.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right-side progress bar (hidden while hero shows) */}
          {!heroActive && (
            <RightBar
              variant={barVariant}
              stops={STOPS}
              activeIndex={activeIndex}
              progress={progress}
              onJump={scrollToStop}
            />
          )}

          {/* Scroll hint (fades out after first stop) */}
          <div
            className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-500"
            style={{ opacity: !heroActive && progress < 0.06 ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground shadow-lg">
              <span>Scroll to explore</span>
              <svg className="h-4 w-4 animate-bounce text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Snap panels — one per stop. Pulled up under the sticky stage so the
            first panel aligns with progress 0. Each is a scroll-snap target. */}
        <div style={{ marginTop: '-100vh' }}>
          {STOPS.map((stop) => (
            <div key={stop.id} className="h-screen snap-start" aria-hidden="true" />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <div ref={pricingRef} className="snap-start">
        <Pricing />
      </div>

      {/* Closing CTA */}
      <section className="relative snap-start py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            One building. Every part of your operation.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From the executive office to the loading dock, Marker connects it all in a single platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://frontend-theta-dusky-91.vercel.app/login2"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:-translate-y-0.5"
            >
              Get started free
            </a>
            <Link
              to="/"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-all hover:bg-muted hover:-translate-y-0.5"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
