import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchAllTLEs } from '../lib/celestrak'
import { getCurrentPosition } from '../lib/propogator'

const POSITION_UPDATE_INTERVAL_MS = 250
const TLE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000
const POSITION_BATCH_SIZE = 6

function hasPositionChanged(previous, next) {
  if (!previous && !next) return false
  if (!previous || !next) return true

  return (
    Math.abs(previous.lat - next.lat) > 0.0005 ||
    Math.abs(previous.lng - next.lng) > 0.0005 ||
    Math.abs(previous.alt - next.alt) > 0.02 ||
    Math.abs(previous.velocity - next.velocity) > 0.0005
  )
}

function stripPosition(satellite) {
  const { position, ...rest } = satellite
  return rest
}

export function useSatellites(timeOffset = 0) {
  const [satellites, setSatellites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const satellitesRef = useRef([])
  const timeOffsetRef = useRef(timeOffset)
  const positionIntervalRef = useRef(null)
  const refreshIntervalRef = useRef(null)
  const computeRunIdRef = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    timeOffsetRef.current = timeOffset
  }, [timeOffset])

  const computePositions = useCallback(async (satsWithTLE) => {
    const runId = ++computeRunIdRef.current
    const simulatedTime = new Date(Date.now() + timeOffsetRef.current)
    const previousSatellites = satellitesRef.current
    const nextSatellites = new Array(satsWithTLE.length)

    for (let i = 0; i < satsWithTLE.length; i += POSITION_BATCH_SIZE) {
      if (!isMountedRef.current || runId !== computeRunIdRef.current) {
        return
      }

      const end = Math.min(i + POSITION_BATCH_SIZE, satsWithTLE.length)
      for (let index = i; index < end; index += 1) {
        const sat = satsWithTLE[index]
        const previous = previousSatellites[index]
        const position = sat.tle ? getCurrentPosition(sat.tle, simulatedTime) || null : null

        if (previous?.id === sat.id && !hasPositionChanged(previous.position, position)) {
          nextSatellites[index] = previous
          continue
        }

        const baseSatellite = previous?.id === sat.id ? previous : stripPosition(sat)
        nextSatellites[index] = {
          ...baseSatellite,
          position,
        }
      }

      if (end < satsWithTLE.length) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    if (!isMountedRef.current || runId !== computeRunIdRef.current) {
      return
    }

    satellitesRef.current = nextSatellites
    const hasChanges =
      nextSatellites.length !== previousSatellites.length ||
      nextSatellites.some((sat, index) => sat !== previousSatellites[index])

    if (hasChanges) {
      setSatellites(nextSatellites)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    const runInitialLoad = async () => {
      try {
        setLoading(true)
        setError(null)

        const satsWithTLE = await fetchAllTLEs()
        if (!isMountedRef.current) return
        satellitesRef.current = satsWithTLE
        await computePositions(satsWithTLE)
        if (!isMountedRef.current) return
        setLoading(false)

      } catch (err) {
        if (!isMountedRef.current) return
        setError(err.message)
        setLoading(false)
      }
    }

    runInitialLoad()

    positionIntervalRef.current = setInterval(() => {
      if (satellitesRef.current.length > 0) {
        computePositions(satellitesRef.current)
      }
    }, POSITION_UPDATE_INTERVAL_MS)

    refreshIntervalRef.current = setInterval(async () => {
      try {
        const satsWithTLE = await fetchAllTLEs()
        if (!isMountedRef.current) return
        satellitesRef.current = satsWithTLE
        await computePositions(satsWithTLE)
      } catch {
        // keep existing TLE data
      }
    }, TLE_REFRESH_INTERVAL_MS)

    return () => {
      isMountedRef.current = false
      computeRunIdRef.current += 1

      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [computePositions])

  useEffect(() => {
    if (satellitesRef.current.length > 0) {
      computePositions(satellitesRef.current)
    }
  }, [timeOffset, computePositions])

  return { satellites, loading, error }
}
