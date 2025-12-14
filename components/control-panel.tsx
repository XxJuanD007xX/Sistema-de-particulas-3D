"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Sun, Globe2, Circle, Sparkles, Settings2, RotateCcw } from "lucide-react"
import type { SceneType, SceneSettings } from "@/app/page"
import { defaultSettings } from "@/app/page"

interface ControlPanelProps {
  currentScene: SceneType
  onSceneChange: (scene: SceneType) => void
  settings: SceneSettings
  onSettingsChange: (settings: SceneSettings) => void
  isOpen: boolean
  onToggle: () => void
}

const scenes: { id: SceneType; name: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "solar-system",
    name: "Sistema Solar",
    icon: <Sun className="w-5 h-5" />,
    description: "El Sol y los 8 planetas con órbitas helicoidales y el cinturón de asteroides",
  },
  {
    id: "earth-moon",
    name: "Tierra y Luna",
    icon: <Globe2 className="w-5 h-5" />,
    description: "La Tierra con continentes, océanos, atmósfera y la Luna orbitando",
  },
  {
    id: "black-hole",
    name: "Agujero Negro",
    icon: <Circle className="w-5 h-5 fill-current" />,
    description: "Una estrella siendo absorbida por un agujero negro supermasivo",
  },
  {
    id: "galaxy-collision",
    name: "Colisión Galáctica",
    icon: <Sparkles className="w-5 h-5" />,
    description: "La Vía Láctea y Andrómeda colisionando con formación estelar",
  },
  {
    id: "orion-constellation",
    name: "Constelación de Orión",
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    description: "Las estrellas principales de Orión y la Nebulosa M42",
  },
  {
    id: "helix-nebula",
    name: "Nebulosa de la Hélice",
    icon: <Circle className="w-5 h-5 text-red-400" />,
    description: "La Nebulosa del Ojo de Dios con su enana blanca central",
  },
  {
    id: "halley-comet",
    name: "Cometa Halley",
    icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
    description: "El famoso cometa periódico con su cola de iones y polvo",
  },
]

export function ControlPanel({
  currentScene,
  onSceneChange,
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
}: ControlPanelProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3 // 3 escenas por página para no saturar

  const totalPages = Math.ceil(scenes.length / itemsPerPage)

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const currentScenes = scenes.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const updateSetting = <K extends keyof SceneSettings>(key: K, value: SceneSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const resetSettings = () => {
    onSettingsChange(defaultSettings[currentScene])
  }

  const renderSceneSpecificControls = () => {
    switch (currentScene) {
      case "orion-constellation":
        return (
          <Card className="bg-blue-950/30 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300">Constelación de Orión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <Label className="text-xs text-blue-200">Mostrar Líneas</Label>
                <Switch
                  checked={settings.showOrbits} // Reusamos showOrbits para las líneas
                  onCheckedChange={(checked) => updateSetting("showOrbits", checked)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-blue-200">Densidad Estelar Fondo</Label>
                  <span className="text-xs text-blue-400">{settings.starDensity?.toFixed(1) || 1}x</span>
                </div>
                <Slider
                  value={[settings.starDensity || 0.8]}
                  onValueChange={([value]) => updateSetting("starDensity", value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )
      case "helix-nebula":
        return (
          <Card className="bg-red-950/30 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Nebulosa de la Hélice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-red-200">Intensidad del Brillo</Label>
                  <span className="text-xs text-red-400">{settings.glowIntensity.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.glowIntensity]}
                  onValueChange={([value]) => updateSetting("glowIntensity", value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )
      case "solar-system":
        return (
          <Card className="bg-blue-950/30 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300">Sistema Solar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-blue-200">Amplitud Helicoidal</Label>
                  <span className="text-xs text-blue-400">{settings.helixAmplitude?.toFixed(1) || 3}</span>
                </div>
                <Slider
                  value={[settings.helixAmplitude || 3]}
                  onValueChange={([value]) => updateSetting("helixAmplitude", value)}
                  min={0}
                  max={8}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-blue-200">Inclinación Orbital</Label>
                  <span className="text-xs text-blue-400">
                    {((settings.orbitInclination || 0.3) * 57.3).toFixed(0)}°
                  </span>
                </div>
                <Slider
                  value={[settings.orbitInclination || 0.3]}
                  onValueChange={([value]) => updateSetting("orbitInclination", value)}
                  min={0}
                  max={0.8}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-blue-200">Longitud de Estela</Label>
                  <span className="text-xs text-blue-400">{settings.trailLength}</span>
                </div>
                <Slider
                  value={[settings.trailLength]}
                  onValueChange={([value]) => updateSetting("trailLength", value)}
                  min={20}
                  max={300}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "earth-moon":
        return (
          <Card className="bg-cyan-950/30 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-cyan-300">Tierra y Luna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-cyan-200">Opacidad Atmósfera</Label>
                  <span className="text-xs text-cyan-400">
                    {((settings.atmosphereOpacity || 0.6) * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[settings.atmosphereOpacity || 0.6]}
                  onValueChange={([value]) => updateSetting("atmosphereOpacity", value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-cyan-200">Densidad de Estrellas</Label>
                  <span className="text-xs text-cyan-400">{settings.starDensity?.toFixed(1) || 1}x</span>
                </div>
                <Slider
                  value={[settings.starDensity || 1]}
                  onValueChange={([value]) => updateSetting("starDensity", value)}
                  min={0.3}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "black-hole":
        return (
          <Card className="bg-purple-950/30 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Agujero Negro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-purple-200">Intensidad Gravitacional</Label>
                  <span className="text-xs text-purple-400">{settings.blackHoleGravity?.toFixed(1) || 1}x</span>
                </div>
                <Slider
                  value={[settings.blackHoleGravity || 1]}
                  onValueChange={([value]) => updateSetting("blackHoleGravity", value)}
                  min={0.3}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "galaxy-collision":
        return (
          <Card className="bg-amber-950/30 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-300">Colisión Galáctica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-amber-200">Velocidad de Colisión</Label>
                  <span className="text-xs text-amber-400">{settings.collisionSpeed?.toFixed(1) || 1}x</span>
                </div>
                <Slider
                  value={[settings.collisionSpeed || 1]}
                  onValueChange={([value]) => updateSetting("collisionSpeed", value)}
                  min={0.2}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )

      case "halley-comet":
        return (
          <Card className="bg-cyan-950/30 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-cyan-300">Cometa Halley</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-cyan-200">Longitud de Cola</Label>
                  <span className="text-xs text-cyan-400">{settings.cometTailLength}</span>
                </div>
                <Slider
                  value={[settings.cometTailLength || 50]}
                  onValueChange={([value]) => updateSetting("cometTailLength", value)}
                  min={20}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-cyan-200">Velocidad</Label>
                  <span className="text-xs text-cyan-400">{settings.cometSpeed?.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[settings.cometSpeed || 1]}
                  onValueChange={([value]) => updateSetting("cometSpeed", value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-cyan-200">Composición Química</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Ice", "Dust", "Carbon", "Sodium"] as const).map((comp) => (
                    <Button
                      key={comp}
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs ${settings.cometComposition === comp
                          ? "bg-cyan-600 text-white border-cyan-500"
                          : "bg-cyan-950/50 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900"
                        }`}
                      onClick={() => updateSetting("cometComposition", comp)}
                    >
                      {comp === "Ice" && "Hielo (Azul)"}
                      {comp === "Dust" && "Polvo (Amarillo)"}
                      {comp === "Carbon" && "Carbono (Rojo)"}
                      {comp === "Sodium" && "Sodio (Naranja)"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Slider
                  value={[settings.cometSize || 1]}
                  onValueChange={([value]) => updateSetting("cometSize", value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-md border-white/10 hover:bg-black/70 hover:border-white/20"
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
      </Button>

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-white/10">
            <Settings2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Panel de Control</h2>
          </div>

          {/* Scene Selection with Pagination */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Seleccionar Escena</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handlePrevPage}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </Button>
                <div className="text-[10px] text-gray-500 font-mono flex items-center">{currentPage + 1}/{totalPages}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleNextPage}
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {currentScenes.map((scene) => (
                <Button
                  key={scene.id}
                  variant={currentScene === scene.id ? "default" : "outline"}
                  className={`h-auto py-3 px-3 flex flex-col items-center gap-2 transition-all ${currentScene === scene.id
                    ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  onClick={() => onSceneChange(scene.id)}
                >
                  {scene.icon}
                  <span className="text-xs text-center leading-tight">{scene.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Scene Description */}
          <div className="px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-200">{scenes.find((s) => s.id === currentScene)?.description}</p>
          </div>

          {/* Scene Specific Controls */}
          {renderSceneSpecificControls()}

          {/* Particle Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">Partículas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-gray-400">Cantidad</Label>
                  <span className="text-xs text-gray-300">{settings.particleCount.toLocaleString()}</span>
                </div>
                <Slider
                  value={[settings.particleCount]}
                  onValueChange={([value]) => updateSetting("particleCount", value)}
                  min={2000}
                  max={20000}
                  step={500}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-gray-400">Tamaño</Label>
                  <span className="text-xs text-gray-300">{settings.particleSize.toFixed(3)}</span>
                </div>
                <Slider
                  value={[settings.particleSize]}
                  onValueChange={([value]) => updateSetting("particleSize", value)}
                  min={0.005}
                  max={0.08}
                  step={0.005}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Animation Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">Animación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-gray-400">Velocidad</Label>
                  <span className="text-xs text-gray-300">{settings.animationSpeed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[settings.animationSpeed]}
                  onValueChange={([value]) => updateSetting("animationSpeed", value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">Visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-gray-400">Intensidad del Brillo</Label>
                  <span className="text-xs text-gray-300">{settings.glowIntensity.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.glowIntensity]}
                  onValueChange={([value]) => updateSetting("glowIntensity", value)}
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-gray-400">Distancia de Cámara</Label>
                  <span className="text-xs text-gray-300">{settings.cameraDistance}</span>
                </div>
                <Slider
                  value={[settings.cameraDistance]}
                  onValueChange={([value]) => updateSetting("cameraDistance", value)}
                  min={15}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label className="text-xs text-gray-400">Mostrar Órbitas</Label>
                <Switch
                  checked={settings.showOrbits}
                  onCheckedChange={(checked) => updateSetting("showOrbits", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label className="text-xs text-gray-400">Mostrar Etiquetas</Label>
                <Switch
                  checked={settings.showLabels}
                  onCheckedChange={(checked) => updateSetting("showLabels", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            onClick={resetSettings}
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer Ajustes
          </Button>

          {/* Credits */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-center text-gray-500">
              Sistema de Partículas Cósmicas 3D
              <br />
              <span className="text-blue-400">Three.js + React Three Fiber</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
