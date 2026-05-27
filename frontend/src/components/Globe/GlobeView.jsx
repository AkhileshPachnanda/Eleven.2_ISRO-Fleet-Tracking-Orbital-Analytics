import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

/* ── Cloud layer vertex shader ── */
const cloudVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

/* ── Cloud layer fragment shader ──
   Uses cloud texture luminance as alpha.
   Applies subtle additive blending on the sunlit side for atmospheric glow.
*/
const cloudFragmentShader = `
  uniform sampler2D cloudMap;
  uniform float opacity;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 cloudColor = texture2D(cloudMap, vUv);

    // Use luminance as alpha — white clouds opaque, dark sky transparent
    float luminance = dot(cloudColor.rgb, vec3(0.299, 0.587, 0.114));

    // Soft threshold: below 0.15 is fully transparent, above 0.5 is fully opaque
    float alpha = smoothstep(0.15, 0.55, luminance) * opacity;

    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`

// GlobeView renders the Earth sphere + cloud layer + atmosphere
function GlobeView() {
  const earthRef = useRef()
  const cloudRef = useRef()
  const atmosphereRef = useRef()

  // Load textures from public directory (Vite serves these as static files)
  const dayTexture = useLoader(TextureLoader, '/assets/textures/earth_daymap_8k.jpg')
  const bumpTexture = useLoader(TextureLoader, '/assets/textures/earth_bump_4k.jpg')
  const cloudTexture = useLoader(TextureLoader, '/assets/textures/earth_clouds_8k.jpg')

  // Cloud shader material — memoized to avoid re-creation
  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudMap: { value: cloudTexture },
        opacity: { value: 0.55 },
      },
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,      // Prevents z-fighting with earth surface
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
    })
  }, [cloudTexture])

  // Earth texture alignment correction
  // Standardized latLngToVector3 aligns 0 lng to -Z (U=0.5 on the texture).
  // No artificial rotation is needed.
  const earthRotation = [0, 0, 0]

  // Animate cloud drift — very slow independent rotation
  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.003 // ~0.17°/sec — subtle drift
    }
  })

  return (
    <group>
      {/* Earth sphere — day texture + bump map */}
      <mesh ref={earthRef} rotation={earthRotation}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={dayTexture}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Cloud layer — slightly larger sphere, drifts independently */}
      <mesh ref={cloudRef} rotation={earthRotation}>
        <sphereGeometry args={[1.005, 48, 48]} />
        <primitive object={cloudMaterial} attach="material" />
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
