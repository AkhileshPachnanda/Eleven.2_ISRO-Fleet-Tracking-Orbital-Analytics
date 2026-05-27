import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar/TopBar'
import GlobeCanvas from '../components/Globe/GlobeCanvas'
import SatelliteDrawer from '../components/SatelliteDrawer/SatelliteDrawer'
import SatelliteDetail from '../components/SatelliteDetail/SatelliteDetail'
import OrbitLegend from '../components/UI/OrbitLegend'
import TimeScrubber from '../components/UI/TimeScrubber'
import { useSatellites } from '../hooks/useSatellites'
import { fetchMissionIntel } from '../lib/api'
import { useMediaQuery } from '../hooks/useMediaQuery'

function CommandCenter() {
  const [selectedSatelliteId, setSelectedSatelliteId] = useState(null)
  const [isListOpen, setIsListOpen] = useState(false)
  const [intelBySatellite, setIntelBySatellite] = useState({})
  const [intelLoading, setIntelLoading] = useState(false)
  const [intelError, setIntelError] = useState(null)
  const [timeOffset, setTimeOffset] = useState(0)
  const intelCacheRef = useRef({})
  const { satellites, loading, error } = useSatellites(timeOffset)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedSatellite = useMemo(
    () => satellites.find((sat) => sat.id === selectedSatelliteId) || null,
    [satellites, selectedSatelliteId]
  )
  const simulatedTime = useMemo(() => new Date(now + timeOffset), [now, timeOffset])
  const isLive = Math.abs(timeOffset) < 1000

  useEffect(() => {
    const controller = new AbortController()

    async function loadIntel() {
      if (!selectedSatellite) {
        setIntelLoading(false)
        setIntelError(null)
        return
      }

      const cacheKey = selectedSatellite.id
      const cachedIntel = intelCacheRef.current[cacheKey]
      if (cachedIntel) {
        setIntelLoading(false)
        setIntelError(null)
        return
      }

      setIntelLoading(true)
      setIntelError(null)

      try {
        const intel = await fetchMissionIntel(selectedSatellite, { signal: controller.signal })
        intelCacheRef.current = {
          ...intelCacheRef.current,
          [cacheKey]: intel
        }
        setIntelBySatellite((prev) => ({
          ...prev,
          [cacheKey]: intel
        }))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIntelError(err.message || 'Failed to load mission summary')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIntelLoading(false)
        }
      }
    }

    loadIntel()

    return () => {
      controller.abort()
    }
  }, [selectedSatellite?.id])

  const handleSelectSatellite = useCallback((sat) => {
    setSelectedSatelliteId((previousId) => (previousId === sat.id ? null : sat.id))
    // On mobile, close the list when selecting a satellite
    if (isMobile) {
      setIsListOpen(false)
    }
  }, [isMobile])

  const handleToggleList = useCallback(() => {
    setIsListOpen((previous) => {
      const nextOpen = !previous
      // On mobile, close the detail panel when opening the list
      if (isMobile && nextOpen) {
        setSelectedSatelliteId(null)
      }
      return nextOpen
    })
  }, [isMobile])

  const handleCloseList = useCallback(() => {
    setIsListOpen(false)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedSatelliteId(null)
  }, [])

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
      {/* Loading overlay — covers everything until satellites are ready */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 100,
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            <div className="three-dot-loader">
              <span />
              <span />
              <span />
            </div>
            <p style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.02em',
            }}>
              Acquiring satellite telemetry…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <TopBar
        satelliteCount={satellites.length}
        onToggleList={handleToggleList}
        isListOpen={isListOpen}
        simulatedTime={simulatedTime}
        isLive={isLive}
      />

      {/* Globe — fullscreen behind everything, preloads while loader is visible */}
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
        onClose={handleCloseList}
      />

      {/* Satellite detail drawer (right) */}
      <SatelliteDetail
        satellite={selectedSatellite}
        missionIntel={selectedSatellite ? intelBySatellite[selectedSatellite.id] : null}
        intelLoading={intelLoading}
        intelError={intelError}
        isOpen={!!selectedSatellite}
        onClose={handleCloseDetails}
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
