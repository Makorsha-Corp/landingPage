const DEFAULT_API_URL = 'http://localhost:8000/api/v1'

// TODO(waitlist-source): add `fab` to backend WaitlistSource literal when tracked separately.
const ALLOWED_SOURCES = ['waitlist_section', 'hero', 'pricing', 'nav', 'unknown']

function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || DEFAULT_API_URL
  return raw.replace(/\/$/, '')
}

function normalizeSource(source) {
  return ALLOWED_SOURCES.includes(source) ? source : 'unknown'
}

function formatApiError(detail) {
  if (!detail) return 'Something went wrong — please try again.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(' ')
  }
  return 'Something went wrong — please try again.'
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
}) {
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
    throw new Error(formatApiError(data.detail))
  }

  return data
}

export function getTurnstileSiteKey() {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
}

export function getDevBypassTurnstileToken() {
  return import.meta.env.DEV ? 'dev-bypass' : ''
}
