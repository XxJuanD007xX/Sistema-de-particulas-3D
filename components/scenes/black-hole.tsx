"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface BlackHoleProps {
  settings: SceneSettings
}

function ParticleBlackHole({ settings }: { settings: SceneSettings }) {
  const eventHorizonRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const count = 2000
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.8 + Math.random() * 0.4

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Borde del horizonte de eventos - púrpura oscuro a negro
      const edge = Math.random()
      col[i * 3] = 0.1 * edge
      col[i * 3 + 1] = 0
      col[i * 3 + 2] = 0.15 * edge
    }
    return [pos, col]
  }, [])

  useFrame((state) => {
    if (eventHorizonRef.current) {
      eventHorizonRef.current.rotation.y = state.clock.elapsedTime * 0.1 * settings.animationSpeed
    }
  })

  return (
    <group>
      {/* Centro negro */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Borde del horizonte de eventos */}
      <points ref={eventHorizonRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 2} vertexColors transparent opacity={0.8} sizeAttenuation />
      </points>

      {settings.showLabels && (
        <Html position={[0, 6, 0]} center>
          <div className="px-3 py-1 text-sm font-bold text-purple-400 bg-black/70 rounded-lg whitespace-nowrap backdrop-blur-sm">
            Agujero Negro
          </div>
        </Html>
      )}
    </group>
  )
}

function AccretionDisk({ settings }: { settings: SceneSettings }) {
  const diskRef = useRef<THREE.Points>(null)
  const particleCount = Math.floor(settings.particleCount * 0.4)

  const [positions, colors, originalPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    const origPos = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 4 + Math.pow(Math.random(), 0.5) * 18
      const height = (Math.random() - 0.5) * (2 / (radius * 0.15))

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      pos[i * 3] = x
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = z

      origPos[i * 3] = x
      origPos[i * 3 + 1] = height
      origPos[i * 3 + 2] = z

      // Gradiente de color: naranja caliente cerca, azul frío lejos
      const temp = 1 - (radius - 4) / 18
      if (temp > 0.7) {
        col[i * 3] = 1
        col[i * 3 + 1] = 0.6 + temp * 0.4
        col[i * 3 + 2] = 0.2
      } else if (temp > 0.4) {
        col[i * 3] = 1 - (0.7 - temp)
        col[i * 3 + 1] = 0.4
        col[i * 3 + 2] = 0.6
      } else {
        col[i * 3] = 0.3
        col[i * 3 + 1] = 0.4
        col[i * 3 + 2] = 1
      }
    }
    return [pos, col, origPos]
  }, [particleCount])

  useFrame((state) => {
    if (diskRef.current) {
      const time = state.clock.elapsedTime * settings.animationSpeed
      const gravity = settings.blackHoleGravity || 1
      const positions = diskRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const x = originalPositions[i * 3]
        const z = originalPositions[i * 3 + 2]
        const radius = Math.sqrt(x * x + z * z)
        const angle = Math.atan2(z, x)

        // Velocidad orbital más rápida cerca del centro
        const orbitalSpeed = (1 / Math.sqrt(radius)) * 0.5 * gravity
        const newAngle = angle + time * orbitalSpeed

        positions[i * 3] = Math.cos(newAngle) * radius
        positions[i * 3 + 2] = Math.sin(newAngle) * radius
      }

      diskRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group rotation={[Math.PI * 0.25, 0, 0]}>
      <points ref={diskRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 2.5} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>
    </group>
  )
}

function FallingStar({ settings }: { settings: SceneSettings }) {
  const starRef = useRef<THREE.Points>(null)
  const starGroupRef = useRef<THREE.Group>(null)
  const progress = useRef(0)

  const [positions, colors, originalPositions] = useMemo(() => {
    const count = 600
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const origPos = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 1.2

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      origPos[i * 3] = x
      origPos[i * 3 + 1] = y
      origPos[i * 3 + 2] = z

      col[i * 3] = 1
      col[i * 3 + 1] = 0.7 + Math.random() * 0.3
      col[i * 3 + 2] = 0.2
    }
    return [pos, col, origPos]
  }, [])

  useFrame((state) => {
    const gravity = settings.blackHoleGravity || 1
    progress.current += 0.001 * settings.animationSpeed * gravity
    if (progress.current > 1) progress.current = 0

    if (starGroupRef.current) {
      const t = progress.current
      const spiralRadius = 28 * (1 - t * 0.85)
      const angle = t * Math.PI * 10

      starGroupRef.current.position.x = Math.cos(angle) * spiralRadius
      starGroupRef.current.position.y = Math.sin(t * Math.PI) * 8 * (1 - t)
      starGroupRef.current.position.z = Math.sin(angle) * spiralRadius
    }

    if (starRef.current) {
      const positions = starRef.current.geometry.attributes.position.array as Float32Array
      const t = progress.current
      const stretch = 1 + t * 3

      for (let i = 0; i < originalPositions.length / 3; i++) {
        const directionToCenter = new THREE.Vector3(
          -starGroupRef.current!.position.x,
          -starGroupRef.current!.position.y,
          -starGroupRef.current!.position.z,
        ).normalize()

        positions[i * 3] = originalPositions[i * 3] + directionToCenter.x * originalPositions[i * 3] * stretch * t
        positions[i * 3 + 1] = originalPositions[i * 3 + 1] * (1 - t * 0.5)
        positions[i * 3 + 2] =
          originalPositions[i * 3 + 2] + directionToCenter.z * originalPositions[i * 3 + 2] * stretch * t
      }
      starRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={starGroupRef} position={[28, 0, 0]}>
      <points ref={starRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 4} vertexColors sizeAttenuation />
      </points>

      <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" distance={15} decay={2} />

      {settings.showLabels && (
        <Html position={[0, 2, 0]} center>
          <div className="px-2 py-1 text-xs text-orange-400 bg-black/70 rounded whitespace-nowrap backdrop-blur-sm">
            Estrella
          </div>
        </Html>
      )}
    </group>
  )
}

function RelativisticJets({ settings }: { settings: SceneSettings }) {
  const jetRef = useRef<THREE.Points>(null)
  const particleCount = Math.floor(settings.particleCount * 0.15)

  const [positions, colors, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    const vel = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random()
      const spread = t * 2
      const angle = Math.random() * Math.PI * 2
      const isTop = Math.random() > 0.5

      pos[i * 3] = Math.cos(angle) * spread * 0.3
      pos[i * 3 + 1] = (isTop ? 1 : -1) * (4 + t * 35)
      pos[i * 3 + 2] = Math.sin(angle) * spread * 0.3

      vel[i] = 0.2 + Math.random() * 0.3

      const brightness = 1 - t * 0.5
      col[i * 3] = 0.6 * brightness
      col[i * 3 + 1] = 0.4 * brightness
      col[i * 3 + 2] = 1 * brightness
    }
    return [pos, col, vel]
  }, [particleCount])

  useFrame(() => {
    if (jetRef.current) {
      const positions = jetRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const y = positions[i * 3 + 1]
        const direction = y > 0 ? 1 : -1

        positions[i * 3 + 1] += direction * velocities[i] * settings.animationSpeed

        if (Math.abs(positions[i * 3 + 1]) > 45) {
          positions[i * 3 + 1] = direction * 4
        }
      }

      jetRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={jetRef}>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
        <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={settings.particleSize * 2} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

export function BlackHole({ settings }: BlackHoleProps) {
  return (
    <group>
      <ambientLight intensity={0.02} />

      <ParticleBlackHole settings={settings} />
      <AccretionDisk settings={settings} />
      <FallingStar settings={settings} />
      <RelativisticJets settings={settings} />
    </group>
  )
}
