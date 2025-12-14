"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import type { SceneSettings } from "@/app/page"

interface HelixNebulaProps {
    settings: SceneSettings
}

function HelixStructure({ settings }: { settings: SceneSettings }) {
    const pointsRef = useRef<THREE.Points>(null)

    const [positions, colors] = useMemo(() => {
        const count = settings.particleCount * 1.5
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            // Modelo "Ojo de Dios" con irregularidades orgánicas

            // Ángulo base
            let angle = Math.random() * Math.PI * 2

            // Introduce irregularidad en el radio interior para que no sea un círculo perfecto
            // "Ruido" radial basado en el ángulo
            const innerNoise = Math.sin(angle * 5) * 2.0 + Math.cos(angle * 12) * 1.5 + Math.sin(angle * 30) * 0.5
            const minRadius = 10 + innerNoise // Radio base mínimo variable

            // Generación de radio con probabilidad sesgada hacia el exterior
            const rRandom = Math.pow(Math.random(), 0.6)
            let radius = minRadius + rRandom * 30 // Extensión de la nebulosa

            // Filamentos: agrupar partículas en ciertos ángulos
            const filamentNoise = Math.sin(angle * 8) + Math.cos(angle * 20)
            if (filamentNoise > 1.0) {
                // Zonas más densas
                radius += (Math.random() - 0.5) * 2
            }

            const squashFactor = 0.7 // Achatamiento vertical

            // Perturbación de posición (turbulencia)
            const turbulenceX = (Math.random() - 0.5) * 1.5
            const turbulenceY = (Math.random() - 0.5) * 1.5

            const x = Math.cos(angle) * radius + turbulenceX
            const y = Math.sin(angle) * radius * squashFactor + turbulenceY

            // Profundidad compleja: disco alabeado
            // Zonas externas se curvan un poco
            let z = (Math.random() - 0.5) * 8 * (1 - (radius / 50))
            z += Math.sin(angle * 2 + radius * 0.1) * 3 // Alabeo suave

            pos[i * 3] = x
            pos[i * 3 + 1] = y
            pos[i * 3 + 2] = z

            // Gradiente de color basado en distancia REAL al centro (incluyendo distorsiones)
            // Calculamos radio normalizado para colorear
            const distRatio = (radius - minRadius) / 30

            if (distRatio < 0.2) {
                // Núcleo interno (Azul brillante / Turquesa)
                col[i * 3] = 0.2 + Math.random() * 0.2
                col[i * 3 + 1] = 0.6 + Math.random() * 0.4
                col[i * 3 + 2] = 0.8 + Math.random() * 0.2
            } else if (distRatio < 0.6) {
                // Zona media (Naranja vibrante / Oro)
                col[i * 3] = 1.0
                col[i * 3 + 1] = 0.4 + Math.random() * 0.4
                col[i * 3 + 2] = 0.1
            } else {
                // Borde exterior (Rojo profundo / Rosa)
                col[i * 3] = 0.8 + Math.random() * 0.2
                col[i * 3 + 1] = 0.1
                col[i * 3 + 2] = 0.3 + Math.random() * 0.3
            }
        }

        return [pos, col]
    }, [settings.particleCount])

    useFrame((state) => {
        if (pointsRef.current) {
            // Rotación muy lenta
            pointsRef.current.rotation.z = state.clock.elapsedTime * 0.02 * settings.animationSpeed
            // Leve movimiento oscilante
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
            </bufferGeometry>
            <pointsMaterial
                size={settings.particleSize * 3}
                vertexColors
                transparent
                opacity={0.5 * settings.glowIntensity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

function CentralStar({ settings }: { settings: SceneSettings }) {
    const starRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (starRef.current) {
            // Pulsación muy sutil
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
            starRef.current.scale.setScalar(scale)
        }
    })

    return (
        <group>
            {/* Enana blanca central */}
            <mesh ref={starRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color="#aabbff" />
            </mesh>
            {/* Glow intenso de la estrella */}
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#8899ff" transparent opacity={0.3} />
            </mesh>

            {settings.showLabels && (
                <Html position={[0, 2, 0]} center>
                    <div className="px-2 py-0.5 text-xs text-blue-200 bg-black/60 rounded border border-blue-500/30 whitespace-nowrap backdrop-blur-sm">
                        Enana Blanca
                    </div>
                </Html>
            )}
        </group>
    )
}

function OuterDisks({ settings }: { settings: SceneSettings }) {
    // "Cometary knots" exteriores - pequeñas estructuras que parecen cometas alejándose
    const [positions, colors] = useMemo(() => {
        const count = 500
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const r = 35 + Math.random() * 15 // Muy exterior

            pos[i * 3] = Math.cos(angle) * r
            pos[i * 3 + 1] = Math.sin(angle) * r
            pos[i * 3 + 2] = (Math.random() - 0.5) * 5

            col[i * 3] = 0.5
            col[i * 3 + 1] = 0.1
            col[i * 3 + 2] = 0.1
        }
        return [pos, col]
    }, [])

    return (
        <points rotation={[Math.PI * 0.15, 0, 0]}>
            <bufferGeometry>
                <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
            </bufferGeometry>
            <pointsMaterial
                size={settings.particleSize * 4}
                vertexColors
                transparent
                opacity={0.3}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}

function SmokeEffect({ settings }: { settings: SceneSettings }) {
    // Capa de "humo" difuso para dar realismo y romper la perfección geométrica
    const [positions, colors] = useMemo(() => {
        const count = 2000
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const rBase = 10 + Math.random() * 25
            const x = Math.cos(angle) * rBase
            const y = Math.sin(angle) * rBase * 0.7 // Mismo achatamiento

            // Dispersión mayor en Z para volumen
            const z = (Math.random() - 0.5) * 25

            // Añadimos ruido aleatorio a la posición para que no sea perfecto
            pos[i * 3] = x + (Math.random() - 0.5) * 3
            pos[i * 3 + 1] = y + (Math.random() - 0.5) * 3
            pos[i * 3 + 2] = z

            // Color muy tenue y rojizo/azulado (mezcla de gases)
            const isCenter = rBase < 20
            if (isCenter) {
                col[i * 3] = 0.2 // R
                col[i * 3 + 1] = 0.4 // G
                col[i * 3 + 2] = 0.5 // B
            } else {
                col[i * 3] = 0.5 // R
                col[i * 3 + 1] = 0.2 // G
                col[i * 3 + 2] = 0.2 // B
            }
        }
        return [pos, col]
    }, [])

    // Textura de humo procedural
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        if (ctx) {
            const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)') // Muy transparente centro
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)') // Transparente borde
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, 64, 64)
        }
        return new THREE.CanvasTexture(canvas)
    }, [])

    return (
        <points>
            <bufferGeometry>
                <primitive object={new THREE.BufferAttribute(positions, 3)} attach="attributes-position" />
                <primitive object={new THREE.BufferAttribute(colors, 3)} attach="attributes-color" />
            </bufferGeometry>
            <pointsMaterial
                size={settings.particleSize * 25} // Partículas MUY grandes
                vertexColors
                transparent
                opacity={0.2 * settings.glowIntensity} // Muy baja opacidad
                sizeAttenuation
                depthWrite={false}
                map={texture}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export function HelixNebula({ settings }: HelixNebulaProps) {
    return (
        <group>
            <ambientLight intensity={0.05} />
            <HelixStructure settings={settings} />
            <SmokeEffect settings={settings} />
            <CentralStar settings={settings} />
            <OuterDisks settings={settings} />
        </group>
    )
}
