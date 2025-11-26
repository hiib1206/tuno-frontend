"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial, Line } from "@react-three/drei"
import * as THREE from "three"

function DataParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const lineGroupRef = useRef<THREE.Group>(null)

  const particleCount = 2000
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return positions
  }, [])

  const connections = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = []
    const particles: THREE.Vector3[] = []

    // Validate positions array length
    if (!particlesPosition || particlesPosition.length < 3) {
      return lines
    }

    for (let i = 0; i < particlesPosition.length; i += 3) {
      particles.push(new THREE.Vector3(particlesPosition[i], particlesPosition[i + 1], particlesPosition[i + 2]))
    }

    // Connect particles within distance (limit checks for performance)
    const maxConnections = 200
    for (let i = 0; i < particles.length && lines.length < maxConnections; i++) {
      for (let j = i + 1; j < particles.length && lines.length < maxConnections; j++) {
        if (particles[i].distanceTo(particles[j]) < 5) {
          lines.push([particles[i], particles[j]])
        }
      }
    }

    return lines
  }, [particlesPosition])

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x += delta * 0.05
      particlesRef.current.rotation.y += delta * 0.08
    }
    if (lineGroupRef.current) {
      lineGroupRef.current.rotation.x += delta * 0.05
      lineGroupRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <>
      <Points ref={particlesRef} positions={particlesPosition} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#84cc16"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>

      <group ref={lineGroupRef}>
        {connections.map((points, i) => (
          <Line key={i} points={points} color="#84cc16" lineWidth={0.5} transparent opacity={0.15} />
        ))}
      </group>
    </>
  )
}

function WaveGrid() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && meshRef.current.geometry) {
      const positions = meshRef.current.geometry.attributes.position

      if (!positions || positions.count <= 0) {
        return
      }

      const time = state.clock.elapsedTime

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const wave = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 2
        positions.setZ(i, wave)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial color="#84cc16" wireframe transparent opacity={0.1} />
    </mesh>
  )
}

function FloatingOrbs() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30] as [
          number,
          number,
          number,
        ],
        scale: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
      })),
    [],
  )

  return (
    <>
      {orbs.map((orb, i) => (
        <Orb key={i} position={orb.position} scale={orb.scale} speed={orb.speed} />
      ))}
    </>
  )
}

function Orb({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 2
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * speed * 2) * 0.2)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#84cc16" transparent opacity={0.1} />
    </mesh>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <DataParticles />
        <WaveGrid />
        <FloatingOrbs />
      </Canvas>
    </div>
  )
}
