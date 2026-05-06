const AUTH_TOKEN_KEY = 'animewl_auth_token'

function getBackendUrl() {
  return import.meta.env.VITE_BACKENDURL || ''
}

function isApiRequest(input) {
  const url = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input?.url || ''

  const backendUrl = getBackendUrl()
  return url.startsWith('/api') || (backendUrl && url.startsWith(`${backendUrl}/api`))
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function installAuthTokenFetch() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    const options = { ...init }

    if (isApiRequest(input)) {
      const token = getAuthToken()
      const headers = new Headers(options.headers || {})

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      options.headers = headers
    }

    const response = await originalFetch(input, options)

    if (isApiRequest(input)) {
      response.clone().json()
        .then((data) => {
          if (data?.token) setAuthToken(data.token)
          if (response.status === 401) clearAuthToken()
        })
        .catch(() => {})
    }

    return response
  }
}
