import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import GlobeView from './GlobeView'
import SatelliteMarker from './SatelliteMarker'
import GroundTrack from './GroundTrack'
import { latLngToVector3 } from './SatelliteMarker'

/* ── Camera animator — smoothly moves camera to selected satellite ── */
function CameraAnimator({ selectedSatellite, controlsRef, onAnimationStateChange }) {
  const { camera } = useThree()
  const targetRef = useRef(null)
  const isAnimatingRef = useRef(false)
  const prevSelectedRef = useRef(null)

  useEffect(() => {
    if (selectedSatellite?.position) {
      const radius = 1 + selectedSatellite.position.alt / 6371
      const satPos = latLngToVector3(
        selectedSatellite.position.lat,
        selectedSatellite.position.lng,
        radius
      )

      // Position camera along the vector from center to satellite, pulled back
      const direction = satPos.clone().normalize()
      const cameraDistance = radius + 0.6
      targetRef.current = direction.multiplyScalar(cameraDistance)
      isAnimatingRef.current = true
      onAnimationStateChange(true) // Lock controls during animation
      prevSelectedRef.current = selectedSatellite.id
    } else if (!selectedSatellite && prevSelectedRef.current) {
      // Zoom back out when deselected
      targetRef.current = new THREE.Vector3(0, 0, 3.5)
      isAnimatingRef.current = true
      onAnimationStateChange(true) // Lock controls during animation
      prevSelectedRef.current = null
    }
  }, [selectedSatellite?.id, selectedSatellite?.position?.lat, selectedSatellite?.position?.lng])

  useFrame(() => {
    if (!isAnimatingRef.current || !targetRef.current) return

    camera.position.lerp(targetRef.current, 0.03)
    const distance = camera.position.distanceTo(targetRef.current)

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }

    if (distance < 0.01) {
      isAnimatingRef.current = false
      onAnimationStateChange(false) // Unlock controls after animation finishes
    }
  })

  return null
}

/* ── Real-time Sun ── */
function SunLight({ timeOffset = 0 }) {
  const sunRef = useRef()

  useFrame(() => {
    if (!sunRef.current) return
    const now = new Date(Date.now() + timeOffset)
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now - start
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hour = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600

    // Declination (latitude)
    const lat = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81))
    
    // Subsolar longitude
    let lng = (12 - hour) * 15
    if (lng > 180) lng -= 360
    if (lng < -180) lng += 360

    // Position sun far away
    const pos = latLngToVector3(lat, lng, 100)
    sunRef.current.position.copy(pos)
  })

  return <directionalLight ref={sunRef} intensity={2.2} color="#ffffff" />
}

function GlobeCanvas({ satellites = [], selectedSatellite, onSelectSatellite, timeOffset = 0 }) {
  const [isInteracting, setIsInteracting] = useState(false)
  const [isCameraAnimating, setIsCameraAnimating] = useState(false)
  const controlsRef = useRef()

  const handleAnimationStateChange = useCallback((animating) => {
    setIsCameraAnimating(animating)
    // Disable/enable orbit controls based on animation state
    if (controlsRef.current) {
      controlsRef.current.enabled = !animating
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 3.5],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: '#1a1a1e' }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
      >
        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <SunLight timeOffset={timeOffset} />

        {/* Subtle, premium stars — visible but not overpowering */}
        <Stars
          radius={100}
          depth={60}
          count={3000}
          factor={4}
          saturation={0.1}
          fade
        />

        {/* Globe + Satellites */}
        <Suspense fallback={null}>
          <GlobeView isInteracting={isInteracting} />

          {satellites
            .filter(sat => sat.position)
            .map(sat => (
              <SatelliteMarker
                key={sat.id}
                satellite={sat}
                isSelected={selectedSatellite?.id === sat.id}
                onClick={onSelectSatellite}
              />
            ))}

          {selectedSatellite && <GroundTrack satellite={selectedSatellite} timeOffset={timeOffset} />}
        </Suspense>

        {/* Camera animator for smooth zoom on selection */}
        <CameraAnimator
          selectedSatellite={selectedSatellite}
          controlsRef={controlsRef}
          onAnimationStateChange={handleAnimationStateChange}
        />

        {/* Controls — always enabled, only disabled during camera animation */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.5}
          maxDistance={50}
          rotateSpeed={0.3}
          zoomSpeed={0.8}
          autoRotate={false}
          autoRotateSpeed={0.15}
          enabled={!isCameraAnimating}
        />
      </Canvas>
    </div>
  )
}

export default GlobeCanvas
