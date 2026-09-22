const DEFAULT_API_URL = 'http://localhost:8000/api/v1'

// TODO(waitlist-source): add `fab` to backend WaitlistSource literal when tracked separately.
const ALLOWED_SOURCES = ['waitlist_section', 'hero', 'pricing', 'nav', 'unknown'] as const
type WaitlistSource = (typeof ALLOWED_SOURCES)[number]

function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || DEFAULT_API_URL
  return raw.replace(/\/$/, '')
}

function normalizeSource(source: string | undefined): WaitlistSource {
  return (ALLOWED_SOURCES as readonly string[]).includes(source ?? '') 
    ? (source as WaitlistSource) 
    : 'unknown'
}

function formatApiError(detail: unknown): string {
  if (!detail) return 'Something went wrong — please try again.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => (item as { msg?: string })?.msg || String(item)).join(' ')
  }
  return 'Something went wrong — please try again.'
}

export interface WaitlistSignupParams {
  firstName: string
  lastName: string
  companyName?: string
  email: string
  wantsProductUpdates: boolean
  turnstileToken: string
  source?: string
  website?: string
}

export interface WaitlistSignupResponse {
  id?: string
  [key: string]: unknown
}

export async function submitWaitlistSignup({
  firstName,
  lastName,
  companyName,
  email,
  wantsProductUpdates,
  turnstileToken,
  source,
  website,
}: WaitlistSignupParams): Promise<WaitlistSignupResponse> {
  const response = await fetch(`${getApiBaseUrl()}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      company_name: companyName || undefined,
      email,
      wants_product_updates: wantsProductUpdates,
      turnstile_token: turnstileToken,
      source: normalizeSource(source),
      website: website || undefined,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(formatApiError((data as { detail?: unknown }).detail))
  }

  return data as WaitlistSignupResponse
}

export function getTurnstileSiteKey(): string {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
}

// No site key configured (any environment) → Turnstile isn't set up yet, so
// skip the widget and send a placeholder token. Backend skips verification
// the same way whenever TURNSTILE_SECRET_KEY is unset. Remove once real
// Cloudflare Turnstile keys are wired up.
export function getDevBypassTurnstileToken(): string {
  return getTurnstileSiteKey() ? '' : 'turnstile-disabled'
}
