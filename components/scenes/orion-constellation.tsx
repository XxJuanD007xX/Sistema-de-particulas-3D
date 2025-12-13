"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Line } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface OrionProps {
    settings: SceneSettings
}

// Datos de estrellas principales de Orión (Posiciones relativas aproximadas)
const ORION_STARS = [
    { name: "Betelgeuse", position: [-10, 15, 0], color: "#ff8c00", size: 4.5, label: "Betelgeuse (α Ori)" },
    { name: "Rigel", position: [8, -15, 2], color: "#aaaaff", size: 4.8, label: "Rigel (β Ori)" },
    { name: "Bellatrix", position: [12, 10, -5], color: "#ccccff", size: 3.5, label: "Bellatrix (γ Ori)" },
    { name: "Saiph", position: [-8, -14, -2], color: "#aaaaff", size: 3.8, label: "Saiph (κ Ori)" },
    // Cinturón
    { name: "Alnitak", position: [-5, 0, 5], color: "#ccccff", size: 4.0, label: "Alnitak (ζ Ori)" },
    { name: "Alnilam", position: [0, 1, 0], color: "#ccccff", size: 4.2, label: "Alnilam (ε Ori)" },
    { name: "Mintaka", position: [5, 2, -5], color: "#ccccff", size: 3.8, label: "Mintaka (δ Ori)" },
    // Cabeza
    { name: "Meissa", position: [2, 18, -2], color: "#ccccff", size: 3.2, label: "Meissa (λ Ori)" },
    // Arco (Escudo) - Completado con más estrellas (Pi1 a Pi6)
    { name: "Pi1", position: [16, 14, 5], color: "#ccccff", size: 2.0, label: "" },
    { name: "Pi2", position: [19, 10, 5], color: "#ccccff", size: 2.2, label: "" },
    { name: "Pi3", position: [20, 5, 5], color: "#ccccff", size: 2.5, label: "Tabit (π3 Ori)" },
    { name: "Pi4", position: [19, 0, 5], color: "#ccccff", size: 2.2, label: "" },
    { name: "Pi5", position: [17, -5, 5], color: "#ccccff", size: 2.1, label: "" },
    { name: "Pi6", position: [14, -9, 5], color: "#ccccff", size: 2.0, label: "" },
    // Brazo en alto (Club)
    { name: "Mu", position: [-16, 22, -2], color: "#ffccaa", size: 2.2, label: "" },
    { name: "Nu", position: [-14, 20, -2], color: "#ccccff", size: 2.2, label: "" },
    { name: "Xi", position: [-12, 25, -2], color: "#ccccff", size: 2.2, label: "" },
    { name: "Chi1", position: [-13, 27, -2], color: "#ccccff", size: 2.1, label: "" },
]

// Conexiones para dibujar la constelación
const CONSTELLATION_LINES = [
    ["Betelgeuse", "Alnitak"],
    ["Bellatrix", "Mintaka"],
    ["Alnitak", "Alnilam"],
    ["Alnilam", "Mintaka"],
    ["Alnitak", "Saiph"],
    ["Mintaka", "Rigel"],
    ["Betelgeuse", "Bellatrix"], // Hombros
    ["Saiph", "Rigel"], // Pies
    // Cabeza
    ["Betelgeuse", "Meissa"],
    ["Bellatrix", "Meissa"],
    // Arco (Escudo) completo
    ["Bellatrix", "Pi3"], // Conexión central al arco
    ["Pi1", "Pi2"],
    ["Pi2", "Pi3"],
    ["Pi3", "Pi4"],
    ["Pi4", "Pi5"],
    ["Pi5", "Pi6"],
    // Brazo
    ["Betelgeuse", "Nu"],
    ["Nu", "Mu"],
    ["Nu", "Xi"],
    ["Xi", "Chi1"]
]

function Star({ position, color, size, label, settings, showLabel }: any) {
    const pointsRef = useRef<THREE.Points>(null)

    // Convertimos la estrella en un sistema de partículas (un solo punto grande o un grupo)
    // Para que parezca "partícula", usaremos Points con un material suave
    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(3)
        const col = new Float32Array(3)
        // Posición local 0,0,0 porque el grupo ya tiene la posición
        pos[0] = 0; pos[1] = 0; pos[2] = 0

        const c = new THREE.Color(color)
        col[0] = c.r; col[1] = c.g; col[2] = c.b

        return [pos, col]
    }, [color])

    useFrame((state) => {
        if (pointsRef.current) {
            const time = state.clock.elapsedTime
            // Parpadeo cambiando el tamaño/opacidad
            const flicker = 1 + Math.sin(time * 8 + position[0]) * 0.1
            pointsRef.current.scale.setScalar(flicker)
        }
    })

    return (
        <group position={position}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                    <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
                </bufferGeometry>
                <pointsMaterial
                    size={size * settings.particleSize * 40} // Tamaño ajustado para Points
                    vertexColors
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    map={getSoftParticleTexture()} // Función auxiliar para textura suave
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Glow secundario (halo) como otro sistema de partículas más grande y tenue */}
            <points>
                <bufferGeometry>
                    <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                    <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
                </bufferGeometry>
                <pointsMaterial
                    size={size * settings.particleSize * 100}
                    vertexColors
                    transparent
                    opacity={0.3 * settings.glowIntensity}
                    sizeAttenuation
                    map={getSoftParticleTexture()}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {showLabel && label && (
                <Html position={[0, size * settings.particleSize * 30 + 1, 0]} center>
                    <div className="px-2 py-1 text-xs text-blue-200 bg-black/60 rounded border border-blue-500/30 whitespace-nowrap backdrop-blur-sm">
                        {label}
                    </div>
                </Html>
            )}
        </group>
    )
}

// Textura procedural para partículas suaves
let particleTexture: THREE.Texture | null = null
function getSoftParticleTexture() {
    if (particleTexture) return particleTexture

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 32, 32)
    }
    particleTexture = new THREE.CanvasTexture(canvas)
    return particleTexture
}

function OrionNebula({ settings }: { settings: SceneSettings }) {
    const nebulaRef = useRef<THREE.Points>(null)

    const [positions, colors] = useMemo(() => {
        const count = 3000
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            // Nebulosa debajo del cinturón (M42)
            const r = Math.random() * 3
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            // Posición base cerca de la espada de Orión (debajo de Alnitak)
            const x = -3 + r * Math.sin(phi) * Math.cos(theta)
            const y = -5 + r * Math.sin(phi) * Math.sin(theta) * 1.5 // Elongated vertically
            const z = 3 + r * Math.cos(phi)

            pos[i * 3] = x
            pos[i * 3 + 1] = y
            pos[i * 3 + 2] = z

            // Colores típicos de M42 (Rojo/Rosa/Violeta)
            const t = Math.random()
            if (t > 0.6) {
                col[i * 3] = 1 // R
                col[i * 3 + 1] = 0.4 // G
                col[i * 3 + 2] = 0.6 // B 
            } else {
                col[i * 3] = 0.6 // R
                col[i * 3 + 1] = 0.2 // G
                col[i * 3 + 2] = 0.8 // B
            }
        }
        return [pos, col]
    }, [])

    useFrame((state) => {
        if (nebulaRef.current) {
            nebulaRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
        }
    })

    return (
        <points ref={nebulaRef}>
            <bufferGeometry>
                <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
            </bufferGeometry>
            <pointsMaterial size={settings.particleSize * 3} vertexColors transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
        </points>
    )
}

function ConstellationLines({ settings }: { settings: SceneSettings }) {
    if (!settings.showOrbits) return null // Usamos showOrbits como toggle para las líneas aquí

    const lines = useMemo(() => {
        return CONSTELLATION_LINES.map(([startName, endName]) => {
            const startStar = ORION_STARS.find(s => s.name === startName)
            const endStar = ORION_STARS.find(s => s.name === endName)

            if (!startStar || !endStar) return null

            return (
                <Line
                    key={`${startName}-${endName}`}
                    points={[startStar.position as [number, number, number], endStar.position as [number, number, number]]}
                    color="rgba(100, 150, 255, 0.3)"
                    lineWidth={1}
                    dashed={false}
                />
            )
        })
    }, [])

    return <group>{lines}</group>
}

export function OrionConstellation({ settings }: OrionProps) {
    return (
        <group>
            <ambientLight intensity={0.1} />

            {/* Estrellas Principales - Ahora son partículas */}
            {ORION_STARS.map((star) => (
                <Star
                    key={star.name}
                    {...star}
                    settings={settings}
                    showLabel={settings.showLabels}
                />
            ))}

            {/* Líneas de Constelación */}
            <ConstellationLines settings={settings} />

            {/* Nebulosa de Orión */}
            <OrionNebula settings={settings} />

            {settings.showLabels && (
                <Html position={[-3, -8, 3]} center>
                    <div className="px-2 py-0.5 text-[10px] text-pink-300 bg-black/50 rounded-full whitespace-nowrap">
                        M42 (Nebulosa)
                    </div>
                </Html>
            )}
        </group>
    )
}
