import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

// GlobeView renders just the Earth sphere + atmosphere
function GlobeView({ isInteracting }) {
  const earthRef = useRef()
  const atmosphereRef = useRef()

  const dayTexture = useLoader(TextureLoader, 'src/assets/8k_earth_daymap.jpg')

  // Earth texture alignment correction
  // We use a standardized latLngToVector3 that natively aligns 0 lng to -Z (U=0.5 on the texture).
  // No artificial rotation is needed.
  const earthRotation = [0, 0, 0]

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef} rotation={earthRotation}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={dayTexture}
        />
      </mesh>

      {/* Atmospheric glow — subtle, non-sci-fi */}
      <mesh ref={atmosphereRef} rotation={earthRotation}>
        <sphereGeometry args={[1.03, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color(0x4F6DB5)}
          transparent
          opacity={0.04}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh>
        <sphereGeometry args={[1.08, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color(0x4F46E5)}
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default GlobeView
