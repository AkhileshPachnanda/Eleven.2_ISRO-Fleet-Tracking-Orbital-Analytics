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
  }, [satellite?.id])

  if (points.length < 2) return null

  const curve = new CatmullRomCurve3(points)
  const curvePoints = curve.getPoints(1000)
  const geometry = new BufferGeometry().setFromPoints(curvePoints)

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#4F46E5"
        transparent
        opacity={0.5}
      />
    </line>
  )
}

export default GroundTrack