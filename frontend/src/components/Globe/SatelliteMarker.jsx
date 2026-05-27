import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'

// Converts lat/lng/altitude to 3D cartesian coordinates
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Orbit type colors (muted)
const ORBIT_DOT_COLORS = {
  LEO: '#6B93D6',
  GEO: '#D4915E',
  SSO: '#6BBF8A',
}

function SatelliteMarker({ satellite, isSelected, onClick }) {
  const dotRef = useRef()
  const ringRef = useRef()
  const modelRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const { camera } = useThree()

  const isISS = satellite.id === 'iss' || satellite.noradId === 25544
  
  // Load the appropriate 3D model
  const { scene } = useGLTF(isISS ? '/assets/ISS_stationary.glb' : '/assets/satellite.glb')
  const modelScene = useMemo(() => (isSelected ? scene.clone() : null), [scene, isSelected])

  const position = satellite.position
  if (!position) return null

  const radius = 1 + position.alt / 6371
  const pos = latLngToVector3(position.lat, position.lng, radius)

  const dotColor = satellite.isSpecial 
    ? '#FFD700' 
    : (isSelected ? '#4F46E5' : ORBIT_DOT_COLORS[satellite.orbitType] || '#A0A0A0')

  // Calculate distance from camera to determine detail level
  const cameraDistRef = useRef(10)

  useFrame((state, delta) => {
    // Distance from camera to this marker
    cameraDistRef.current = camera.position.distanceTo(pos)

    // Pulsing animation for dots
    if (dotRef.current && !isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + satellite.id.length) * 0.15
      dotRef.current.scale.setScalar(pulse)
    }

    // Selection ring spin
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z += delta * 0.5
    }

    // Rotate 3D model when close and selected
    if (modelRef.current && isSelected) {
      modelRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation()
        onClick(satellite)
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* 3D Model — shown when selected and zoomed in */}
      {isSelected && (
        <primitive
          ref={modelRef}
          object={modelScene}
          scale={isISS ? [0.001, 0.001, 0.001] : [0.01, 0.01, 0.01]} // Significantly scale down ISS
          rotation={isISS ? [0, 0, 0] : [-30, 5, 0]}
        />
      )}

      {/* Dot marker — always visible, primary at overview zoom */}
      {!isSelected && (
        <mesh ref={dotRef}>
          <sphereGeometry args={[satellite.isSpecial ? 0.02 : 0.012, 16, 16]} />
          <meshBasicMaterial
            color={dotColor}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Glow around dot */}
      {!isSelected && (
        <mesh>
          <sphereGeometry args={[satellite.isSpecial ? 0.035 : 0.02, 16, 16]} />
          <meshBasicMaterial
            color={dotColor}
            transparent
            opacity={satellite.isSpecial ? (isHovered ? 0.5 : 0.3) : (isHovered ? 0.3 : 0.12)}
          />
        </mesh>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.034, 32]} />
          <meshBasicMaterial
            color="#4F46E5"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Invisible hit area — larger click target */}
      <mesh visible={false}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* Hover tooltip */}
      {(isHovered || isSelected || (satellite.isSpecial && cameraDistRef.current < 4)) && (
        <Html
          center={false}
          position={[0.03, 0.03, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: isSelected ? '12px' : '11px',
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? '#4F46E5' : 'rgba(255, 255, 255, 0.8)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            padding: '3px 8px',
            borderRadius: '6px',
            background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'rgba(26, 26, 30, 0.75)',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${isSelected ? 'rgba(79, 70, 229, 0.2)' : (satellite.isSpecial ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.06)')}`,
          }}>
            {satellite.isSpecial ? '⭐ ' : ''}{satellite.name}
          </div>
        </Html>
      )}
    </group>
  )
}

export { latLngToVector3 }
export default SatelliteMarker

// Preload models for performance
useGLTF.preload('/assets/satellite.glb')
useGLTF.preload('/assets/ISS_stationary.glb')
