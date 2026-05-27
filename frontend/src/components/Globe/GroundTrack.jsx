import { useMemo } from 'react'
import { CatmullRomCurve3, BufferGeometry } from 'three'
import { latLngToVector3 } from './SatelliteMarker'
import { getGroundTrack } from '../../lib/propogator'

function GroundTrack({ satellite, timeOffset = 0 }) {
  const points = useMemo(() => {
    if (!satellite?.tle) return []

    const baseTime = new Date(Date.now() + timeOffset)
    const track = getGroundTrack(satellite.tle, 350, 1, baseTime)
    if (track.length < 2) return []

    return track.map(([lat, lng, alt]) =>
      latLngToVector3(lat, lng, 1 + (alt || 0.05))
    )
  }, [satellite?.tle, timeOffset])

  const geometry = useMemo(() => {
    if (points.length < 2) return null

    const curve = new CatmullRomCurve3(points)
    const curvePoints = curve.getPoints(360)
    return new BufferGeometry().setFromPoints(curvePoints)
  }, [points])

  if (!geometry) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.5}
      />
    </line>
  )
}

export default GroundTrack
