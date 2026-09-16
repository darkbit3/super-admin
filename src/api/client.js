const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-1-naba.onrender.com/api'
const SERVER_ROOT = BASE_URL.replace(/\/api$/, '')
const REQUEST_TIMEOUT_MS = 30_000 // 30 seconds

function getAccessToken() {
  return localStorage.getItem('sa_access_token')
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('sa_access_token', accessToken)
  if (refreshToken) localStorage.setItem('sa_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('sa_access_token')
  localStorage.removeItem('sa_refresh_token')
  localStorage.removeItem('sa_auth')
}

// Ping the server to wake it up (Render free-tier cold start)
export async function warmUp(signal) {
  try {
    await fetch(`${SERVER_ROOT}/health`, { method: 'GET', signal })
    return true
  } catch {
    return false
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    // Merge caller's signal with our timeout signal
    const signal = options.signal
      ? anySignal([options.signal, controller.signal])
      : controller.signal
    const res = await fetch(url, { ...options, signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// Combine multiple abort signals — aborts when any fires
function anySignal(signals) {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(); break }
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller.signal
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('sa_refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetchWithTimeout(`${BASE_URL}/super-auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error('Session expired. Please log in again.')
  }

  const data = await res.json()
  setTokens(data.data.accessToken, data.data.refreshToken)
  return data.data.accessToken
}

async function request(path, options = {}, retry = true, refreshOnUnauthorized = true) {
  const token = getAccessToken()

  let res
  try {
    res = await fetchWithTimeout(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. The server may be starting up — please try again.')
      timeoutErr.status = 408
      throw timeoutErr
    }
    throw new Error('Unable to reach server. Check your connection and try again.')
  }

  // Token expired — try silent refresh once
  if (res.status === 401 && retry && refreshOnUnauthorized) {
    try {
      await refreshAccessToken()
      return request(path, options, false, refreshOnUnauthorized)
    } catch {
      clearTokens()
      throw new Error('Session expired. Please log in again.')
    }
  }

  const data = await res.json()

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.errors = data?.errors
    throw err
  }

  return data
}

export const api = {
  get:    (path, options)       => request(path, { method: 'GET' }, true, options?.refreshOnUnauthorized !== false),
  post:   (path, body, options) => request(path, { method: 'POST', body: JSON.stringify(body) }, true, options?.refreshOnUnauthorized !== false),
  put:    (path, body, options) => request(path, { method: 'PUT', body: JSON.stringify(body) }, true, options?.refreshOnUnauthorized !== false),
  patch:  (path, body, options) => request(path, { method: 'PATCH', body: JSON.stringify(body) }, true, options?.refreshOnUnauthorized !== false),
  delete: (path, options)       => request(path, { method: 'DELETE' }, true, options?.refreshOnUnauthorized !== false),
}
