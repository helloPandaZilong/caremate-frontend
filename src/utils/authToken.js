const TOKEN_KEYS = [
  'caremate_access_token',
  'accessToken',
  'caremate-access-token',
  'caremate.accessToken',
  'token',
]

export function getAccessToken() {
  if (typeof window === 'undefined') return ''
  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key)
    if (value) return value
  }
  return ''
}

export function setAccessToken(token) {
  if (typeof window === 'undefined' || !token) return
  window.localStorage.setItem('caremate_access_token', token)
}

export function removeAccessToken() {
  if (typeof window === 'undefined') return
  TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

export function hasAccessToken() {
  return Boolean(getAccessToken())
}
