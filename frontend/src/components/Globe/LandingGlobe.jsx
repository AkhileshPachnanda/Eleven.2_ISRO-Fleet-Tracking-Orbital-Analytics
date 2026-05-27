import { useRef, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import { TextureLoader } from 'three'
import * as THREE from 'three'

/* ── Lightweight cloud fragment shader (same as GlobeView but simpler) ── */
const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const cloudFragmentShader = `
  uniform sampler2D cloudMap;
  uniform float opacity;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(cloudMap, vUv);
    float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = smoothstep(0.15, 0.55, lum) * opacity;
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`

function Earth() {
  const meshRef = useRef()
  const cloudRef = useRef()

  // 2K textures — lightweight, local, no network dependency
  const earthTexture = useLoader(TextureLoader, '/assets/textures/earth_daymap_2k.jpg')
  const bumpTexture = useLoader(TextureLoader, '/assets/textures/earth_bump_2k.jpg')
  const cloudTexture = useLoader(TextureLoader, '/assets/textures/earth_clouds_2k.jpg')

  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        cloudMap: { value: cloudTexture },
        opacity: { value: 0.4 }, // Slightly more subtle on landing
      },
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  }, [cloudTexture])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.045 // Slightly faster than earth for drift effect
    }
  })

  return (
    <group>
      {/* Earth — 32 segments (landing bg, doesn't need 64) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.025}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Cloud layer — even lower poly for landing */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.005, 24, 24]} />
        <primitive object={cloudMaterial} attach="material" />
      </mesh>
    </group>
  )
}

function LandingGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      style={{ background: 'transparent' }}
      dpr={[1, 1.5]}  // Cap pixel ratio for performance
      gl={{ powerPreference: 'high-performance', antialias: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />

      {/* Subtle, premium stars */}
      <Stars
        radius={200}
        depth={80}
        count={1200}
        factor={2.5}
        saturation={0}
        fade
      />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  )
}

export default LandingGlobe