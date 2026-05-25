import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import GlobeView from './GlobeView'
import SatelliteMarker from './SatelliteMarker'
import GroundTrack from './GroundTrack'
import { latLngToVector3 } from './SatelliteMarker'

/* ── Camera animator — smoothly moves camera to selected satellite ── */
function CameraAnimator({ selectedSatellite, controlsRef }) {
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

      // Position camera along the vector from center to satellite, but pulled back
      const direction = satPos.clone().normalize()
      const cameraDistance = radius + 0.6
      targetRef.current = direction.multiplyScalar(cameraDistance)
      isAnimatingRef.current = true
      prevSelectedRef.current = selectedSatellite.id
    } else if (!selectedSatellite && prevSelectedRef.current) {
      // Zoom back out when deselected
      targetRef.current = new THREE.Vector3(0, 0, 3.5)
      isAnimatingRef.current = true
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
    }
  })

  return null
}

function GlobeCanvas({ satellites = [], selectedSatellite, onSelectSatellite }) {
  const [isInteracting, setIsInteracting] = useState(false)
  const controlsRef = useRef()

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
        <directionalLight position={[5, 3, 5]} intensity={2.2} color="#ffffff" />

        {/* Subtle stars — premium feel */}
        <Stars
          radius={200}
          depth={80}
          count={1500}
          factor={3}
          saturation={0}
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

          {selectedSatellite && <GroundTrack satellite={selectedSatellite} />}
        </Suspense>

        {/* Camera animator for smooth zoom on selection */}
        <CameraAnimator
          selectedSatellite={selectedSatellite}
          controlsRef={controlsRef}
        />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.5}
          maxDistance={50}
          rotateSpeed={0.3}
          zoomSpeed={0.8}
          autoRotate={!isInteracting && !selectedSatellite}
          autoRotateSpeed={0.15}
        />
      </Canvas>
    </div>
  )
}

export default GlobeCanvas
