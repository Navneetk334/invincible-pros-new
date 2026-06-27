"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";

interface ShowcaseProps {
  opacity?: number;
}

// Seeded deterministic random coordinate generator for purity compliance
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// 1. Glowing Database Storage Core (PostgreSQL / MySQL / Redis)
export function GlowingStorageCore({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { borderMaterial, coreMaterial } = useMemo(() => {
    return {
      borderMaterial: new THREE.MeshStandardMaterial({
        color: "#16161a",
        roughness: 0.3,
        metalness: 0.9,
        transparent: true,
        opacity: 0.5 * opacity,
        wireframe: true,
      }),
      coreMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.1,
        transparent: true,
        opacity: 0.15 * opacity,
      }),
    };
  }, [opacity]);

  // Assembly Register
  useAssemblyRegister({
    id: `storage-core-${position.join("-")}`,
    ref: groupRef,
    stage: "frame",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.2, ease: "power2.out" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "glowing-storage-core",
    tooltip: "Inspect glowing SQL storage cylinders",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.6],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, groupRef);

  // Animate inner rings rotation and pulsing
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4;
      coreRef.current.scale.y = 1.0 + Math.sin(time * 2.0) * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -time * 0.6;
    }
  });

  // Calculate inner database index point clouds deterministically
  const count = 30;
  const pointsGeometry = useMemo(() => {
    const rand = createRandom(4040);
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const angle = rand() * Math.PI * 2;
      const radius = 0.25 + rand() * 0.15;
      positions[idx] = Math.cos(angle) * radius;
      positions[idx + 1] = (rand() - 0.5) * 0.8;
      positions[idx + 2] = Math.sin(angle) * radius;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} name="storage-core" {...handlers}>
      {/* Stacked Cylinder Racks (Postgres SQL tables) */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 1.0, 8]} />
        <primitive object={borderMaterial} attach="material" />
      </mesh>

      {/* Database Emissive Core Column */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      {/* Internal floating data pointer points */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial color="#ffffff" size={0.02} transparent opacity={0.5 * opacity} />
      </points>

      {/* Cache node (Redis fast memory cache) */}
      <mesh position={[0.65, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} transparent opacity={0.25 * opacity} />
      </mesh>
    </group>
  );
}

// 2. Orchestrated Containers (Docker / Kubernetes)
export function OrchestratedContainers({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const containerGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { frameMaterial, coreMaterial } = useMemo(() => {
    return {
      frameMaterial: new THREE.MeshStandardMaterial({
        color: "#16161c",
        transparent: true,
        opacity: 0.35 * opacity,
        wireframe: true,
      }),
      coreMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.15,
        transparent: true,
        opacity: 0.12 * opacity,
      }),
    };
  }, [opacity]);

  // Assembly Register
  useAssemblyRegister({
    id: `orchestrated-containers-${position.join("-")}`,
    ref: containerGroupRef,
    stage: "glass",
    animateIn: () => {
      if (!containerGroupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        containerGroupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "power2.out" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!containerGroupRef.current) return;
      const tl = gsap.timeline();
      tl.to(containerGroupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "orchestrated-containers",
    tooltip: "Inspect Kubernetes container clusters",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.6],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, containerGroupRef);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
    }
  });

  return (
    <group ref={containerGroupRef} position={position} scale={[scale, scale, scale]} name="containers" {...handlers}>
      {/* Central Kubernetes orchestrator tracking loop */}
      <mesh ref={ringRef} position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.02, 8, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2 * opacity} />
      </mesh>

      {/* Docker Container Node 1 */}
      <group position={[-0.4, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <primitive object={coreMaterial} attach="material" />
        </mesh>
      </group>

      {/* Docker Container Node 2 */}
      <group position={[0, -0.15, 0.3]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <primitive object={coreMaterial} attach="material" />
        </mesh>
      </group>

      {/* Docker Container Node 3 */}
      <group position={[0.4, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <primitive object={coreMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// 3. Event Loop Queue Node (Node.js event loop runtime / Python / Laravel)
export function EventLoopQueue({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const loopRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const packetRef = useRef<THREE.Mesh>(null);

  // Register assembly
  useAssemblyRegister({
    id: `event-loop-${position.join("-")}`,
    ref: loopRef,
    stage: "glass",
    animateIn: () => {
      if (!loopRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        loopRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.1, ease: "back.out(1.1)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!loopRef.current) return;
      const tl = gsap.timeline();
      tl.to(loopRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "event-loop-queue",
    tooltip: "Inspect asynchronous non-blocking event loop",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.6],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, loopRef);

  // Slide loop packets along the torus pathway
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.3;
    }
    if (packetRef.current) {
      // Circular motion coordinate math
      const angle = time * 2.5;
      packetRef.current.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
    }
  });

  return (
    <group ref={loopRef} position={position} scale={[scale, scale, scale]} name="event-loop" {...handlers}>
      {/* Event Torus Pathway */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.015, 8, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1 * opacity} wireframe />
      </mesh>

      {/* Floating packet Node */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6 * opacity} />
      </mesh>

      {/* Center Event controller processor */}
      <mesh>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#08080c" roughness={0.1} transparent opacity={0.8 * opacity} />
      </mesh>
    </group>
  );
}

// 4. Distributed Cloud Node Architecture (Server network segments)
export function DistributedArchitecture({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const netRef = useRef<THREE.Group>(null);

  // Assembly Register
  useAssemblyRegister({
    id: `distributed-net-${position.join("-")}`,
    ref: netRef,
    stage: "glass",
    animateIn: () => {
      if (!netRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        netRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.4, ease: "power2.out" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!netRef.current) return;
      const tl = gsap.timeline();
      tl.to(netRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "distributed-architecture",
    tooltip: "Inspect distributed network cloud servers",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.8],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 42,
  }, netRef);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (netRef.current) {
      netRef.current.rotation.y = time * 0.12;
    }
  });

  return (
    <group ref={netRef} position={position} scale={[scale, scale, scale]} name="distributed-net" {...handlers}>
      {/* Node 1 */}
      <mesh position={[-0.4, 0.25, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6 * opacity} />
      </mesh>

      {/* Node 2 */}
      <mesh position={[0.4, 0.25, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6 * opacity} />
      </mesh>

      {/* Node 3 */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.8 * opacity} />
      </mesh>

      {/* Link lines represented by thin rods */}
      <mesh position={[-0.2, -0.025, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.005, 0.005, 0.7]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
      <mesh position={[0.2, -0.025, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.005, 0.005, 0.7]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
    </group>
  );
}

// 5. Nested Widget Tree (Flutter / React hierarchy structures)
export function WidgetTree({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const treeRef = useRef<THREE.Group>(null);
  const [activeItem, setActiveItem] = useState(0);

  // Register assembly
  useAssemblyRegister({
    id: `widget-tree-${position.join("-")}`,
    ref: treeRef,
    stage: "hologram",
    animateIn: () => {
      if (!treeRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        treeRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "back.out(1.2)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!treeRef.current) return;
      const tl = gsap.timeline();
      tl.to(treeRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "widget-tree",
    tooltip: "Inspect Flutter widget hierarchy trees",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.6],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, treeRef);

  // Cycle highlighted node blocks
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const cycle = Math.floor(time * 0.8) % 3;
    if (cycle !== activeItem) {
      setActiveItem(cycle);
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]} name="widget-tree" {...handlers}>
      {/* Root Node Widget Block */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.15]} />
        <meshStandardMaterial
          color={activeItem === 0 ? "#ffffff" : "#0c0c10"}
          roughness={0.2}
          transparent
          opacity={0.8 * opacity}
        />
      </mesh>

      {/* Left Widget child */}
      <group position={[-0.3, 0.05, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.12, 0.12]} />
          <meshStandardMaterial
            color={activeItem === 1 ? "#ffffff" : "#08080c"}
            roughness={0.25}
            transparent
            opacity={0.6 * opacity}
          />
        </mesh>
      </group>

      {/* Right Widget child */}
      <group position={[0.3, 0.05, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.12, 0.12]} />
          <meshStandardMaterial
            color={activeItem === 2 ? "#ffffff" : "#08080c"}
            roughness={0.25}
            transparent
            opacity={0.6 * opacity}
          />
        </mesh>
      </group>

      {/* Connecting spline rods */}
      <mesh position={[-0.15, 0.22, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
      <mesh position={[0.15, 0.22, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.005, 0.005, 0.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
    </group>
  );
}

// Main aggregated EngineeringShowcase wrapper component
export default function EngineeringShowcase({ opacity = 1.0 }: ShowcaseProps) {
  return (
    <group name="engineering-showcase">
      {/* Base Grid Layer */}
      <gridHelper args={[16, 16, "#0f0f12", "#070709"]} position={[0, -1.0, 0]} />

      {/* 1. Database Cylindrical Storage Core (PostgreSQL, MySQL, Redis) */}
      <GlowingStorageCore position={[-2.4, -0.2, 1.2]} scale={1.0} opacity={opacity} />

      {/* 2. Orchestrated Containers Cluster (Docker & Kubernetes) */}
      <OrchestratedContainers position={[2.6, 0.6, -1.4]} scale={1.1} opacity={opacity} />

      {/* 3. Event Loop Queue Node (Node.js runtime, Python, Laravel) */}
      <EventLoopQueue position={[-2.2, 0.8, -1.5]} scale={1.0} opacity={opacity} />

      {/* 4. Distributed Cloud Topologies */}
      <DistributedArchitecture position={[0, 1.2, -2.4]} scale={1.15} opacity={opacity} />

      {/* 5. Nested Widget Hierarchy Tree (Flutter UI layouts) */}
      <WidgetTree position={[2.2, -0.2, 1.4]} scale={1.0} opacity={opacity} />

      {/* Text context descriptors labels mapping the abstract categories */}
      <Text position={[-2.4, -0.8, 1.2]} fontSize={0.06} color="#44444c" font="/fonts/Inter-Bold.ttf">
        DATASTORE.PG_CORE
      </Text>
      <Text position={[2.6, -0.1, -1.4]} fontSize={0.06} color="#44444c" font="/fonts/Inter-Bold.ttf">
        K8S.ORCHESTRATOR
      </Text>
      <Text position={[-2.2, 0.1, -1.5]} fontSize={0.06} color="#44444c" font="/fonts/Inter-Bold.ttf">
        NODE.EVENT_LOOP
      </Text>
      <Text position={[0, 0.4, -2.4]} fontSize={0.06} color="#44444c" font="/fonts/Inter-Bold.ttf">
        CLOUD.NETWORK
      </Text>
      <Text position={[2.2, -0.8, 1.4]} fontSize={0.06} color="#44444c" font="/fonts/Inter-Bold.ttf">
        WIDGET.HIERARCHY
      </Text>
    </group>
  );
}
export { EngineeringShowcase };
