import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import GlobePanel from '../components/Globe/GlobePanel'
import DetailPanel from '../components/DetailPanel/DetailPanel'
import { useSatellites } from '../hooks/useSatellites'
import { fetchMissionIntel } from '../lib/api'

function CommandCenter() {
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [intelBySatellite, setIntelBySatellite] = useState({})
  const [intelLoading, setIntelLoading] = useState(false)
  const [intelError, setIntelError] = useState(null)
  const intelCacheRef = useRef({})
  const { satellites, loading, error } = useSatellites()

  useEffect(() => {
    let cancelled = false

    async function loadIntel() {
      if (!selectedSatellite) {
        if (!cancelled) {
          setIntelLoading(false)
          setIntelError(null)
        }
        return
      }

      const cacheKey = selectedSatellite.id
      const cachedIntel = intelCacheRef.current[cacheKey]
      if (cachedIntel) {
        if (!cancelled) {
          setIntelLoading(false)
          setIntelError(null)
        }
        return
      }

      if (!cancelled) {
        setIntelLoading(true)
        setIntelError(null)
      }

      try {
        const intel = await fetchMissionIntel(selectedSatellite)
        if (!cancelled) {
          intelCacheRef.current = {
            ...intelCacheRef.current,
            [cacheKey]: intel
          }
          setIntelBySatellite((prev) => ({
            ...prev,
            [cacheKey]: intel
          }))
        }
      } catch (err) {
        if (!cancelled) {
          setIntelError(err.message || 'Failed to load mission summary')
        }
      } finally {
        if (!cancelled) {
          setIntelLoading(false)
        }
      }
    }

    loadIntel()

    return () => {
      cancelled = true
    }
  }, [selectedSatellite?.id])

  // CelesTrak fetch failed entirely
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-void gap-4">
        <div style={{
          width: '24px',
          height: '24px',
          border: '1px solid var(--primary)',
          transform: 'rotate(45deg)'
        }} />
        <p style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: 'var(--primary)'
        }}>
          TELEMETRY LINK FAILURE
        </p>
        <p style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '0.55rem',
          letterSpacing: '0.1em',
          color: 'var(--text-ghost)'
        }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex bg-void overflow-hidden">
      <Sidebar
        satellites={satellites}
        loading={loading}
        selectedSatellite={selectedSatellite}
        onSelectSatellite={setSelectedSatellite}
      />
      <GlobePanel
        satellites={satellites}
        selectedSatellite={selectedSatellite}
        onSelectSatellite={setSelectedSatellite}
      />
      <DetailPanel
        satellite={selectedSatellite}
        missionIntel={selectedSatellite ? intelBySatellite[selectedSatellite.id] : null}
        intelLoading={intelLoading}
        intelError={intelError}
      />
    </div>
  )
}

export default CommandCenter
