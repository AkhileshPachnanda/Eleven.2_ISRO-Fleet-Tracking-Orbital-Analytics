import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar/TopBar'
import GlobeCanvas from '../components/Globe/GlobeCanvas'
import SatelliteDrawer from '../components/SatelliteDrawer/SatelliteDrawer'
import SatelliteDetail from '../components/SatelliteDetail/SatelliteDetail'
import OrbitLegend from '../components/UI/OrbitLegend'
import TimeScrubber from '../components/UI/TimeScrubber'
import { useSatellites } from '../hooks/useSatellites'
import { fetchMissionIntel } from '../lib/api'

function CommandCenter() {
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [isListOpen, setIsListOpen] = useState(false)
  const [intelBySatellite, setIntelBySatellite] = useState({})
  const [intelLoading, setIntelLoading] = useState(false)
  const [intelError, setIntelError] = useState(null)
  const [timeOffset, setTimeOffset] = useState(0)
  const intelCacheRef = useRef({})
  const { satellites, loading, error } = useSatellites(timeOffset)
  
  // Real-time tick to keep simulatedTime advancing
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const simulatedTime = new Date(now + timeOffset)
  const isLive = Math.abs(timeOffset) < 1000

  // Fetch mission intel when satellite selected
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

  // Handle satellite selection
  function handleSelectSatellite(sat) {
    if (selectedSatellite?.id === sat.id) {
      // Deselect if clicking same satellite
      setSelectedSatellite(null)
    } else {
      setSelectedSatellite(sat)
    }
  }

  // Error state
  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--status-alert)',
          opacity: 0.15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} />
        <p style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          Connection failed
        </p>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-tertiary)',
          maxWidth: '300px',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Top bar */}
      <TopBar
        satelliteCount={satellites.length}
        onToggleList={() => setIsListOpen(prev => !prev)}
        isListOpen={isListOpen}
        simulatedTime={simulatedTime}
        isLive={isLive}
      />

      {/* Globe — fullscreen behind everything */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <GlobeCanvas
          satellites={satellites}
          selectedSatellite={selectedSatellite}
          onSelectSatellite={handleSelectSatellite}
          timeOffset={timeOffset}
        />
      </div>

      {/* Satellite list drawer (left) */}
      <SatelliteDrawer
        satellites={satellites}
        loading={loading}
        selectedSatellite={selectedSatellite}
        onSelectSatellite={handleSelectSatellite}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
      />

      {/* Satellite detail drawer (right) */}
      <SatelliteDetail
        satellite={selectedSatellite}
        missionIntel={selectedSatellite ? intelBySatellite[selectedSatellite.id] : null}
        intelLoading={intelLoading}
        intelError={intelError}
        isOpen={!!selectedSatellite}
        onClose={() => setSelectedSatellite(null)}
      />

      {/* Orbit legend */}
      <OrbitLegend />

      {/* Time Scrubber */}
      <TimeScrubber
        timeOffset={timeOffset}
        setTimeOffset={setTimeOffset}
      />
    </motion.div>
  )
}

export default CommandCenter
