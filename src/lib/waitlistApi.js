const DEFAULT_API_URL = 'http://localhost:8000/api/v1'

function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || DEFAULT_API_URL
  return raw.replace(/\/$/, '')
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
      email,
      wants_product_updates: wantsProductUpdates,
      turnstile_token: turnstileToken,
      source: source || 'waitlist_section',
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
