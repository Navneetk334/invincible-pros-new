"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";

// Seeded deterministic random generator (shared pattern from codebase)
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// ─── Shared Material Palette ───────────────────────────────────────
// Premium industrial materials: glass, ceramic, titanium, graphite

function useLabMaterials(opacity: number) {
  return useMemo(() => ({
    titanium: new THREE.MeshStandardMaterial({
      color: "#c8c8cc",
      roughness: 0.18,
      metalness: 0.92,
      transparent: true,
      opacity,
    }),
    graphite: new THREE.MeshStandardMaterial({
      color: "#1a1a1e",
      roughness: 0.25,
      metalness: 0.8,
      transparent: true,
      opacity,
    }),
    ceramic: new THREE.MeshStandardMaterial({
      color: "#e8e8ec",
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.02,
      transparent: true,
      opacity: 0.12 * opacity,
    }),
    glassEdge: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.05,
      transparent: true,
      opacity: 0.06 * opacity,
    }),
  }), [opacity]);
}

// ─── 1. Smart Watch ────────────────────────────────────────────────
// Small square chassis with rounded screen and ceramic band stubs

export function SmartWatch({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `smartwatch-${position.join("-")}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.2, ease: "back.out(1.1)" }, 0);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `smartwatch-${position.join("-")}`,
    tooltip: "Inspect wearable display module",
    cameraPosition: [position[0], position[1] + 0.2, position[2] + 0.8],
    cameraTarget: position,
    cameraFov: 36,
  }, groupRef);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.1 + position[0]) * 0.03;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} {...handlers}>
      {/* Case body */}
      <mesh>
        <boxGeometry args={[0.32, 0.36, 0.06]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      {/* Screen glass */}
      <mesh position={[0, 0, 0.031]}>
        <boxGeometry args={[0.26, 0.3, 0.003]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {/* Band stub top */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.1, 0.04]} />
        <primitive object={mats.ceramic} attach="material" />
      </mesh>
      {/* Band stub bottom */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.18, 0.1, 0.04]} />
        <primitive object={mats.ceramic} attach="material" />
      </mesh>
      <Text position={[0, -0.38, 0]} fontSize={0.04} color="#88888c" font="/fonts/Inter-Bold.ttf">
        WEARABLE.01
      </Text>
    </group>
  );
}

// ─── 2. Foldable Device ───────────────────────────────────────────
// Two hinged screen panels with a visible spine

export function FoldableDevice({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftRef = useRef<THREE.Group>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `foldable-${position.join("-")}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "back.out(1.2)" }, 0);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `foldable-${position.join("-")}`,
    tooltip: "Inspect foldable hinge assembly",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.3],
    cameraTarget: position,
    cameraFov: 38,
  }, groupRef);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + 1.2) * 0.04;
    }
    // Gentle breathing fold angle
    if (leftRef.current) {
      leftRef.current.rotation.y = -0.15 + Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} {...handlers}>
      {/* Right panel (stationary) */}
      <group position={[0.3, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.55, 1.0, 0.03]} />
          <primitive object={mats.graphite} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[0.49, 0.94, 0.003]} />
          <primitive object={mats.glass} attach="material" />
        </mesh>
      </group>
      {/* Left panel (hinged) */}
      <group ref={leftRef} position={[0, 0, 0]}>
        <group position={[-0.3, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.55, 1.0, 0.03]} />
            <primitive object={mats.graphite} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <boxGeometry args={[0.49, 0.94, 0.003]} />
            <primitive object={mats.glass} attach="material" />
          </mesh>
        </group>
      </group>
      {/* Hinge spine */}
      <mesh position={[0, 0, -0.01]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.045} color="#88888c" font="/fonts/Inter-Bold.ttf">
        FOLD.HINGE_V2
      </Text>
    </group>
  );
}

// ─── 3. AR Glasses ────────────────────────────────────────────────
// Simplified wireframe spectacles with two lens planes

export function ARGlasses({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `ar-glasses-${position.join("-")}`,
    ref: groupRef,
    stage: "hologram",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.4, ease: "back.out(1.3)" }, 0);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `ar-glasses-${position.join("-")}`,
    tooltip: "Inspect spatial computing optics",
    cameraPosition: [position[0], position[1] + 0.2, position[2] + 0.9],
    cameraTarget: position,
    cameraFov: 34,
  }, groupRef);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.9 + 2.4) * 0.03;
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} {...handlers}>
      {/* Left lens */}
      <mesh position={[-0.17, 0, 0]}>
        <boxGeometry args={[0.26, 0.18, 0.005]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {/* Right lens */}
      <mesh position={[0.17, 0, 0]}>
        <boxGeometry args={[0.26, 0.18, 0.005]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.025, 0.015]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      {/* Left temple arm */}
      <mesh position={[-0.32, 0, -0.12]} rotation={[0, Math.PI / 7, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.26]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      {/* Right temple arm */}
      <mesh position={[0.32, 0, -0.12]} rotation={[0, -Math.PI / 7, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.26]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      <Text position={[0, -0.16, 0]} fontSize={0.035} color="#88888c" font="/fonts/Inter-Bold.ttf">
        SPATIAL.OPTICS
      </Text>
    </group>
  );
}

// ─── 4. Glass Workbench ───────────────────────────────────────────
// A floating transparent table surface on titanium legs

export function GlassWorkbench({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `workbench-${position.join("-")}`,
    ref: groupRef,
    stage: "frame",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.position, { y: position[1] - 2 },
        { y: position[1], duration: 1.5, ease: "power3.out" }, 0);
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.2, ease: "power2.out" }, 0.1);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} name="workbench">
      {/* Glass surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.025, 1.2]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {/* Edge trim */}
      <mesh position={[0, -0.014, 0]}>
        <boxGeometry args={[2.42, 0.004, 1.22]} />
        <primitive object={mats.glassEdge} attach="material" />
      </mesh>
      {/* Titanium legs */}
      {[[-1.05, -0.5, -0.5], [1.05, -0.5, -0.5], [-1.05, -0.5, 0.5], [1.05, -0.5, 0.5]].map(
        (legPos, i) => (
          <mesh key={i} position={legPos as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, 0.95, 8]} />
            <primitive object={mats.titanium} attach="material" />
          </mesh>
        )
      )}
    </group>
  );
}

// ─── 5. Wireless Charging Station ─────────────────────────────────
// A ceramic disc pad with subtle pulsing energy ring

export function ChargingStation({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `charger-${position.join("-")}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.0, ease: "power2.out" }, 0);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.in" });
      return tl;
    },
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      const pulse = 0.95 + Math.sin(t * 2.5) * 0.05;
      ringRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Ceramic base disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.04, 24]} />
        <primitive object={mats.ceramic} attach="material" />
      </mesh>
      {/* Energy ring */}
      <mesh ref={ringRef} position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.008, 8, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2 * opacity} />
      </mesh>
      <Text position={[0, -0.08, 0.26]} fontSize={0.03} color="#66666c" font="/fonts/Inter-Bold.ttf">
        QI.WIRELESS
      </Text>
    </group>
  );
}

// ─── 6. Assembly Arm ──────────────────────────────────────────────
// Robotic precision arm with two titanium segments and a pivot joint

export function AssemblyArm({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const upperRef = useRef<THREE.Group>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `assembly-arm-${position.join("-")}`,
    ref: groupRef,
    stage: "frame",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.5, ease: "power2.out" }, 0);
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
    id: `assembly-arm-${position.join("-")}`,
    tooltip: "Inspect precision assembly actuator",
    cameraPosition: [position[0], position[1] + 0.4, position[2] + 1.0],
    cameraTarget: position,
    cameraFov: 38,
  }, groupRef);

  // Slow breathing rotation on upper arm
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (upperRef.current) {
      upperRef.current.rotation.z = -0.4 + Math.sin(t * 0.6) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} {...handlers}>
      {/* Base mount */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 12]} />
        <primitive object={mats.graphite} attach="material" />
      </mesh>
      {/* Lower segment */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      {/* Pivot joint */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <primitive object={mats.ceramic} attach="material" />
      </mesh>
      {/* Upper segment (animated) */}
      <group ref={upperRef} position={[0, 0.65, 0]}>
        <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.04, 0.45, 0.04]} />
          <primitive object={mats.titanium} attach="material" />
        </mesh>
        {/* End effector */}
        <mesh position={[0.38, 0.28, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.06]} />
          <primitive object={mats.graphite} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// ─── 7. Wireless Energy Platform ──────────────────────────────────
// Large floating disc that emits soft concentric energy rings

export function EnergyPlatform({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const mats = useLabMaterials(opacity);

  useAssemblyRegister({
    id: `energy-platform-${position.join("-")}`,
    ref: groupRef,
    stage: "frame",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.position, { y: position[1] - 3 },
        { y: position[1], duration: 1.6, ease: "power3.out" }, 0);
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "power2.out" }, 0.1);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) {
      const p = 0.95 + Math.sin(t * 1.8) * 0.05;
      ring1Ref.current.scale.set(p, p, 1);
    }
    if (ring2Ref.current) {
      const p = 0.95 + Math.cos(t * 1.8) * 0.05;
      ring2Ref.current.scale.set(p, p, 1);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Main disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.82, 0.035, 32]} />
        <primitive object={mats.ceramic} attach="material" />
      </mesh>
      {/* Inner energy ring */}
      <mesh ref={ring1Ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.008, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14 * opacity} />
      </mesh>
      {/* Outer energy ring */}
      <mesh ref={ring2Ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.006, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09 * opacity} />
      </mesh>
      <Text position={[0, 0.04, 0.85]} fontSize={0.04} color="#66666c" font="/fonts/Inter-Bold.ttf">
        ENERGY.PAD_01
      </Text>
    </group>
  );
}

// ─── 8. Prototype Station ─────────────────────────────────────────
// A tall glass cabinet with floating component layers inside

export function PrototypeStation({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Points>(null);
  const mats = useLabMaterials(opacity);

  const count = 35;
  const pointsGeometry = useMemo(() => {
    const rand = createRandom(7070);
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (rand() - 0.5) * 0.5;
      positions[idx + 1] = (rand() - 0.5) * 1.2;
      positions[idx + 2] = (rand() - 0.5) * 0.5;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  useAssemblyRegister({
    id: `proto-station-${position.join("-")}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(groupRef.current.scale, { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "back.out(1.1)" }, 0);
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `proto-station-${position.join("-")}`,
    tooltip: "Inspect prototype staging cabinet",
    cameraPosition: [position[0], position[1] + 0.4, position[2] + 1.2],
    cameraTarget: position,
    cameraFov: 38,
  }, groupRef);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]} {...handlers}>
      {/* Cabinet shell */}
      <mesh>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <primitive object={mats.glassEdge} attach="material" />
      </mesh>
      {/* Titanium base */}
      <mesh position={[0, -0.82, 0]}>
        <boxGeometry args={[0.72, 0.04, 0.72]} />
        <primitive object={mats.titanium} attach="material" />
      </mesh>
      {/* Floating component particles inside */}
      <points ref={innerRef} geometry={pointsGeometry}>
        <pointsMaterial color="#ffffff" size={0.025} transparent opacity={0.5 * opacity} />
      </points>
      <Text position={[0, -0.95, 0]} fontSize={0.04} color="#88888c" font="/fonts/Inter-Bold.ttf">
        PROTO.STAGE_V1
      </Text>
    </group>
  );
}

// ─── Main Laboratory Aggregator ───────────────────────────────────

interface LabProps {
  opacity?: number;
}

export default function MobileLab({ opacity = 1.0 }: LabProps) {
  return (
    <group name="mobile-lab">
      {/* ── Workbenches (foundation layer) ─── */}
      <GlassWorkbench position={[-2.0, -0.6, 1.8]} scale={0.9} opacity={opacity} />
      <GlassWorkbench position={[2.0, -0.6, 2.2]} scale={0.85} opacity={opacity} />

      {/* ── Energy Platforms (floor installations) ─── */}
      <EnergyPlatform position={[0.0, -1.15, 3.5]} scale={1.0} opacity={opacity} />
      <EnergyPlatform position={[-3.0, -1.15, -2.0]} scale={0.7} opacity={opacity} />

      {/* ── Assembly Arms (precision robotics) ─── */}
      <AssemblyArm position={[-3.5, -0.6, 1.0]} scale={1.0} opacity={opacity} />
      <AssemblyArm position={[3.5, -0.6, 1.0]} scale={0.9} opacity={opacity} />

      {/* ── Charging Stations (on workbenches) ─── */}
      <ChargingStation position={[-2.0, -0.2, 1.8]} scale={0.8} opacity={opacity} />
      <ChargingStation position={[2.0, -0.2, 2.2]} scale={0.8} opacity={opacity} />

      {/* ── Floating Devices (above workbenches) ─── */}
      <SmartWatch position={[-1.6, 0.6, 2.0]} scale={1.0} opacity={opacity} />
      <FoldableDevice position={[3.0, 0.5, -0.8]} scale={0.85} opacity={opacity} />
      <ARGlasses position={[-3.2, 1.0, -0.6]} scale={1.1} opacity={opacity} />

      {/* ── Prototype Stations (vertical cabinets) ─── */}
      <PrototypeStation position={[0.0, 0.2, -2.8]} scale={1.0} opacity={opacity} />
      <PrototypeStation position={[3.2, 0.2, -2.4]} scale={0.9} opacity={opacity} />
    </group>
  );
}
export { MobileLab };
