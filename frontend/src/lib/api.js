const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Generic fetch wrapper with error handling
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const { headers, ...restOptions } = options

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `API error ${response.status}`)
  }

  return response.json()
}

// Fetch TLEs for multiple satellites in one request
export async function fetchTLEs(noradIds, options = {}) {
  const ids = noradIds.join(',')
  const data = await apiFetch(`/api/tle?ids=${ids}`, options)
  return data.data // { [noradId]: { line1, line2 } }
}

// Fetch AI mission intel for a satellite
export async function fetchMissionIntel(satellite, options = {}) {
  const data = await apiFetch('/api/groq/intel', {
    method: 'POST',
    body: JSON.stringify(satellite),
    ...options,
  })
  return data.intel
}

