import * as satellite from 'satellite.js'

export function getCurrentPosition(tle, time = new Date()) {
  try {
    const [line1, line2] = tle
    const satrec = satellite.twoline2satrec(line1, line2)

    const positionAndVelocity = satellite.propagate(satrec, time)

    // satellite.js returns null OR an object with false position
    // when TLE is invalid or satellite has decayed
    if (!positionAndVelocity || !positionAndVelocity.position) return null

    const positionEci = positionAndVelocity.position
    const velocityEci = positionAndVelocity.velocity

    if (!positionEci || typeof positionEci === 'boolean') return null

    const gmst = satellite.gstime(time)
    const geodetic = satellite.eciToGeodetic(positionEci, gmst)

    const velocity = Math.sqrt(
      velocityEci.x ** 2 +
      velocityEci.y ** 2 +
      velocityEci.z ** 2
    )

    return {
      lat: satellite.degreesLat(geodetic.latitude),
      lng: satellite.degreesLong(geodetic.longitude),
      alt: geodetic.height,
      velocity
    }
  } catch (err) {
    // Never let a single bad TLE crash the whole app
    return null
  }
}

export function getGroundTrack(tle, minutesAhead = 90, stepMinutes = 1, baseTime = new Date()) {
  try {
    const [line1, line2] = tle
    const satrec = satellite.twoline2satrec(line1, line2)
    const points = []

    for (let i = 0; i <= minutesAhead; i += stepMinutes) {
      const time = new Date(baseTime.getTime() + i * 60 * 1000)
      const pv = satellite.propagate(satrec, time)

      if (!pv || !pv.position || typeof pv.position === 'boolean') continue

      const gmst = satellite.gstime(time)
      const geo = satellite.eciToGeodetic(pv.position, gmst)

      points.push([
        satellite.degreesLat(geo.latitude),
        satellite.degreesLong(geo.longitude),
        geo.height / 6378
      ])
    }

    return points
  } catch (err) {
    return []
  }
}