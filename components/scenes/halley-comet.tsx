"use client"

import { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SceneSettings } from "@/app/page"

interface HalleyCometProps {
    settings: SceneSettings
}

const COMPOSITION_COLORS = {
    "Ice": { nucleus: "#a4ebf3", tail: "#80d8ff", ion: "#00b0ff" },
    "Dust": { nucleus: "#fff59d", tail: "#fff176", ion: "#ffeb3b" },
    "Carbon": { nucleus: "#ef9a9a", tail: "#ffcdd2", ion: "#ff5252" },
    "Sodium": { nucleus: "#ffcc80", tail: "#ffe0b2", ion: "#ff9800" },
}

const NucleusShaderMaterial = {
    vertexShader: `
    uniform float uTime;
    varying vec3 vNormal;
    varying float vNoise;
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy; 
      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ ); 
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    void main() {
      vNoise = snoise(position * 1.5 + uTime * 0.2);
      vec3 newPosition = position + normal * vNoise * 0.3;
      vNormal = normalize(normalMatrix * normal); 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying float vNoise;
    void main() {
      vec3 viewDir = vec3(0.0, 0.0, 1.0); 
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
      vec3 col = uColor * (0.6 + vNoise * 0.4);
      col += fresnel * 0.5;
      gl_FragColor = vec4(col, 1.0);
    }
  `
}

const ComaShaderMaterial = {
    vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
      gl_FragColor = vec4(uColor, intensity * 0.6);
    }
  `
}

const IonTailShaderMaterial = {
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float flow = sin(vUv.x * 20.0 - uTime * 8.0) * 0.5 + 0.5;
      float alpha = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.4, vUv.x); 
      float core = 1.0 - abs(vUv.y - 0.5) * 2.0;
      core = smoothstep(0.0, 1.0, core);
      vec3 finalColor = uColor + vec3(0.5) * flow * core;
      gl_FragColor = vec4(finalColor, alpha * core * 0.8);
    }
  `
}

export function HalleyComet({ settings }: HalleyCometProps) {
    const cometGroupRef = useRef<THREE.Group>(null)
    const nucleusRef = useRef<THREE.Mesh>(null)
    const comasRef = useRef<THREE.Mesh>(null)
    const ionTailRef1 = useRef<THREE.Mesh>(null)
    const ionTailRef2 = useRef<THREE.Mesh>(null)
    const dustTailRef = useRef<THREE.Points>(null)

    const colors = COMPOSITION_COLORS[settings.cometComposition || "Ice"]

    const [dustPositions, dustRandoms] = useMemo(() => {
        const count = settings.particleCount
        const positions = new Float32Array(count * 3)
        const randoms = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const maxDist = settings.cometTailLength || 50
            const dist = Math.random() * maxDist

            // SURFACE EMISSION INIT
            // Uniform disk sampling for spread
            const baseSpread = (settings.cometSize || 1) * 0.4
            const r = Math.sqrt(Math.random()) * calculateSpreadAtDistance(baseSpread, dist)
            const theta = Math.random() * Math.PI * 2

            positions[i * 3] = r * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(theta)
            positions[i * 3 + 2] = dist

            randoms[i * 3] = (Math.random() - 0.5)
            randoms[i * 3 + 1] = (Math.random() - 0.5)
        }
        return [positions, randoms]
    }, [settings.particleCount, settings.cometTailLength])

    // Helper to calculate expected spread width at a given distance
    // Only used for initialization to pre-warm the shape
    function calculateSpreadAtDistance(base: number, dist: number) {
        return base + (dist * 0.25) // High dispersion factor 0.25
    }

    useEffect(() => {
        const updateColor = (ref: React.RefObject<THREE.Mesh | null>, color: string) => {
            if (ref.current && (ref.current.material as THREE.ShaderMaterial).uniforms) {
                (ref.current.material as THREE.ShaderMaterial).uniforms.uColor.value.set(color)
            }
        }
        updateColor(nucleusRef, colors.nucleus)
        updateColor(comasRef, colors.nucleus)
        updateColor(ionTailRef1, colors.ion)
        updateColor(ionTailRef2, colors.ion)
    }, [colors])

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime()
        const speed = settings.cometSpeed || 1

        if (comasRef.current) {
            const scale = 1 + Math.sin(time * 2) * 0.05
            comasRef.current.scale.set(scale, scale, scale)
        }
        if (nucleusRef.current) {
            (nucleusRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time
            nucleusRef.current.rotation.y += 0.05 * speed
            nucleusRef.current.rotation.z += 0.02 * speed
        }
        if (ionTailRef1.current) (ionTailRef1.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time
        if (ionTailRef2.current) (ionTailRef2.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time

        if (dustTailRef.current) {
            const positions = dustTailRef.current.geometry.attributes.position.array as Float32Array
            const count = settings.particleCount
            const tailLen = settings.cometTailLength || 50
            const baseSpread = (settings.cometSize || 1) * 0.4

            for (let i = 0; i < count; i++) {
                const ix = i * 3
                // PURE LINEAR MOTION ALONG Z
                const speedFactor = (1.0 + dustRandoms[ix + 2] * 0.5) * speed * 0.3
                positions[ix + 2] += speedFactor

                // HIGH DISPERSION
                // 0.06 factor for wide cone
                positions[ix] += dustRandoms[ix] * 0.06 * speed
                positions[ix + 1] += dustRandoms[ix + 1] * 0.06 * speed

                if (positions[ix + 2] > tailLen) {
                    positions[ix + 2] = 0

                    // SURFACE EMISSION RESET
                    // Respawn on the back face disk
                    const r = Math.sqrt(Math.random()) * baseSpread
                    const theta = Math.random() * Math.PI * 2

                    positions[ix] = r * Math.cos(theta)
                    positions[ix + 1] = r * Math.sin(theta)
                }
            }
            dustTailRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <group ref={cometGroupRef}>
            <mesh ref={nucleusRef} scale={[settings.cometSize || 1, settings.cometSize || 1, settings.cometSize || 1]}>
                <dodecahedronGeometry args={[1, 5]} />
                <shaderMaterial
                    uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(colors.nucleus) } }}
                    vertexShader={NucleusShaderMaterial.vertexShader}
                    fragmentShader={NucleusShaderMaterial.fragmentShader}
                />
            </mesh>
            <mesh ref={comasRef} renderOrder={1}>
                <sphereGeometry args={[(settings.cometSize || 1) * 2.8, 32, 32]} />
                <shaderMaterial
                    uniforms={{ uColor: { value: new THREE.Color(colors.nucleus) } }}
                    vertexShader={ComaShaderMaterial.vertexShader}
                    fragmentShader={ComaShaderMaterial.fragmentShader}
                    transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide}
                />
            </mesh>
            <group position={[0, 0, (settings.cometTailLength || 50) * 0.5]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh ref={ionTailRef1}>
                    <planeGeometry args={[(settings.cometTailLength || 50), (settings.cometSize || 1) * 2, 20, 1]} />
                    <shaderMaterial
                        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(colors.ion) } }}
                        vertexShader={IonTailShaderMaterial.vertexShader}
                        fragmentShader={IonTailShaderMaterial.fragmentShader}
                        transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh ref={ionTailRef2} rotation={[Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[(settings.cometTailLength || 50), (settings.cometSize || 1) * 2, 20, 1]} />
                    <shaderMaterial
                        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color(colors.ion) } }}
                        vertexShader={IonTailShaderMaterial.vertexShader}
                        fragmentShader={IonTailShaderMaterial.fragmentShader}
                        transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
            <points ref={dustTailRef}>
                <bufferGeometry>
                    <primitive object={new THREE.BufferAttribute(dustPositions, 3)} attach="attributes-position" />
                </bufferGeometry>
                <pointsMaterial
                    color={colors.tail}
                    size={settings.particleSize || 0.15}
                    transparent opacity={0.5} blending={THREE.AdditiveBlending} sizeAttenuation={true} depthWrite={false}
                />
            </points>
        </group>
    )
}
