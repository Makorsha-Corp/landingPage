const DEFAULT_API_URL = 'http://localhost:8000/api/v1'

function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || DEFAULT_API_URL
  return raw.replace(/\/$/, '')
}

function formatApiError(detail) {
  if (!detail) return 'Could not send feedback — please try again.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(' ')
  }
  return 'Could not send feedback — please try again.'
}

export async function submitLandingPerfReport(report) {
  const response = await fetch(`${getApiBaseUrl()}/landing-perf-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests — please wait a moment.')
    }
    throw new Error(formatApiError(data.detail))
  }

  return data
}
