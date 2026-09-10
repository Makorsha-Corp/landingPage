/** Flip to re-enable the pricing deck panel and nav link. */
export const SHOW_PRICING_SECTION = false

/** Dev tools popover — local `npm run dev` only; omitted from production builds. */
export const SHOW_LANDING_DEV_TOOLS = import.meta.env.DEV

/** Perf overlay — dev builds, or any build with `?perf` in the URL (phone preview). */
export const SHOW_PERF_HUD =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perf'))
