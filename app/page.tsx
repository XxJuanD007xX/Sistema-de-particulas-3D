"use client"

import { useState } from "react"
import { CosmicScene } from "@/components/cosmic-scene"
import { ControlPanel } from "@/components/control-panel"

export type SceneType = "solar-system" | "earth-moon" | "black-hole" | "galaxy-collision" | "orion-constellation" | "helix-nebula"

export interface SceneSettings {
  particleCount: number
  particleSize: number
  animationSpeed: number
  trailLength: number
  glowIntensity: number
  cameraDistance: number
  showOrbits: boolean
  showLabels: boolean
  // Configuraciones específicas por escena
  helixAmplitude?: number
  orbitInclination?: number
  blackHoleGravity?: number
  collisionSpeed?: number
  atmosphereOpacity?: number
  starDensity?: number
}

export const defaultSettings: Record<SceneType, SceneSettings> = {
  "solar-system": {
    particleCount: 8000,
    particleSize: 0.03,
    animationSpeed: 1,
    trailLength: 150,
    glowIntensity: 1,
    cameraDistance: 60,
    showOrbits: true,
    showLabels: true,
    helixAmplitude: 3,
    orbitInclination: 0.3,
  },
  "earth-moon": {
    particleCount: 6000,
    particleSize: 0.025,
    animationSpeed: 1,
    trailLength: 80,
    glowIntensity: 1.2,
    cameraDistance: 35,
    showOrbits: true,
    showLabels: true,
    atmosphereOpacity: 0.6,
    starDensity: 1,
  },
  "black-hole": {
    particleCount: 12000,
    particleSize: 0.02,
    animationSpeed: 1,
    trailLength: 200,
    glowIntensity: 1.5,
    cameraDistance: 50,
    showOrbits: false,
    showLabels: true,
    blackHoleGravity: 1,
  },
  "galaxy-collision": {
    particleCount: 15000,
    particleSize: 0.015,
    animationSpeed: 0.8,
    trailLength: 100,
    glowIntensity: 1,
    cameraDistance: 80,
    showOrbits: false,
    showLabels: true,
    collisionSpeed: 1,
  },
  "orion-constellation": {
    particleCount: 10000,
    particleSize: 0.03,
    animationSpeed: 1,
    trailLength: 0,
    glowIntensity: 1.2,
    cameraDistance: 40,
    showOrbits: true, // Used for showing constellation lines
    showLabels: true,
    starDensity: 0.8,
  },
  "helix-nebula": {
    particleCount: 20000,
    particleSize: 0.012,
    animationSpeed: 1,
    trailLength: 0,
    glowIntensity: 1.8,
    cameraDistance: 45,
    showOrbits: false,
    showLabels: true,
  }
}

export default function Home() {
  const [currentScene, setCurrentScene] = useState<SceneType>("solar-system")
  const [settings, setSettings] = useState<SceneSettings>(defaultSettings["solar-system"])
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const handleSceneChange = (scene: SceneType) => {
    setCurrentScene(scene)
    setSettings(defaultSettings[scene])
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <CosmicScene sceneType={currentScene} settings={settings} />

      <ControlPanel
        currentScene={currentScene}
        onSceneChange={handleSceneChange}
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <div className="absolute bottom-4 left-4 text-xs text-blue-300/60 font-mono bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
        <p>Arrastra para rotar | Rueda para zoom | Doble clic para centrar</p>
      </div>
    </main>
  )
}
