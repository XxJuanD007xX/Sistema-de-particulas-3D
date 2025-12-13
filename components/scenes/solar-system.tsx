"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface SolarSystemProps {
  settings: SceneSettings
}

interface PlanetData {
  name: string
  particleCount: number
  distance: number
  color: string
  emissive: string
  speed: number
  size: number
  hasRings?: boolean
}

const planets: PlanetData[] = [
  { name: "Mercurio", particleCount: 200, distance: 6, color: "#b5b5b5", emissive: "#666666", speed: 4.15, size: 0.4 },
  { name: "Venus", particleCount: 300, distance: 9, color: "#e6c87a", emissive: "#8b7355", speed: 1.62, size: 0.6 },
  { name: "Tierra", particleCount: 400, distance: 12, color: "#4a9eff", emissive: "#1a4a7a", speed: 1, size: 0.65 },
  { name: "Marte", particleCount: 280, distance: 16, color: "#cd5c5c", emissive: "#8b3a3a", speed: 0.53, size: 0.5 },
  { name: "Júpiter", particleCount: 800, distance: 24, color: "#d4a574", emissive: "#8b6914", speed: 0.084, size: 1.8 },
  {
    name: "Saturno",
    particleCount: 700,
    distance: 32,
    color: "#f4d59e",
    emissive: "#8b7355",
    speed: 0.034,
    size: 1.5,
    hasRings: true,
  },
  { name: "Urano", particleCount: 500, distance: 40, color: "#b5e3e3", emissive: "#4a7a7a", speed: 0.012, size: 1.0 },
  {
    name: "Neptuno",
    particleCount: 500,
    distance: 48,
    color: "#4169e1",
    emissive: "#1a1a8b",
    speed: 0.006,
    size: 0.95,
  },
]

function ParticleSun({ settings }: { settings: SceneSettings }) {
  const particlesRef = useRef<THREE.Points>(null)
  const coronaRef = useRef<THREE.Points>(null)

  const [corePositions, coreColors, coronaPositions, coronaColors] = useMemo(() => {
    const coreCount = 3000
    const coronaCount = 2000

    const corePos = new Float32Array(coreCount * 3)
    const coreCol = new Float32Array(coreCount * 3)
    const coronaPos = new Float32Array(coronaCount * 3)
    const coronaCol = new Float32Array(coronaCount * 3)

    // Núcleo del sol
    for (let i = 0; i < coreCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 2.5

      corePos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      corePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      corePos[i * 3 + 2] = r * Math.cos(phi)

      const heat = 1 - r / 2.5
      coreCol[i * 3] = 1
      coreCol[i * 3 + 1] = 0.6 + heat * 0.4
      coreCol[i * 3 + 2] = heat * 0.3
    }

    // Corona solar
    for (let i = 0; i < coronaCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 2

      coronaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      coronaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      coronaPos[i * 3 + 2] = r * Math.cos(phi)

      const dist = (r - 2.5) / 2
      coronaCol[i * 3] = 1
      coronaCol[i * 3 + 1] = 0.8 - dist * 0.3
      coronaCol[i * 3 + 2] = 0.2 - dist * 0.2
    }

    return [corePos, coreCol, coronaPos, coronaCol]
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime * settings.animationSpeed

    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.1
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < positions.length / 3; i++) {
        const originalR = Math.sqrt(
          corePositions[i * 3] ** 2 + corePositions[i * 3 + 1] ** 2 + corePositions[i * 3 + 2] ** 2,
        )
        const pulse = 1 + Math.sin(time * 3 + originalR) * 0.05 * settings.glowIntensity

        positions[i * 3] = corePositions[i * 3] * pulse
        positions[i * 3 + 1] = corePositions[i * 3 + 1] * pulse
        positions[i * 3 + 2] = corePositions[i * 3 + 2] * pulse
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.y = -time * 0.05
    }
  })

  return (
    <group>
      {/* Núcleo */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(new Float32Array(corePositions), 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(coreColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 4} vertexColors transparent opacity={1} sizeAttenuation />
      </points>

      {/* Corona */}
      <points ref={coronaRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(coronaPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(coronaColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 3} vertexColors transparent opacity={0.6} sizeAttenuation />
      </points>

      <pointLight position={[0, 0, 0]} intensity={3} color="#ffa500" distance={150} decay={2} />

      {settings.showLabels && (
        <Html position={[0, 5, 0]} center>
          <div className="px-2 py-1 text-xs font-bold text-yellow-400 bg-black/70 rounded whitespace-nowrap backdrop-blur-sm">
            Sol
          </div>
        </Html>
      )}
    </group>
  )
}

function ParticlePlanet({ planet, settings, index }: { planet: PlanetData; settings: SceneSettings; index: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const trailRef = useRef<THREE.Points>(null)
  const orbitAngle = useRef(index * ((Math.PI * 2) / planets.length))
  const trailPositions = useRef<Float32Array>(new Float32Array(settings.trailLength * 3))

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(planet.particleCount * 3)
    const col = new Float32Array(planet.particleCount * 3)
    const baseColor = new THREE.Color(planet.color)

    for (let i = 0; i < planet.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * planet.size

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const variation = 0.8 + Math.random() * 0.4
      col[i * 3] = baseColor.r * variation
      col[i * 3 + 1] = baseColor.g * variation
      col[i * 3 + 2] = baseColor.b * variation
    }
    return [pos, col]
  }, [planet])

  // Partículas del anillo si aplica
  const ringParticles = useMemo(() => {
    if (!planet.hasRings) return null
    const count = 800
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = planet.size * 1.5 + Math.random() * planet.size * 1.2

      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      pos[i * 3 + 2] = Math.sin(angle) * r

      col[i * 3] = 0.8 + Math.random() * 0.2
      col[i * 3 + 1] = 0.7 + Math.random() * 0.2
      col[i * 3 + 2] = 0.5 + Math.random() * 0.2
    }
    return { positions: pos, colors: col, count }
  }, [planet])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const helixAmplitude = settings.helixAmplitude || 3

    if (groupRef.current) {
      orbitAngle.current += planet.speed * 0.008 * settings.animationSpeed

      const x = Math.cos(orbitAngle.current) * planet.distance
      const z = Math.sin(orbitAngle.current) * planet.distance
      // Movimiento helicoidal
      const y = Math.sin(time * settings.animationSpeed * 0.5 + index) * helixAmplitude

      groupRef.current.position.set(x, y, z)

      // Actualizar estela
      if (trailRef.current) {
        const positions = trailPositions.current
        // Desplazar posiciones
        for (let i = positions.length - 3; i >= 3; i -= 3) {
          positions[i] = positions[i - 3]
          positions[i + 1] = positions[i - 2]
          positions[i + 2] = positions[i - 1]
        }
        positions[0] = x
        positions[1] = y
        positions[2] = z

        trailRef.current.geometry.attributes.position.needsUpdate = true
      }
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01 * settings.animationSpeed
    }
  })

  return (
    <group>
      <group ref={groupRef}>
        {/* Partículas del planeta */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
            <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
          </bufferGeometry>
          <pointsMaterial size={settings.particleSize * 2} vertexColors transparent opacity={0.95} sizeAttenuation />
        </points>

        {/* Anillos */}
        {ringParticles && (
          <points rotation={[Math.PI / 4, 0, 0]}>
            <bufferGeometry>
              <primitive object={new THREE.BufferAttribute(ringParticles.positions, 3)} attach="attributes-position" />
              <primitive object={new THREE.BufferAttribute(ringParticles.colors, 3)} attach="attributes-color" />
            </bufferGeometry>
            <pointsMaterial size={settings.particleSize * 1.5} vertexColors transparent opacity={0.8} sizeAttenuation />
          </points>
        )}

        {settings.showLabels && (
          <Html position={[0, planet.size + 1.5, 0]} center>
            <div className="px-2 py-1 text-xs text-white bg-black/70 rounded whitespace-nowrap backdrop-blur-sm">
              {planet.name}
            </div>
          </Html>
        )}
      </group>

      {/* Estela del planeta */}
      <points ref={trailRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(trailPositions.current, 3)} attach="attributes-position" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize} color="#4a9eff" transparent opacity={0.4} sizeAttenuation />
      </points>
    </group>
  )
}

function ParticleOrbit({ distance, settings }: { distance: number; settings: SceneSettings }) {
  const positions = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * distance
      pos[i * 3 + 1] = 0
      pos[i * 3 + 2] = Math.sin(angle) * distance
    }
    return pos
  }, [distance])

  return (
    <points>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#4a9eff" transparent opacity={0.2} sizeAttenuation={false} />
    </points>
  )
}

function AsteroidBelt({ settings }: { settings: SceneSettings }) {
  const asteroidRef = useRef<THREE.Points>(null)
  const asteroidCount = Math.floor(settings.particleCount * 0.2)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(asteroidCount * 3)
    const col = new Float32Array(asteroidCount * 3)

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 18 + Math.random() * 4
      const height = (Math.random() - 0.5) * 1.5

      pos[i * 3] = Math.cos(angle) * distance
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * distance

      const brightness = 0.5 + Math.random() * 0.5
      col[i * 3] = brightness
      col[i * 3 + 1] = brightness * 0.9
      col[i * 3 + 2] = brightness * 0.7
    }

    return [pos, col]
  }, [asteroidCount])

  useFrame(() => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.y += 0.0003 * settings.animationSpeed
    }
  })

  return (
    <points ref={asteroidRef}>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
        <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={settings.particleSize * 1.5} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

export function SolarSystem({ settings }: SolarSystemProps) {
  return (
    <group rotation={[settings.orbitInclination || 0.3, 0, 0]}>
      <ParticleSun settings={settings} />

      {settings.showOrbits &&
        planets.map((planet) => (
          <ParticleOrbit key={`orbit-${planet.name}`} distance={planet.distance} settings={settings} />
        ))}

      {planets.map((planet, index) => (
        <ParticlePlanet key={planet.name} planet={planet} settings={settings} index={index} />
      ))}

      <AsteroidBelt settings={settings} />
    </group>
  )
}
