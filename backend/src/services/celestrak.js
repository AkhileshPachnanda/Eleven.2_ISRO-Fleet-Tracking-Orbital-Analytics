import NodeCache from 'node-cache'

// Cache TLE data for 30 minutes (prevents LEO drift for objects like ISS)
// stdTTL = standard time-to-live in seconds
const cache = new NodeCache({ stdTTL: 30 * 60 })

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php'

// Parse raw TLE text into an array of satellite objects
// TLE format: groups of 3 lines — name, line1, line2
function parseTLEText(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  const satellites = []

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 >= lines.length) break

    const name  = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]

    if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) continue

    // Extract NORAD ID from line 1 — characters 2-7
    const noradId = parseInt(line1.substring(2, 7).trim())

    satellites.push({ name, line1, line2, noradId })
  }

  return satellites
}

// Fetch TLE for a single satellite by NORAD ID
export async function fetchTLEById(noradId) {
  const cacheKey = `tle_${noradId}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return { ...cached, source: 'cache' }
  }

  const url = `${CELESTRAK_BASE}?CATNR=${noradId}&FORMAT=TLE`
  const response = await fetch(url)

  if (!response.ok) throw new Error(`CelesTrak returned ${response.status}`)

  const text = await response.text()
  if (!text || text.includes('No GP data found')) {
    throw new Error(`No TLE data found for NORAD ID ${noradId}`)
  }

  const parsed = parseTLEText(text)
  if (!parsed.length) throw new Error('Failed to parse TLE response')

  const result = { line1: parsed[0].line1, line2: parsed[0].line2, noradId }
  cache.set(cacheKey, result)

  return { ...result, source: 'live' }
}

// Fetch TLEs for multiple NORAD IDs sequentially to prevent rate limiting
export async function fetchTLEBatch(noradIds) {
  const tleMap = {}

  // Celestrak restricts IPs that make >15 concurrent connections.
  // We process these sequentially to be polite and avoid 503 errors.
  for (const id of noradIds) {
    try {
      tleMap[id] = await fetchTLEById(id)
      // Polite delay between requests
      await new Promise(resolve => setTimeout(resolve, 50))
    } catch (err) {
      console.warn(`Failed to fetch TLE for NORAD ID ${id}:`, err.message)
      tleMap[id] = null
    }
  }

  return tleMap
}

export function getCacheStats() {
  return cache.getStats()
}
