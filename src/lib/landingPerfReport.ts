import { getVitalsSnapshot } from './landingVitalsStore'
import type { VitalsSnapshot } from './landingVitalsStore'

export type { VitalsSnapshot }

export const DROPPED_FRAME_THRESHOLD_MS = (1000 / 60) * 1.5

function formatMs(value: number | null | undefined): string {
  return value == null ? 'n/a' : `${value}ms`
}

function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds % 60
  if (minutes > 0) return `${minutes}m ${remSeconds}s`
  return `${seconds}s`
}

export interface DeviceContext {
  deviceLabel: string
  platform: string
  userAgent?: string
  viewportWidth?: number
  viewportHeight?: number
  devicePixelRatio?: number
  language?: string
  timezone?: string
  networkType?: string | null
  downlinkMbps?: number | null
  saveData?: boolean | null
  connectionType?: string | null
  hardwareConcurrency?: number | null
  deviceMemoryGb?: number | null
  maxTouchPoints?: number | null
  pageUrl?: string
  buildMode?: string
}

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  saveData?: boolean
  type?: string
}

function parseDeviceHints(): { deviceLabel: string; platform: string; userAgent?: string } {
  if (typeof navigator === 'undefined') {
    return { deviceLabel: 'unknown', platform: 'unknown' }
  }

  const ua = navigator.userAgent
  let deviceLabel = 'unknown'

  if (/iPhone/.test(ua)) deviceLabel = 'iPhone'
  else if (/iPad/.test(ua)) deviceLabel = 'iPad'
  else if (/Android/.test(ua)) {
    const match = ua.match(/Android [\d.]+; ([^;)]+)/)
    deviceLabel = match?.[1]?.trim() ?? 'Android'
  } else if (/Macintosh/.test(ua)) deviceLabel = 'Mac'
  else if (/Windows/.test(ua)) deviceLabel = 'Windows'
  else if (/Linux/.test(ua)) deviceLabel = 'Linux'

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    (/iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : navigator.platform ?? 'unknown')

  return { deviceLabel, platform, userAgent: ua }
}

export function collectDeviceContext(): DeviceContext {
  if (typeof window === 'undefined') {
    return { deviceLabel: 'unknown', platform: 'unknown' }
  }

  const { deviceLabel, platform, userAgent } = parseDeviceHints()
  const connection: NetworkInfo | undefined =
    (navigator as Navigator & { connection?: NetworkInfo; mozConnection?: NetworkInfo; webkitConnection?: NetworkInfo })
      .connection ??
    (navigator as Navigator & { mozConnection?: NetworkInfo }).mozConnection ??
    (navigator as Navigator & { webkitConnection?: NetworkInfo }).webkitConnection

  return {
    deviceLabel,
    platform,
    userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio ?? 1,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    networkType: connection?.effectiveType ?? null,
    downlinkMbps: connection?.downlink ?? null,
    saveData: connection?.saveData ?? null,
    connectionType: connection?.type ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemoryGb: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints ?? null,
    pageUrl: window.location.pathname + window.location.search,
    buildMode: import.meta.env.PROD ? 'prod' : 'dev',
  }
}

export function readVitalsSnapshot(): VitalsSnapshot {
  return getVitalsSnapshot()
}

function formatDeviceLine(device: DeviceContext): string {
  const viewport = `${device.viewportWidth ?? 0}×${device.viewportHeight ?? 0} @${device.devicePixelRatio ?? 1}x`
  return `${device.deviceLabel} · ${device.platform} · ${viewport}`
}

function formatNetworkLine(device: DeviceContext): string {
  const network = device.networkType ?? 'n/a'
  const downlink = device.downlinkMbps != null ? `${device.downlinkMbps}Mbps` : 'n/a'
  const saveData =
    device.saveData == null ? 'saveData n/a' : device.saveData ? 'saveData on' : 'saveData off'
  const connType = device.connectionType ? ` · ${device.connectionType}` : ''
  return `${network}${connType} · ${device.language ?? 'n/a'} · ${device.timezone ?? 'n/a'} · ${downlink} · ${saveData}`
}

function formatHardwareLine(device: DeviceContext): string {
  const cores = device.hardwareConcurrency ?? 'n/a'
  const memory = device.deviceMemoryGb != null ? `${device.deviceMemoryGb}GB` : 'n/a'
  const touch = device.maxTouchPoints ?? 'n/a'
  return `${cores} cores · ${memory} RAM · ${touch} touch points`
}

export interface TourContext {
  heroActive?: boolean
  heroExitAdvanced?: boolean
  heroTransitionT?: number
  mobileTourCopyVisible?: boolean
  isMobileTour?: boolean
  theme?: string
  activeIndex?: number
  featuresBackdropProgress?: number
  activeSection?: string
}

function formatTourLine(tour: TourContext = {}): string {
  const hero = tour.heroActive ? 'on' : 'off'
  const copy = tour.mobileTourCopyVisible ? 'on' : 'off'
  const mobile = tour.isMobileTour ? 'mobile tour' : 'desktop tour'
  return `${mobile} · ${tour.theme ?? 'unknown'} · hero ${hero} · stop ${tour.activeIndex ?? 0} · copy ${copy} · wash ${(tour.featuresBackdropProgress ?? 0).toFixed(2)} · section ${tour.activeSection ?? 'n/a'}`
}

function formatVitalsLine(vitals: VitalsSnapshot): string {
  return `LCP ${formatMs(vitals.lcpMs)} · CLS ${vitals.cls ?? 'n/a'} · INP ${formatMs(vitals.inpMs)}`
}

function formatLoadLine(vitals: VitalsSnapshot): string {
  return `TTFB ${formatMs(vitals.ttfbMs)} · DCL ${formatMs(vitals.domContentLoadedMs)}`
}

export interface BurstMetrics {
  avgFps: number
  worstFrameMs: number
  droppedFrames: number
  durationMs?: number
}

function formatBurstLine(burst: BurstMetrics | null | undefined): string {
  if (!burst) return 'Quick sample: n/a'
  return `Quick sample (1s): ${burst.avgFps} fps avg · worst ${burst.worstFrameMs}ms · ${burst.droppedFrames} dropped`
}

export interface PhaseMarker {
  label: string
  elapsedMs: number
  fps: number
  avgFps: number
  droppedWindow: number
  worstWindow: number
}

export interface PerfSession {
  fps?: number
  avgFps?: number
  p95FrameMs?: number
  jankPercent?: number
  worstFrameMs?: number
  droppedFrames?: number
  longTaskCount?: number
  longTaskMs?: number
  durationMs?: number
  totalFrames?: number
  totalDropped?: number
  sessionWorstMs?: number
  sessionLowestAvgFps?: number
  sessionP99Ms?: number
  phaseMarkers?: PhaseMarker[]
}

function formatPerfSessionBlock(session: PerfSession | null | undefined): string {
  if (!session) return ''

  const dropRate =
    (session.totalFrames ?? 0) > 0
      ? `${(((session.totalDropped ?? 0) / (session.totalFrames ?? 1)) * 100).toFixed(2)}%`
      : '0%'

  const lines = [
    '',
    '── Perf session ──',
    `Session: ${formatDurationMs(session.durationMs ?? 0)} · ${session.totalFrames ?? 0} frames · ${session.totalDropped ?? 0} dropped (${dropRate})`,
    `Live: ${session.fps ?? 0} fps (avg ${session.avgFps ?? 0}) · p95 ${session.p95FrameMs ?? 0}ms · jank ${session.jankPercent ?? 0}%`,
    `Session peak: worst ${session.sessionWorstMs ?? 0}ms · lowest avg ${session.sessionLowestAvgFps ?? 0} fps · p99 ${session.sessionP99Ms ?? 0}ms`,
    `Long tasks (HUD): ${session.longTaskCount ?? 0} (${session.longTaskMs ?? 0}ms)`,
  ]

  if (session.phaseMarkers?.length) {
    lines.push('Phase markers:')
    for (const marker of session.phaseMarkers) {
      lines.push(
        `  +${formatDurationMs(marker.elapsedMs)}  ${marker.label} · ${marker.avgFps} fps · dropped ${marker.droppedWindow} · worst ${marker.worstWindow}ms`,
      )
    }
  }

  return lines.join('\n')
}

export interface FeedbackReportOptions {
  device?: DeviceContext | null
  tour?: TourContext
  vitals?: VitalsSnapshot | null
  burst?: BurstMetrics | null
  perfSession?: PerfSession | null
  includeFooter?: boolean
}

export function formatLandingFeedbackReport({
  device,
  tour,
  vitals,
  burst,
  perfSession = null,
  includeFooter = true,
}: FeedbackReportOptions): string {
  const resolvedDevice = device ?? collectDeviceContext()
  const resolvedVitals = vitals ?? readVitalsSnapshot()

  const lines = [
    'Kolom Landing Feedback',
    '──────────────────────',
    `Device: ${formatDeviceLine(resolvedDevice)}`,
    `Network: ${formatNetworkLine(resolvedDevice)}`,
    `Hardware: ${formatHardwareLine(resolvedDevice)}`,
    `Page: ${resolvedDevice.pageUrl ?? 'n/a'} · ${resolvedDevice.buildMode ?? 'n/a'}`,
    '',
    `Tour: ${formatTourLine(tour)}`,
    `Vitals: ${formatVitalsLine(resolvedVitals)}`,
    `Load: ${formatLoadLine(resolvedVitals)}`,
    '',
    formatBurstLine(burst),
    `Long tasks since load: ${resolvedVitals.longTaskCount} (${resolvedVitals.longTaskMs}ms)`,
    formatPerfSessionBlock(perfSession),
  ]

  if (includeFooter) {
    lines.push('', '(Paste this message to the Kolom team with any notes about what felt slow.)')
  }

  return lines.filter((line) => line !== undefined).join('\n')
}

export interface PerfSnapshot extends PerfSession {
  device?: DeviceContext
  tour?: TourContext
  vitals?: VitalsSnapshot | null
  burst?: BurstMetrics | null
}

export function formatLandingPerfReport(snapshot: PerfSnapshot): string {
  return formatLandingFeedbackReport({
    device: snapshot.device,
    tour: snapshot.tour,
    vitals: snapshot.vitals,
    burst: snapshot.burst,
    perfSession: snapshot,
    includeFooter: true,
  })
}

export const buildDeviceContext = collectDeviceContext

export interface PerfPayload {
  device: DeviceContext
  tour: TourContext
  vitals: VitalsSnapshot | null
  perfSession: PerfSnapshot | null
}

export function buildPerfPayload(
  snapshot: PerfSnapshot | null | undefined,
  device: DeviceContext = collectDeviceContext(),
): PerfPayload {
  return {
    device,
    tour: snapshot?.tour ?? {},
    vitals: snapshot?.vitals ?? null,
    perfSession: snapshot ?? null,
  }
}
