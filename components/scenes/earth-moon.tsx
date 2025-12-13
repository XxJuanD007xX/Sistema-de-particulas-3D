"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface EarthMoonProps {
  settings: SceneSettings
}

function ParticleEarth({ settings }: { settings: SceneSettings }) {
  const earthRef = useRef<THREE.Points>(null)
  const atmosphereRef = useRef<THREE.Points>(null)
  const cloudsRef = useRef<THREE.Points>(null)

  const [oceanPositions, oceanColors, landPositions, landColors, atmospherePositions, cloudPositions] = useMemo(() => {
    const oceanCount = 3000
    const landCount = 2000
    const atmosphereCount = 1500
    const cloudCount = 800

    const oceanPos = new Float32Array(oceanCount * 3)
    const oceanCol = new Float32Array(oceanCount * 3)
    const landPos = new Float32Array(landCount * 3)
    const landCol = new Float32Array(landCount * 3)
    const atmoPos = new Float32Array(atmosphereCount * 3)
    const cloudPos = new Float32Array(cloudCount * 3)

    // Océanos
    for (let i = 0; i < oceanCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5

      oceanPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      oceanPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      oceanPos[i * 3 + 2] = r * Math.cos(phi)

      const depth = 0.5 + Math.random() * 0.5
      oceanCol[i * 3] = 0.1 * depth
      oceanCol[i * 3 + 1] = 0.3 * depth
      oceanCol[i * 3 + 2] = 0.8 * depth
    }

    // Continentes (distribuidos según coordenadas aproximadas)
    for (let i = 0; i < landCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const lat = (phi / Math.PI - 0.5) * 180
      const lon = (theta / (Math.PI * 2) - 0.5) * 360

      // Simular distribución de continentes
      let isLand = false
      // América del Norte
      if (lon > -170 && lon < -50 && lat > 15 && lat < 70) isLand = Math.random() > 0.4
      // América del Sur
      if (lon > -80 && lon < -35 && lat > -55 && lat < 15) isLand = Math.random() > 0.5
      // Europa/África
      if (lon > -20 && lon < 60 && lat > -35 && lat < 70) isLand = Math.random() > 0.45
      // Asia
      if (lon > 60 && lon < 150 && lat > 0 && lat < 75) isLand = Math.random() > 0.35
      // Australia
      if (lon > 110 && lon < 155 && lat > -45 && lat < -10) isLand = Math.random() > 0.5

      if (!isLand) {
        landPos[i * 3] = 0
        landPos[i * 3 + 1] = 0
        landPos[i * 3 + 2] = 0
        continue
      }

      const r = 5.02
      landPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      landPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      landPos[i * 3 + 2] = r * Math.cos(phi)

      // Variación de color terrestre
      const terrain = Math.random()
      if (terrain > 0.7) {
        // Desierto
        landCol[i * 3] = 0.85
        landCol[i * 3 + 1] = 0.75
        landCol[i * 3 + 2] = 0.5
      } else if (terrain > 0.3) {
        // Bosque
        landCol[i * 3] = 0.15 + Math.random() * 0.1
        landCol[i * 3 + 1] = 0.4 + Math.random() * 0.2
        landCol[i * 3 + 2] = 0.15
      } else {
        // Montaña
        landCol[i * 3] = 0.4
        landCol[i * 3 + 1] = 0.35
        landCol[i * 3 + 2] = 0.3
      }
    }

    // Atmósfera
    for (let i = 0; i < atmosphereCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5.5 + Math.random() * 0.5

      atmoPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      atmoPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      atmoPos[i * 3 + 2] = r * Math.cos(phi)
    }

    // Nubes
    for (let i = 0; i < cloudCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5.15 + Math.random() * 0.1

      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      cloudPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      cloudPos[i * 3 + 2] = r * Math.cos(phi)
    }

    return [oceanPos, oceanCol, landPos, landCol, atmoPos, cloudPos]
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime * settings.animationSpeed

    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.1
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.12
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * 0.05
    }
  })

  return (
    <group>
      {/* Océanos */}
      <points ref={earthRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(oceanPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(oceanColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 3} vertexColors sizeAttenuation />
      </points>

      {/* Continentes */}
      <points rotation={[0, 0, 0.41]}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(landPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(landColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 4} vertexColors sizeAttenuation />
      </points>

      {/* Nubes */}
      <points ref={cloudsRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(cloudPositions, 3)} attach="attributes-position" />
        </bufferGeometry>
        <pointsMaterial
          size={settings.particleSize * 3}
          color="#ffffff"
          transparent
          opacity={settings.atmosphereOpacity || 0.5}
          sizeAttenuation
        />
      </points>

      {/* Atmósfera */}
      <points ref={atmosphereRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(atmospherePositions, 3)} attach="attributes-position" />
        </bufferGeometry>
        <pointsMaterial
          size={settings.particleSize * 2}
          color="#4a9eff"
          transparent
          opacity={(settings.atmosphereOpacity || 0.5) * 0.3}
          sizeAttenuation
        />
      </points>

      {settings.showLabels && (
        <Html position={[0, 7, 0]} center>
          <div className="px-3 py-1 text-sm font-bold text-blue-400 bg-black/70 rounded-lg whitespace-nowrap backdrop-blur-sm">
            Tierra
          </div>
        </Html>
      )}
    </group>
  )
}

function ParticleMoon({ settings }: { settings: SceneSettings }) {
  const moonRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const orbitAngle = useRef(0)

  const [positions, colors] = useMemo(() => {
    const count = 1500
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 1.5

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Simular cráteres con variación de color
      const crater = Math.random()
      if (crater > 0.85) {
        col[i * 3] = 0.4
        col[i * 3 + 1] = 0.4
        col[i * 3 + 2] = 0.45
      } else {
        const brightness = 0.65 + Math.random() * 0.2
        col[i * 3] = brightness
        col[i * 3 + 1] = brightness
        col[i * 3 + 2] = brightness * 1.05
      }
    }
    return [pos, col]
  }, [])

  useFrame(() => {
    if (moonRef.current) {
      orbitAngle.current += 0.003 * settings.animationSpeed
      moonRef.current.position.x = Math.cos(orbitAngle.current) * 12
      moonRef.current.position.z = Math.sin(orbitAngle.current) * 12
      moonRef.current.position.y = Math.sin(orbitAngle.current * 0.5) * 1.5
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001 * settings.animationSpeed
    }
  })

  return (
    <group ref={moonRef} position={[12, 0, 0]}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 3} vertexColors sizeAttenuation />
      </points>

      {settings.showLabels && (
        <Html position={[0, 2.5, 0]} center>
          <div className="px-3 py-1 text-sm font-bold text-gray-300 bg-black/70 rounded-lg whitespace-nowrap backdrop-blur-sm">
            Luna
          </div>
        </Html>
      )}
    </group>
  )
}

function MoonOrbit({ settings }: { settings: SceneSettings }) {
  const positions = useMemo(() => {
    const count = 150
    const pos = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * 12
      pos[i * 3 + 1] = Math.sin(angle * 0.5) * 1.5
      pos[i * 3 + 2] = Math.sin(angle) * 12
    }
    return pos
  }, [])

  if (!settings.showOrbits) return null

  return (
    <points>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.8} color="#4a9eff" transparent opacity={0.3} sizeAttenuation={false} />
    </points>
  )
}

export function EarthMoon({ settings }: EarthMoonProps) {
  return (
    <group>
      <ambientLight intensity={0.15} />
      <directionalLight position={[50, 30, 20]} intensity={1.2} color="#ffffff" />

      <ParticleEarth settings={settings} />
      <ParticleMoon settings={settings} />
      <MoonOrbit settings={settings} />
    </group>
  )
}
