import { SATELLITES } from '../data/satellites'
import { fetchTLEs } from './api'

export async function fetchAllTLEs(options = {}) {
  // Collect NORAD IDs for satellites that have them
  const fetchable = SATELLITES.filter(s => s.noradId)
  const noradIds = fetchable.map(s => s.noradId)

  let tleMap = {}

  try {
    tleMap = await fetchTLEs(noradIds, options)
  } catch {
    tleMap = {}
  }

  return SATELLITES.map(sat => {
    // Live TLE from backend
    if (sat.noradId && tleMap[sat.noradId]) {
      const { line1, line2 } = tleMap[sat.noradId]
      return { ...sat, tle: [line1, line2] }
    }

    // Fallback TLE for non-Earth-orbit satellites
    if (sat.fallbackTle) {
      return { ...sat, tle: sat.fallbackTle }
    }

    return { ...sat, tle: null }
  })
}
