import { getVitalsSnapshot } from './landingVitalsStore'

const DROPPED_FRAME_THRESHOLD_MS = (1000 / 60) * 1.5

function formatMs(value) {
  return value == null ? 'n/a' : `${value}ms`
}

function formatDurationMs(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds % 60
  if (minutes > 0) return `${minutes}m ${remSeconds}s`
  return `${seconds}s`
}

function parseDeviceHints() {
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
    navigator.userAgentData?.platform ??
    (/iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : navigator.platform ?? 'unknown')

  return { deviceLabel, platform, userAgent: ua }
}

export function collectDeviceContext() {
  if (typeof window === 'undefined') {
    return { deviceLabel: 'unknown', platform: 'unknown' }
  }

  const { deviceLabel, platform, userAgent } = parseDeviceHints()
  const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection

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
    deviceMemoryGb: navigator.deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints ?? null,
    pageUrl: window.location.pathname + window.location.search,
    buildMode: import.meta.env.PROD ? 'prod' : 'dev',
  }
}

export function readVitalsSnapshot() {
  return getVitalsSnapshot()
}

function formatDeviceLine(device) {
  const viewport = `${device.viewportWidth}×${device.viewportHeight} @${device.devicePixelRatio}x`
  return `${device.deviceLabel} · ${device.platform} · ${viewport}`
}

function formatNetworkLine(device) {
  const network = device.networkType ?? 'n/a'
  const downlink = device.downlinkMbps != null ? `${device.downlinkMbps}Mbps` : 'n/a'
  const saveData =
    device.saveData == null ? 'saveData n/a' : device.saveData ? 'saveData on' : 'saveData off'
  const connType = device.connectionType ? ` · ${device.connectionType}` : ''
  return `${network}${connType} · ${device.language} · ${device.timezone} · ${downlink} · ${saveData}`
}

function formatHardwareLine(device) {
  const cores = device.hardwareConcurrency ?? 'n/a'
  const memory = device.deviceMemoryGb != null ? `${device.deviceMemoryGb}GB` : 'n/a'
  const touch = device.maxTouchPoints ?? 'n/a'
  return `${cores} cores · ${memory} RAM · ${touch} touch points`
}

function formatTourLine(tour = {}) {
  const hero = tour.heroActive ? 'on' : 'off'
  let drawer = 'off'
  if (tour.mobileTourDrawerExpanded) drawer = 'expanded'
  else if (tour.mobileTourDrawerVisible) drawer = 'peek'
  const mobile = tour.isMobileTour ? 'mobile tour' : 'desktop tour'
  return `${mobile} · ${tour.theme ?? 'unknown'} · hero ${hero} · stop ${tour.activeIndex ?? 0} · drawer ${drawer} · wash ${(tour.featuresBackdropProgress ?? 0).toFixed(2)} · section ${tour.activeSection ?? 'n/a'}`
}

function formatVitalsLine(vitals) {
  return `LCP ${formatMs(vitals.lcpMs)} · CLS ${vitals.cls ?? 'n/a'} · INP ${formatMs(vitals.inpMs)}`
}

function formatLoadLine(vitals) {
  return `TTFB ${formatMs(vitals.ttfbMs)} · DCL ${formatMs(vitals.domContentLoadedMs)}`
}

function formatBurstLine(burst) {
  if (!burst) return 'Quick sample: n/a'
  return `Quick sample (1s): ${burst.avgFps} fps avg · worst ${burst.worstFrameMs}ms · ${burst.droppedFrames} dropped`
}

function formatPerfSessionBlock(session) {
  if (!session) return ''

  const dropRate =
    session.totalFrames > 0
      ? `${((session.totalDropped / session.totalFrames) * 100).toFixed(2)}%`
      : '0%'

  const lines = [
    '',
    '── Perf session ──',
    `Session: ${formatDurationMs(session.durationMs)} · ${session.totalFrames} frames · ${session.totalDropped} dropped (${dropRate})`,
    `Live: ${session.fps} fps (avg ${session.avgFps}) · p95 ${session.p95FrameMs}ms · jank ${session.jankPercent}%`,
    `Session peak: worst ${session.sessionWorstMs}ms · lowest avg ${session.sessionLowestAvgFps} fps · p99 ${session.sessionP99Ms}ms`,
    `Long tasks (HUD): ${session.longTaskCount} (${session.longTaskMs}ms)`,
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

export function formatLandingFeedbackReport({
  device,
  tour,
  vitals,
  burst,
  perfSession = null,
  includeFooter = true,
}) {
  const resolvedDevice = device ?? collectDeviceContext()
  const resolvedVitals = vitals ?? readVitalsSnapshot()

  const lines = [
    'Kolom Landing Feedback',
    '──────────────────────',
    `Device: ${formatDeviceLine(resolvedDevice)}`,
    `Network: ${formatNetworkLine(resolvedDevice)}`,
    `Hardware: ${formatHardwareLine(resolvedDevice)}`,
    `Page: ${resolvedDevice.pageUrl} · ${resolvedDevice.buildMode}`,
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

export function formatLandingPerfReport(snapshot) {
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

export function buildPerfPayload(snapshot, device = collectDeviceContext()) {
  return {
    device,
    tour: snapshot?.tour ?? {},
    vitals: snapshot?.vitals ?? null,
    perfSession: snapshot,
  }
}

export { DROPPED_FRAME_THRESHOLD_MS }
