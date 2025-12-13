"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface GalaxyCollisionProps {
  settings: SceneSettings
}

interface GalaxyProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color1: string
  color2: string
  name: string
  settings: SceneSettings
  direction: number
}

function ParticleGalaxy({ position, rotation, color1, color2, name, settings, direction }: GalaxyProps) {
  const galaxyRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Points>(null)
  const armsRef = useRef<THREE.Points>(null)
  const particleCount = Math.floor(settings.particleCount * 0.3)

  const [corePositions, coreColors, armPositions, armColors, originalArmPositions] = useMemo(() => {
    const coreCount = Math.floor(particleCount * 0.2)
    const armCount = particleCount - coreCount

    const corePos = new Float32Array(coreCount * 3)
    const coreCol = new Float32Array(coreCount * 3)
    const armPos = new Float32Array(armCount * 3)
    const armCol = new Float32Array(armCount * 3)
    const origArmPos = new Float32Array(armCount * 3)

    const baseColor1 = new THREE.Color(color1)
    const baseColor2 = new THREE.Color(color2)

    // Núcleo brillante
    for (let i = 0; i < coreCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.pow(Math.random(), 2) * 3

      corePos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      corePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3
      corePos[i * 3 + 2] = r * Math.cos(phi)

      const brightness = 1 - r / 3
      coreCol[i * 3] = baseColor1.r * brightness + 0.3
      coreCol[i * 3 + 1] = baseColor1.g * brightness + 0.2
      coreCol[i * 3 + 2] = baseColor1.b * brightness
    }

    // Brazos espirales
    for (let i = 0; i < armCount; i++) {
      const arm = Math.floor(Math.random() * 4)
      const armAngle = (arm / 4) * Math.PI * 2
      const distance = 3 + Math.pow(Math.random(), 0.6) * 18
      const spiralAngle = armAngle + distance * 0.4
      const scatter = (Math.random() - 0.5) * (distance * 0.25)
      const height = (Math.random() - 0.5) * (1.5 / (distance * 0.1 + 1))

      const x = Math.cos(spiralAngle) * distance + scatter
      const z = Math.sin(spiralAngle) * distance + scatter

      armPos[i * 3] = x
      armPos[i * 3 + 1] = height
      armPos[i * 3 + 2] = z

      origArmPos[i * 3] = x
      origArmPos[i * 3 + 1] = height
      origArmPos[i * 3 + 2] = z

      const t = distance / 21
      const mixedColor = new THREE.Color().lerpColors(baseColor1, baseColor2, t)
      const brightness = 0.6 + Math.random() * 0.4
      armCol[i * 3] = mixedColor.r * brightness
      armCol[i * 3 + 1] = mixedColor.g * brightness
      armCol[i * 3 + 2] = mixedColor.b * brightness
    }

    return [corePos, coreCol, armPos, armCol, origArmPos]
  }, [particleCount, color1, color2])

  useFrame((state) => {
    const time = state.clock.elapsedTime * (settings.collisionSpeed || 1) * 0.08
    const collision = Math.min(time * 0.4, 1)

    if (galaxyRef.current) {
      galaxyRef.current.position.x = position[0] * (1 - collision * 0.75)
      galaxyRef.current.position.z = position[2] + Math.sin(time * 0.5) * 3 * direction
      galaxyRef.current.rotation.y += (0.001 + collision * 0.003) * settings.animationSpeed * direction
    }

    // Deformación por marea
    if (armsRef.current && collision > 0.2) {
      const positions = armsRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < originalArmPositions.length / 3; i++) {
        const x = originalArmPositions[i * 3]
        const z = originalArmPositions[i * 3 + 2]
        const dist = Math.sqrt(x * x + z * z)

        const pull = collision * 0.015 * (x * direction > 0 ? 1.5 : 0.5) * (dist / 20)
        positions[i * 3] = originalArmPositions[i * 3] + pull * direction * 10
      }

      armsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={galaxyRef} position={position} rotation={rotation}>
      {/* Núcleo */}
      <points ref={coreRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(corePositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(coreColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 4} vertexColors transparent opacity={1} sizeAttenuation />
      </points>

      {/* Brazos espirales */}
      <points ref={armsRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(armPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(armColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={settings.particleSize * 2.5} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>

      {settings.showLabels && (
        <Html position={[0, 10, 0]} center>
          <div
            className="px-3 py-1 text-sm font-bold bg-black/70 rounded-lg whitespace-nowrap backdrop-blur-sm"
            style={{ color: color1 }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function CollisionDebris({ settings }: { settings: SceneSettings }) {
  const debrisRef = useRef<THREE.Points>(null)
  const debrisCount = Math.floor(settings.particleCount * 0.15)

  const [positions, colors, velocities] = useMemo(() => {
    const pos = new Float32Array(debrisCount * 3)
    const col = new Float32Array(debrisCount * 3)
    const vel = new Float32Array(debrisCount * 3)

    for (let i = 0; i < debrisCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15

      vel[i * 3] = (Math.random() - 0.5) * 0.08
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.08
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.08

      col[i * 3] = 1
      col[i * 3 + 1] = 0.6 + Math.random() * 0.3
      col[i * 3 + 2] = 0.3
    }
    return [pos, col, vel]
  }, [debrisCount])

  useFrame(() => {
    if (debrisRef.current) {
      const pos = debrisRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < debrisCount; i++) {
        pos[i * 3] += velocities[i * 3] * settings.animationSpeed
        pos[i * 3 + 1] += velocities[i * 3 + 1] * settings.animationSpeed
        pos[i * 3 + 2] += velocities[i * 3 + 2] * settings.animationSpeed

        const dist = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2)
        if (dist > 50) {
          pos[i * 3] = (Math.random() - 0.5) * 15
          pos[i * 3 + 1] = (Math.random() - 0.5) * 8
          pos[i * 3 + 2] = (Math.random() - 0.5) * 15
        }
      }

      debrisRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={debrisRef}>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
        <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={settings.particleSize * 2} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

function StarFormation({ settings }: { settings: SceneSettings }) {
  const regionsRef = useRef<THREE.Points>(null)
  const count = 500

  const [positions, colors, originalBrightness] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const bright = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25

      bright[i] = Math.random()

      col[i * 3] = 1
      col[i * 3 + 1] = 0.4 + Math.random() * 0.3
      col[i * 3 + 2] = 0.6 + Math.random() * 0.4
    }
    return [pos, col, bright]
  }, [])

  useFrame((state) => {
    if (regionsRef.current) {
      const colors = regionsRef.current.geometry.attributes.color.array as Float32Array
      const time = state.clock.elapsedTime * settings.animationSpeed

      for (let i = 0; i < count; i++) {
        const pulse = 0.5 + Math.sin(time * 3 + originalBrightness[i] * 10) * 0.5
        const intensity = pulse * settings.glowIntensity

        colors[i * 3] = intensity
        colors[i * 3 + 1] = 0.3 * intensity + 0.2
        colors[i * 3 + 2] = 0.8 * intensity
      }

      regionsRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <points ref={regionsRef}>
      <bufferGeometry>
        <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
        <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
      </bufferGeometry>
      <pointsMaterial size={settings.particleSize * 3} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export function GalaxyCollision({ settings }: GalaxyCollisionProps) {
  return (
    <group>
      <ambientLight intensity={0.08} />

      <ParticleGalaxy
        position={[-28, 0, 0]}
        rotation={[0.3, 0, 0.2]}
        color1="#fffacd"
        color2="#4a9eff"
        name="Vía Láctea"
        settings={settings}
        direction={1}
      />

      <ParticleGalaxy
        position={[28, 5, 12]}
        rotation={[-0.2, 0, -0.3]}
        color1="#ffd700"
        color2="#ff6b6b"
        name="Andrómeda"
        settings={settings}
        direction={-1}
      />

      <CollisionDebris settings={settings} />
      <StarFormation settings={settings} />
    </group>
  )
}
