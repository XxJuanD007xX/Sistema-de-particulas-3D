"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Preload } from "@react-three/drei"
import { Suspense, useMemo, useRef } from "react"
import { SolarSystem } from "./scenes/solar-system"
import { EarthMoon } from "./scenes/earth-moon"
import { BlackHole } from "./scenes/black-hole"
import { GalaxyCollision } from "./scenes/galaxy-collision"
import { OrionConstellation } from "./scenes/orion-constellation"
import { HelixNebula } from "./scenes/helix-nebula"
import { HalleyComet } from "./scenes/halley-comet"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import type { SceneType, SceneSettings } from "@/app/page"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface CosmicSceneProps {
  sceneType: SceneType
  settings: SceneSettings
}

function SpaceBackground({ density = 1 }: { density?: number }) {
  const starsRef = useRef<THREE.Points>(null)
  const nebulaRef = useRef<THREE.Points>(null)

  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = Math.floor(12000 * density)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // ... (Generated content same as before)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 200 + Math.random() * 400

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const temp = Math.random()
      if (temp > 0.95) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1;
        sizes[i] = 0.8 + Math.random() * 1.5
      } else if (temp > 0.85) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.7;
        sizes[i] = 0.5 + Math.random() * 1
      } else if (temp > 0.75) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.5;
        sizes[i] = 0.6 + Math.random() * 1.2
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
        sizes[i] = 0.2 + Math.random() * 0.5
      }
    }
    return [positions, colors, sizes]
  }, [density])

  const [nebulaPositions, nebulaColors] = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 150 + Math.random() * 200

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const hue = Math.random()
      if (hue > 0.7) {
        colors[i * 3] = 0.3; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.5;
      } else if (hue > 0.4) {
        colors[i * 3] = 0.1; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.4;
      } else {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.05; colors[i * 3 + 2] = 0.3;
      }
    }
    return [positions, colors]
  }, [])

  useFrame(() => {
    if (starsRef.current) starsRef.current.rotation.y += 0.00005
  })

  return (
    <group>
      <points ref={nebulaRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(nebulaPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(nebulaColors, 3)} attach="attributes-color" />
        </bufferGeometry>
        <pointsMaterial size={4} vertexColors transparent opacity={0.15} sizeAttenuation={false} />
      </points>
      <points ref={starsRef}>
        <bufferGeometry>
          <primitive object={new THREE.BufferAttribute(starPositions, 3)} attach="attributes-position" />
          <primitive object={new THREE.BufferAttribute(starColors, 3)} attach="attributes-color" />
          <primitive object={new THREE.BufferAttribute(starSizes, 1)} attach="attributes-size" />
        </bufferGeometry>
        <pointsMaterial size={1.5} vertexColors transparent opacity={0.95} sizeAttenuation={false} />
      </points>
    </group>
  )
}

function SceneLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#4a9eff" wireframe />
    </mesh>
  )
}

export function CosmicScene({ sceneType, settings }: CosmicSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 30, settings.cameraDistance], fov: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="w-full h-full"
    >
      <color attach="background" args={["#000008"]} />
      <fog attach="fog" args={["#000008", 100, 500]} />
      <ambientLight intensity={0.05} />

      <SpaceBackground density={settings.starDensity || 1} />

      <Suspense fallback={<SceneLoader />}>
        {sceneType === "solar-system" && <SolarSystem settings={settings} />}
        {sceneType === "earth-moon" && <EarthMoon settings={settings} />}
        {sceneType === "black-hole" && <BlackHole settings={settings} />}
        {sceneType === "galaxy-collision" && <GalaxyCollision settings={settings} />}
        {sceneType === "orion-constellation" && <OrionConstellation settings={settings} />}
        {sceneType === "helix-nebula" && <HelixNebula settings={settings} />}

        {/* ADDED KEY HERE FOR FORCED REMOUNT */}
        {sceneType === "halley-comet" && (
          <HalleyComet key={settings.cometComposition} settings={settings} />
        )}

      </Suspense>

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={settings.glowIntensity * 0.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={250}
        autoRotate
        autoRotateSpeed={0.15}
        dampingFactor={0.05}
        enableDamping
      />
      <Preload all />
    </Canvas>
  )
}
