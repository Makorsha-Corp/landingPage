import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import FloatingNavbarShell from '../components/FloatingNavbarShell'
import ThemeToggleButton from '../components/ThemeToggleButton'
import Pricing from '../components/Pricing'
import Homepage2StoryCardSettings from './Homepage2StoryCardSettings'
import Homepage2HeroSettings from './Homepage2HeroSettings'
import { DEFAULT_CARD, getCardStyle, normalizeCard } from './Homepage2CardControls'

const STOPS_STORAGE_KEY = 'homepage2-section-texts'
const HOMEPAGE_BACKGROUNDS = {
  light: '/homepage-background.png',
  dark: '/homepage-background-dark.png',
}

function getFrostedPillStyles(theme) {
  if (theme === 'dark') {
    return 'border border-white/10 bg-black/25 text-white backdrop-blur-md shadow-lg'
  }
  return 'border border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-lg shadow-black/10'
}

function getStoryCardStyles(theme) {
  if (theme === 'dark') {
    return {
      card: 'border-white/10 bg-black/45 text-white backdrop-blur-md',
      title: '',
      desc: 'text-white/80',
    }
  }
  return {
    card: 'border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-black/10',
    title: 'text-foreground',
    desc: 'text-muted-foreground',
  }
}

function getRightBarStyles(theme) {
  const base =
    'absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto rounded-full px-2.5 py-3.5 backdrop-blur-md'

  if (theme === 'dark') {
    return {
      wrap: `${base} border border-white/10 bg-black/25`,
      counter:
        'text-xs font-semibold tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
      tickInactive: 'bg-white/40 hover:bg-white/70',
      track: 'bg-white/25',
      trackLine: 'bg-white/30',
      label: 'bg-black/55 text-white backdrop-blur-sm',
      nodeInactive: 'bg-black/40 text-white/70 hover:text-white',
      iconInactive: 'bg-black/40 text-white/70 hover:text-white hover:bg-black/55',
      fillTickInactive: 'bg-white/60 hover:bg-white',
      fillTickActiveRing: 'ring-white/70',
      dotInactive: 'bg-white/40 hover:bg-white/70',
      ringTrackStroke: 'rgba(255,255,255,0.25)',
    }
  }

  return {
    wrap: `${base} border border-white/60 bg-white/75 ring-1 ring-black/5`,
    counter: 'text-xs font-semibold tabular-nums text-foreground',
    tickInactive: 'bg-black/25 hover:bg-black/40',
    track: 'bg-black/15',
    trackLine: 'bg-black/20',
    label:
      'bg-white/90 text-foreground backdrop-blur-sm border border-black/5 shadow-md',
    nodeInactive: 'bg-black/10 text-muted-foreground hover:text-foreground',
    iconInactive: 'bg-black/10 text-muted-foreground hover:text-foreground hover:bg-black/15',
    fillTickInactive: 'bg-black/30 hover:bg-black/45',
    fillTickActiveRing: 'ring-black/20',
    dotInactive: 'bg-black/25 hover:bg-black/40',
    ringTrackStroke: 'rgba(0,0,0,0.15)',
  }
}

/**
 * Focus stops. fx/fy are the focus point as a fraction (0..1) of the
 * building image; scale is how far to zoom in at that stop. These are
 * tuned by eye against /building.png (1024x831) and can be adjusted.
 */
const DEFAULT_STOPS = [
  {
    id: 'overview',
    title: 'Your whole operation, one building',
    desc: 'Marker brings every floor of your business together. Scroll to tour each level — from the executive office down to the loading dock.',
    desc2: 'One connected system means no more juggling spreadsheets, disconnected tools, or guesswork between departments.',
    points: ['Single source of truth', 'Role-based access', 'Real-time across floors', 'No spreadsheet sprawl'],
    fx: 0.5,
    fy: 0.5,
    scale: 1,
    card: { x: '6%', y: '50%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
  {
    id: 'reports',
    title: 'Dashboard & Reports',
    desc: 'Get the full picture from the executive view — live KPIs, financial summaries, and reports that turn your operation into clear decisions.',
    desc2: 'Drill into any metric, export board-ready summaries, and spot trends before they become problems.',
    points: ['Live KPI dashboards', 'Financial summaries', 'Custom reports', 'Trend alerts'],
    fx: 0.52,
    fy: 0.20,
    scale: 2.1,
    card: { x: '94%', y: '88%', anchor: 'bottom-right', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
  {
    id: 'orders',
    title: 'Orders & Workflows',
    desc: 'Plan and track purchase, transfer, and sales orders through multi-stage workflows — from request to approval to completion.',
    desc2: 'Every order carries its own approvals, line items, and history so nothing slips through the cracks.',
    points: ['Purchase / transfer / sales', 'Multi-stage approvals', 'Line-item tracking', 'Full audit history'],
    fx: 0.33,
    fy: 0.47,
    scale: 2.2,
    card: { x: '6%', y: '88%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
  {
    id: 'accounts',
    title: 'Accounts & Team',
    desc: 'Manage suppliers, customers, invoices, and payments — with your whole team working from one shared source of truth.',
    desc2: 'Track payables and receivables, log payments, and keep every account reconciled in real time.',
    points: ['Suppliers & customers', 'Invoices & payments', 'Payables / receivables', 'Real-time reconciliation'],
    fx: 0.64,
    fy: 0.50,
    scale: 2.2,
    card: { x: '6%', y: '88%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
  {
    id: 'production',
    title: 'Production & Machines',
    desc: 'Formula-driven manufacturing on the factory floor — track machines, batches, and expected vs actual output for every run.',
    desc2: 'Catch variance early, measure efficiency per line, and keep maintenance schedules on track.',
    points: ['Formula-driven batches', 'Expected vs actual', 'Per-line efficiency', 'Maintenance schedules'],
    fx: 0.27,
    fy: 0.76,
    scale: 2.4,
    card: { x: '94%', y: '88%', anchor: 'bottom-right', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
  {
    id: 'inventory',
    title: 'Inventory & Logistics',
    desc: 'Real-time stock across storage, machines, and projects — right up to the loading dock and out the door.',
    desc2: 'Immutable ledgers record every movement, so balances always reconcile and audits are painless.',
    points: ['Storage / machine / project', 'Immutable ledgers', 'Auto-reconciled balances', 'Painless audits'],
    fx: 0.73,
    fy: 0.78,
    scale: 2.4,
    card: { x: '6%', y: '88%', anchor: 'bottom-left', widthPx: 640, heightPx: null, maxWidthVw: 92 },
  },
]

const DEFAULT_HERO = {
  badge: 'Marker ERP',
  title: 'Run your whole factory from one place',
  subtitle:
    'Orders, inventory, accounts, machines, and production — one platform from the executive office down to the loading dock.',
}

const DEFAULT_CTA = {
  title: 'One building. Every part of your operation.',
  desc: 'From the executive office to the loading dock, Marker connects it all in a single platform.',
}

function cloneStops(stops) {
  return stops.map((s, i) => ({
    ...s,
    points: [...(s.points || [])],
    card: normalizeCard(s.card, DEFAULT_STOPS[i]?.card || DEFAULT_CARD),
  }))
}

function loadSavedContent() {
  try {
    const raw = localStorage.getItem(STOPS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const saved = parsed?.stops
    const result = { hero: { ...DEFAULT_HERO, ...parsed?.hero } }
    if (saved?.length) {
      result.stops = saved.map((s, i) => ({
        ...DEFAULT_STOPS[i],
        ...s,
        points: [...(s.points || DEFAULT_STOPS[i]?.points || [])],
        card: normalizeCard(
          { ...DEFAULT_STOPS[i]?.card, ...s.card },
          DEFAULT_STOPS[i]?.card || DEFAULT_CARD,
        ),
      }))
    }
    return result
  } catch {
    return null
  }
}

/** Campus backdrop follows building scroll at this fraction (0..1). */
const BACKGROUND_PARALLAX = 0.3

const ANCHOR_TRANSLATE = {
  'top-left': '0, 0',
  'top-right': '-100%, 0',
  'bottom-left': '0, -100%',
  'bottom-right': '-100%, -100%',
}

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

function RightBar({ theme, variant, stops, activeIndex, progress, onJump }) {
  const total = stops.length
  const counter = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const bar = getRightBarStyles(theme)
  const wrap = bar.wrap

  // A — Ticks
  if (variant === 'A') {
    return (
      <div className={`${wrap} gap-2`}>
        <div className="flex flex-col items-center gap-2">
          {stops.map((stop, idx) => (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={idx === activeIndex}
              className={`h-3 w-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'bg-primary' : bar.tickInactive
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
          <span className={`absolute -top-7 left-1/2 -translate-x-1/2 w-px h-5 ${bar.trackLine}`} />
          {stops.map((stop, idx) => {
            const active = idx === activeIndex
            return (
              <button
                key={stop.id}
                onClick={() => onJump(idx)}
                aria-label={stop.title}
                aria-current={active}
                className="group relative flex items-center"
              >
                <span
                  className={`absolute right-full mr-3 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-opacity duration-200 ${bar.label} ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {stop.title}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    active
                      ? 'h-3 w-3 bg-primary scale-125'
                      : `h-2 w-2 ${bar.dotInactive}`
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
        <span className={bar.counter}>{counter}</span>
        <div className="relative flex flex-col items-center gap-3">
          <span className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px ${bar.track}`} />
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-primary transition-all duration-300"
            style={{ height: `${(activeIndex / (total - 1)) * 100}%` }}
          />
          {stops.map((stop, idx) => {
            const active = idx === activeIndex
            const done = idx < activeIndex
            return (
              <button
                key={stop.id}
                onClick={() => onJump(idx)}
                aria-label={stop.title}
                aria-current={active}
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  active
                    ? 'bg-primary text-white scale-110'
                    : done
                      ? 'bg-primary/70 text-white'
                      : bar.nodeInactive
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
        <span className={bar.counter}>{counter}</span>
        <div className={`relative h-48 w-1.5 rounded-full ${bar.track}`}>
          <div
            className="absolute top-0 left-0 w-full rounded-full bg-primary transition-all duration-300"
            style={{ height: `${progress * 100}%` }}
          />
          {stops.map((stop, idx) => (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={idx === activeIndex}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
              style={{ top: `${(idx / (total - 1)) * 100}%` }}
            >
              <span
                className={`block h-full w-full rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? `bg-primary ring-2 ${bar.fillTickActiveRing} scale-110`
                    : bar.fillTickInactive
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
        {stops.map((stop, idx) => {
          const active = idx === activeIndex
          return (
            <button
              key={stop.id}
              onClick={() => onJump(idx)}
              aria-label={stop.title}
              aria-current={active}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                active
                  ? 'bg-primary text-white scale-110'
                  : bar.iconInactive
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={STOP_ICON_PATHS[stop.id] || STOP_ICON_PATHS.overview} />
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
          <circle cx="20" cy="20" r={R} fill="none" stroke={bar.ringTrackStroke} strokeWidth="3" />
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
        <span className={`absolute inset-0 flex items-center justify-center ${bar.counter}`}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {stops.map((stop, idx) => (
          <button
            key={stop.id}
            onClick={() => onJump(idx)}
            aria-label={stop.title}
            aria-current={idx === activeIndex}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'bg-primary scale-150' : bar.dotInactive
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Homepage2() {
  const { theme } = useTheme()
  const scrollerRef = useRef(null)
  const sectionRef = useRef(null)
  const pricingRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [barVariant, setBarVariant] = useState('A')
  const [editMode, setEditMode] = useState(false)
  const [editDraftStops, setEditDraftStops] = useState(null)
  const [editDraftHero, setEditDraftHero] = useState(null)
  const saved = loadSavedContent()
  const [stops, setStops] = useState(() => cloneStops(saved?.stops || DEFAULT_STOPS))
  const [hero, setHero] = useState(() => saved?.hero || { ...DEFAULT_HERO })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('homepage2-page')
    return () => document.documentElement.classList.remove('homepage2-page')
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

  // First snap panel is hero-only; remaining panels map to scroll stops.
  const heroPanelCount = 1
  const totalPanels = heroPanelCount + stops.length
  const heroSegment = 1 / (totalPanels - 1)
  const heroActive = progress < heroSegment * 0.5

  const stopProgress = heroActive
    ? 0
    : clamp((progress - heroSegment) / (1 - heroSegment), 0, 1)

  // Derive interpolated focus + active stop from stopProgress.
  const segments = stops.length - 1
  const scaled = stopProgress * segments
  const i = clamp(Math.floor(scaled), 0, segments - 1)
  const frac = smoothstep(scaled - i)

  const from = stops[i]
  const to = stops[i + 1]
  const fx = lerp(from.fx, to.fx, frac)
  const fy = lerp(from.fy, to.fy, frac)
  const scale = lerp(from.scale, to.scale, frac)

  const activeIndex = clamp(Math.round(scaled), 0, stops.length - 1)
  const displayStops = editMode && editDraftStops ? editDraftStops : stops
  const displayHero = editMode && editDraftHero ? editDraftHero : hero
  const activeStop = displayStops[activeIndex]
  const activeCard = normalizeCard(activeStop?.card, DEFAULT_STOPS[activeIndex]?.card)

  // translate so the focus point lands at the viewport center.
  const tx = (0.5 - fx) * 100 * scale
  const ty = (0.5 - fy) * 100 * scale

  const stageStyle = {
    transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
    transition: reducedMotion
      ? 'none'
      : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  }

  const backgroundStageStyle = {
    transform: `translate(${tx * BACKGROUND_PARALLAX}%, ${ty * BACKGROUND_PARALLAX}%) scale(${1 + (scale - 1) * BACKGROUND_PARALLAX})`,
    transition: reducedMotion
      ? 'none'
      : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  }

  const scrollToStop = (idx) => {
    const scroller = scrollerRef.current
    const section = sectionRef.current
    if (!scroller || !section) return
    const scrollable = section.offsetHeight - scroller.clientHeight
    const panel = idx + heroPanelCount
    scroller.scrollTo({ top: (panel / (totalPanels - 1)) * scrollable, behavior: 'smooth' })
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
    scrollToStop(0)
  }

  const saveContent = ({ stops: nextStops, hero: nextHero }) => {
    const clonedStops = nextStops ? cloneStops(nextStops) : stops
    const nextHeroState = nextHero ? { ...nextHero } : hero
    if (nextStops) setStops(clonedStops)
    if (nextHero) setHero(nextHeroState)
    localStorage.setItem(
      STOPS_STORAGE_KEY,
      JSON.stringify({ stops: clonedStops, hero: nextHeroState }),
    )
  }

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false)
      setEditDraftStops(null)
      setEditDraftHero(null)
      return
    }
    setEditDraftStops(cloneStops(stops))
    setEditDraftHero({ ...hero })
    setEditMode(true)
  }

  const updateEditDraftStop = (updatedStop) => {
    setEditDraftStops((prev) =>
      prev.map((s) => (s.id === updatedStop.id ? updatedStop : s)),
    )
  }

  const saveEditDraft = () => {
    if (!editDraftStops) return
    saveContent({ stops: editDraftStops })
  }

  const saveHeroDraft = () => {
    if (!editDraftHero) return
    saveContent({ hero: editDraftHero })
  }

  const { card: cardCls, title: titleCls, desc: descCls } = getStoryCardStyles(theme)
  const frostedPillCls = getFrostedPillStyles(theme)

  return (
    <div
      ref={scrollerRef}
      className="homepage2-scroller h-full min-h-0 overflow-y-auto snap-y snap-mandatory text-foreground"
    >
      <FloatingNavbarShell>
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Marker</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleEditMode}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                editMode
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label="Toggle card edit mode"
              aria-pressed={editMode}
            >
              Edit mode
            </button>
            <button
              onClick={() =>
                setBarVariant((v) => BAR_VARIANTS[(BAR_VARIANTS.indexOf(v) + 1) % BAR_VARIANTS.length])
              }
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted/80 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cycle right-bar design"
            >
              Bar: {barVariant}
            </button>
            <ThemeToggleButton />
            <Link
              to="/"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted/80 px-3 sm:px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </FloatingNavbarShell>

      {/* Scroll-driven building experience */}
      <section ref={sectionRef} className="relative">
        {/* Building stage pinned over the snap panels */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Campus backdrop — parallax under the scroll-driven factory cutaway */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform"
            style={backgroundStageStyle}
          >
            <img
              src={HOMEPAGE_BACKGROUNDS[theme]}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover select-none scale-110"
              draggable={false}
            />
          </div>

          <div
            className="relative z-[1] h-screen aspect-[1024/831] will-change-transform"
            style={stageStyle}
          >
            <img
              src="/building.png"
              alt="Marker headquarters cutaway"
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>

          {/* Blur panel — hero landing screen */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-20 pointer-events-none transition-[opacity,backdrop-filter] duration-500 ${
              heroActive ? 'opacity-100 backdrop-blur-[8px]' : 'opacity-0 backdrop-blur-none'
            }`}
          />

          {/* Hero overlay — first screen before scroll */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              heroActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${editMode && heroActive ? 'z-40 pointer-events-auto' : 'z-30'}`}
          >
            <div className="flex h-full items-center justify-center">
              <div
                className={`relative mx-auto max-w-2xl px-6 ${
                  editMode && heroActive
                    ? 'rounded-2xl border border-white/20 bg-black/50 p-6 shadow-2xl backdrop-blur-md ring-2 ring-primary/50'
                    : 'text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]'
                }`}
              >
                {editMode && heroActive ? (
                  <Homepage2HeroSettings
                    hero={displayHero}
                    onChange={setEditDraftHero}
                    onSave={saveHeroDraft}
                  />
                ) : (
                  <>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                      {displayHero.badge}
                    </span>
                    <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.7)]">
                      {displayHero.title}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg sm:text-xl font-medium leading-relaxed text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
                      {displayHero.subtitle}
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
                  </>
                )}
              </div>
            </div>

            {!editMode && (
              <div className="pointer-events-none absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${frostedPillCls}`}>
                  <span>Scroll to explore</span>
                  <svg className="h-4 w-4 animate-bounce text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Feature story card — hidden on hero; overview is first card after scroll */}
          <div
            className={`pointer-events-none absolute transition-opacity duration-300 ${
              heroActive ? 'opacity-0' : 'opacity-100'
            } ${editMode ? 'z-40' : 'z-10'}`}
            style={{
              left: activeCard.x,
              top: activeCard.y,
              transform: `translate(${ANCHOR_TRANSLATE[activeCard.anchor]})`,
            }}
          >
            <div
              key={activeStop.id}
              className={`animate-fade-up pointer-events-auto rounded-2xl border p-6 shadow-2xl ${cardCls} ${
                editMode ? 'ring-2 ring-primary/50' : ''
              }`}
              style={getCardStyle(activeCard, DEFAULT_STOPS[activeIndex]?.card)}
            >
              {editMode && !heroActive ? (
                <Homepage2StoryCardSettings
                  stop={activeStop}
                  onChange={updateEditDraftStop}
                  onSave={saveEditDraft}
                />
              ) : (
                <>
                  <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${titleCls}`}>
                    {activeStop.title}
                  </h2>
                  <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>
                    {activeStop.desc}
                  </p>
                  {activeStop.desc2 && (
                    <p className={`mt-3 text-sm sm:text-base leading-relaxed ${descCls}`}>
                      {activeStop.desc2}
                    </p>
                  )}
                  {activeStop.points && (
                    <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {activeStop.points.map((p) => (
                        <li key={p} className={`flex items-start gap-2 text-sm ${descCls}`}>
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>

          {!heroActive && (
            <RightBar
              theme={theme}
              variant={barVariant}
              stops={displayStops}
              activeIndex={activeIndex}
              progress={stopProgress}
              onJump={scrollToStop}
            />
          )}

        </div>

        {/* Snap panels — one per stop. Pulled up under the sticky stage so the
            first panel aligns with progress 0. Each is a scroll-snap target. */}
        <div style={{ marginTop: '-100vh' }}>
          <div key="hero" className="h-screen snap-start" aria-hidden="true" />
          {stops.map((stop) => (
            <div key={stop.id} className="h-screen snap-start" aria-hidden="true" />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <div ref={pricingRef} className="snap-start">
        <Pricing />
      </div>

      {/* Closing CTA */}
      <section className="relative snap-start bg-background py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {DEFAULT_CTA.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {DEFAULT_CTA.desc}
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
