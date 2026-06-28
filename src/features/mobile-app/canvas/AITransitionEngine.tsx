"use client";

/**
 * AITransitionEngine.tsx
 *
 * A self-contained cinematic R3F component that orchestrates the continuous
 * Mobile Applications → Artificial Intelligence World transition.
 *
 * Eight choreographed acts driven entirely by transitionProgress 0.0 → 1.0:
 *
 *   Act 1 (0.00–0.15)  Phone syncs — its screen pulses white
 *   Act 2 (0.10–0.30)  Screen dissolves into particle burst
 *   Act 3 (0.20–0.55)  Particles orbit outward toward AI Core position
 *   Act 4 (0.35–0.60)  AI Core begins growing, light intensifies
 *   Act 5 (0.45–0.70)  All devices transmit — knowledge streams fire
 *   Act 6 (0.55–0.80)  Scene darkens — ambient light drops
 *   Act 7 (0.70–0.95)  Camera approaches AI Core (driven via worldStore FOV update)
 *   Act 8 (0.85–1.00)  Mobile world fully dissolves, AI world fully assembled
 *
 * No cuts. No fades. Every value is a continuous lerp.
 * No GSAP timelines — all animation is pure useFrame + transitionProgress math
 * so it is interruptible and scrub-safe.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useWorldStore } from "@core/world/use-world-store";

// ─── Seeded random (codebase pattern) ───────────────────────────────

function createRandom(seed: number) {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// ─── Math helpers ────────────────────────────────────────────────────

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function remap(v: number, inMin: number, inMax: number) {
  return clamp01((v - inMin) / (inMax - inMin));
}
function easeInOut(t: number) { return t * t * (3 - 2 * t); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

// ─── AI Core position (matches MobileAppWorld aiCore config) ─────────
const AI_CORE_POS = new THREE.Vector3(0, 2.0, -3.0);

// ─── 1. Dissolving Phone Screen ──────────────────────────────────────
// The hero phone that dissolves into particles.
// Visible only during Act 1–2 (progress 0.0 → 0.35).

function DissolvingPhone({
  progress,
  opacity,
}: {
  progress: number;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Act 1: screen pulse (0.0 → 0.15) → white flash → dissolve (0.10 → 0.30)
  const syncPulse = remap(progress, 0.0, 0.15);
  const dissolveStart = remap(progress, 0.10, 0.30);
  const phoneOpacity = (1 - easeOut(remap(progress, 0.15, 0.35))) * opacity;

  // Phone positions: floats at world center, then drifts up toward AI Core
  const phoneY = 0.4 + easeOut(remap(progress, 0.10, 0.40)) * 1.8;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.set(0, phoneY, 0.5);
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.08 + easeOut(remap(progress, 0.15, 0.40)) * Math.PI * 2;
    }
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      // Screen brightens then dissolves
      const screenBright = syncPulse * 0.6 + (1 - dissolveStart) * 0.08;
      mat.opacity = Math.min(screenBright, 1.0) * opacity;
      mat.emissiveIntensity = syncPulse * 1.2;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = easeInOut(syncPulse) * 0.45 * (1 - dissolveStart) * opacity;
      const gs = 1 + syncPulse * 0.3;
      glowRef.current.scale.set(gs, gs, gs);
    }
  });

  if (phoneOpacity <= 0.01) return null;

  return (
    <group ref={groupRef} position={[0, phoneY, 0.5]}>
      {/* Phone chassis */}
      <mesh>
        <boxGeometry args={[0.88, 1.62, 0.042]} />
        <meshStandardMaterial
          color="#0a0a0e"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={phoneOpacity}
        />
      </mesh>

      {/* Dissolving screen — emissive white */}
      <mesh ref={screenRef} position={[0, 0, 0.022]}>
        <boxGeometry args={[0.8, 1.52, 0.003]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.02}
          transparent
          opacity={0.12 * opacity}
        />
      </mesh>

      {/* Soft glow halo */}
      <mesh ref={glowRef} position={[0, 0, 0.025]}>
        <planeGeometry args={[1.4, 2.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>

      {/* Sync label */}
      <Text
        position={[0, -0.95, 0.025]}
        fontSize={0.04}
        color={`rgba(136,136,140,${phoneOpacity})`}
        font="/fonts/Inter-Bold.ttf"
      >
        SYNC.COMPLETE
      </Text>
    </group>
  );
}

// ─── 2. Dissolve Particle Burst ───────────────────────────────────────
// Screen breaks apart → particles travel outward → converge on AI Core.
// Two stages:
//   Stage A (0.10–0.45): burst outward from phone screen position
//   Stage B (0.35–0.80): particles spiral inward to AI Core

function DissolveParticles({
  progress,
  opacity,
}: {
  progress: number;
  opacity: number;
}) {
  const COUNT = 280;
  const pointsRef = useRef<THREE.Points>(null);

  // Build static base data once
  const { basePositions, orbitSeeds } = useMemo(() => {
    const rand = createRandom(42069);
    const bp = new Float32Array(COUNT * 3);
    const os = new Float32Array(COUNT * 4); // speed, phase, radius, elevation

    for (let i = 0; i < COUNT; i++) {
      // Screen-space burst origin (normalized phone screen bounds)
      bp[i * 3]     = (rand() - 0.5) * 0.8;
      bp[i * 3 + 1] = (rand() - 0.5) * 1.5;
      bp[i * 3 + 2] = 0.022;

      os[i * 4]     = 0.6 + rand() * 0.8;  // orbit speed
      os[i * 4 + 1] = rand() * Math.PI * 2; // orbit phase
      os[i * 4 + 2] = 0.6 + rand() * 1.4;  // orbit radius
      os[i * 4 + 3] = (rand() - 0.5) * 1.2; // elevation
    }
    return { basePositions: bp, orbitSeeds: os };
  }, []);

  // Dynamic positions updated every frame
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    if (!attr) return;

    // Stage factors
    const burstT  = easeOut(remap(progress, 0.10, 0.45));
    const orbitT  = easeInOut(remap(progress, 0.35, 0.65));
    const convergeT = easeOut(remap(progress, 0.60, 0.85));

    // Phone's current world Y (mirrors DissolvingPhone's drift)
    const phoneY = 0.4 + easeOut(remap(progress, 0.10, 0.40)) * 1.8;

    const pos = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      const speed = orbitSeeds[i * 4];
      const phase = orbitSeeds[i * 4 + 1];
      const radius = orbitSeeds[i * 4 + 2];
      const elevation = orbitSeeds[i * 4 + 3];

      // Stage A: burst out from phone screen
      const burstX = bx + Math.cos(phase) * burstT * radius * 0.8;
      const burstY = (phoneY + by) + Math.sin(phase + Math.PI * 0.3) * burstT * radius * 0.5;
      const burstZ = bz + Math.sin(phase) * burstT * radius * 0.5;

      // Stage B: orbit around AI Core
      const orbitAngle = phase + t * speed * 0.8;
      const orbitR = radius * (1.0 - orbitT * 0.5);
      const orbitX = AI_CORE_POS.x + Math.cos(orbitAngle) * orbitR;
      const orbitY = AI_CORE_POS.y + elevation * orbitT + Math.sin(orbitAngle * 0.7 + phase) * 0.3;
      const orbitZ = AI_CORE_POS.z + Math.sin(orbitAngle) * orbitR;

      // Stage C: converge into AI Core
      const finalX = AI_CORE_POS.x;
      const finalY = AI_CORE_POS.y;
      const finalZ = AI_CORE_POS.z;

      // Blend all three stages
      const blendAB = orbitT;
      const blendBC = convergeT;

      const stageAB_x = burstX + (orbitX - burstX) * blendAB;
      const stageAB_y = burstY + (orbitY - burstY) * blendAB;
      const stageAB_z = burstZ + (orbitZ - burstZ) * blendAB;

      pos[i * 3]     = stageAB_x + (finalX - stageAB_x) * blendBC;
      pos[i * 3 + 1] = stageAB_y + (finalY - stageAB_y) * blendBC;
      pos[i * 3 + 2] = stageAB_z + (finalZ - stageAB_z) * blendBC;
    }
    attr.needsUpdate = true;

    // Particle visibility arc: appear at burst, fade on converge
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      const appear = easeOut(remap(progress, 0.10, 0.30));
      const fade   = 1 - easeOut(remap(progress, 0.80, 0.96));
      mat.opacity = appear * fade * 0.75 * opacity;
      // Particles shrink as they converge
      mat.size = 0.022 + (1 - convergeT) * 0.012;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.022}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
}

// ─── 3. Growing AI Core ───────────────────────────────────────────────
// The AI Core sphere that grows and brightens from Act 4 onward.

function GrowingAICore({
  progress,
  opacity,
}: {
  progress: number;
  opacity: number;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const growT     = easeOut(remap(progress, 0.35, 0.70));
  const brightenT = easeInOut(remap(progress, 0.40, 0.75));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      // Grows from 0.15 to 2.5 (matching AI World aiCore.scale = 1.8)
      const scale = 0.15 + growT * 2.35;
      coreRef.current.scale.set(scale, scale, scale);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (0.06 + brightenT * 0.14) * opacity;
      mat.emissiveIntensity = brightenT * 0.8;
    }
    if (innerRef.current) {
      const innerScale = 0.08 + growT * 1.2;
      innerRef.current.scale.set(innerScale, innerScale, innerScale);
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = brightenT * 0.12 * opacity;
      // Gentle rotation
      innerRef.current.rotation.y = t * 0.6;
      innerRef.current.rotation.x = t * 0.35;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.5;
      const rs = 1 + Math.sin(t * 1.4) * 0.04;
      ring1Ref.current.scale.set(rs * (0.2 + growT * 1.8), rs * (0.2 + growT * 1.8), 1);
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = brightenT * 0.22 * opacity;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.35;
      const rs = 1 + Math.cos(t * 1.2) * 0.03;
      ring2Ref.current.scale.set(rs * (0.3 + growT * 2.4), rs * (0.3 + growT * 2.4), 1);
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = brightenT * 0.14 * opacity;
    }
  });

  if (growT <= 0.01) return null;

  return (
    <group position={AI_CORE_POS}>
      {/* Outer wireframe sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.0, 20, 20]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0}
          transparent
          opacity={0}
          wireframe
        />
      </mesh>

      {/* Inner solid sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#e8e8ec"
          roughness={0.05}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Equatorial ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.012, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>

      {/* Equatorial ring 2 — tilted */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.0, 0.008, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ─── 4. Knowledge Streams ─────────────────────────────────────────────
// Light threads from every device position converging on AI Core.
// Active during Act 5 (0.45 → 0.80).

const DEVICE_ORIGINS: [number, number, number][] = [
  [-2.2, 0.4, -1.5],  // phone left
  [0,    0.2,  0.0],  // phone center
  [2.2,  0.6, -1.2],  // tablet
  [-2.4, 0.8,  1.2],  // widget station
  [2.5, -0.4,  1.4],  // prototype console
];

function KnowledgeStreams({
  progress,
  opacity,
}: {
  progress: number;
  opacity: number;
}) {
  const streamT = easeInOut(remap(progress, 0.45, 0.80));
  const fadeT   = easeOut(remap(progress, 0.82, 0.98));

  const allPoints = useRef<(THREE.Points | null)[]>([]);
  const streamData = useMemo(() => {
    return DEVICE_ORIGINS.map((origin, oi) => {
      const rand = createRandom(1000 + oi * 37);
      const COUNT = 48;
      const pos = new Float32Array(COUNT * 3);
      const phases = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3]     = origin[0];
        pos[i * 3 + 1] = origin[1];
        pos[i * 3 + 2] = origin[2];
        phases[i] = rand();
      }
      const attr = new THREE.BufferAttribute(pos, 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", attr);
      return { geo, attr, origin, phases, COUNT };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    streamData.forEach(({ attr, origin, phases, COUNT }, si) => {
      const pos = attr.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const phase = phases[i];
        const tLocal = ((t * (0.4 + phase * 0.3) + phase * 2.0) % 2.0) / 2.0;
        const tGlobal = tLocal * streamT;
        pos[i * 3]     = origin[0] + (AI_CORE_POS.x - origin[0]) * tGlobal;
        pos[i * 3 + 1] = origin[1] + (AI_CORE_POS.y - origin[1]) * tGlobal + Math.sin(tGlobal * Math.PI) * (phase - 0.5) * 0.4;
        pos[i * 3 + 2] = origin[2] + (AI_CORE_POS.z - origin[2]) * tGlobal;
      }
      attr.needsUpdate = true;

      const pts = allPoints.current[si];
      if (pts) {
        const mat = pts.material as THREE.PointsMaterial;
        mat.opacity = streamT * (1 - fadeT) * 0.5 * opacity;
      }
    });
  });

  // Pre-build THREE.Points objects so we can ref them without JSX generic conflicts
  const pointsObjects = useMemo(() => {
    return streamData.map((sd) => {
      const mat = new THREE.PointsMaterial({ color: "#ffffff", size: 0.018, transparent: true, opacity: 0, sizeAttenuation: true });
      return new THREE.Points(sd.geo, mat);
    });
  }, [streamData]);

  // Keep allPoints in sync with the pre-built objects
  useEffect(() => {
    allPoints.current = pointsObjects;
  }, [pointsObjects]);

  if (streamT <= 0.01) return null;

  return (
    <group name="knowledge-streams">
      {pointsObjects.map((pts, i) => (
        <primitive key={i} object={pts} />
      ))}
    </group>
  );
}

// ─── 5. Scene Darkness Veil ───────────────────────────────────────────
// A large dark plane that sweeps in around Act 6 (0.55–0.85)
// giving the illusion of the room going dark.

function DarknessVeil({
  progress,
  opacity,
}: {
  progress: number;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const darkT = easeInOut(remap(progress, 0.55, 0.85));
  const clearT = easeOut(remap(progress, 0.90, 1.00));

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = darkT * (1 - clearT) * 0.72 * opacity;
    }
  });

  if (darkT <= 0.01) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 3]}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial color="#000000" transparent opacity={0} side={THREE.FrontSide} />
    </mesh>
  );
}

// ─── 6. Camera Approach Coordinator ──────────────────────────────────
// Drives AI World's FOV/position via worldStore so the camera
// feels like it enters the AI Core from Act 7 (0.70–0.95).
// Uses setSharedConfig which the main camera rig reads every frame.

function CameraApproach({ progress }: { progress: number }) {
  const setSharedConfig = useWorldStore((s) => s.setSharedConfig);
  const lastProgress = useRef(-1);

  useFrame(() => {
    if (Math.abs(progress - lastProgress.current) < 0.001) return;
    lastProgress.current = progress;

    const approachT = easeOut(remap(progress, 0.70, 0.95));

    // Lerp camera from Mobile World position toward AI Core entry
    const startPos: [number, number, number] = [0, 8, 3.5];
    const endPos: [number, number, number]   = [0, 2.2, -1.2]; // inside AI Core vicinity

    const startTarget: [number, number, number] = [0, 0, 0];
    const endTarget: [number, number, number]   = [0, 2.0, -3.0]; // AI Core

    const fovStart = 45;
    const fovEnd   = 22; // deep zoom

    setSharedConfig({
      camera: {
        position: [
          startPos[0] + (endPos[0] - startPos[0]) * approachT,
          startPos[1] + (endPos[1] - startPos[1]) * approachT,
          startPos[2] + (endPos[2] - startPos[2]) * approachT,
        ],
        target: [
          startTarget[0] + (endTarget[0] - startTarget[0]) * approachT,
          startTarget[1] + (endTarget[1] - startTarget[1]) * approachT,
          startTarget[2] + (endTarget[2] - startTarget[2]) * approachT,
        ],
        fov: fovStart + (fovEnd - fovStart) * approachT,
      },
    });
  });

  return null;
}

// ─── Main AITransitionEngine ──────────────────────────────────────────

interface AITransitionEngineProps {
  /** 0.0 = Mobile World is fully visible, 1.0 = AI World fully started */
  transitionProgress: number;
  opacity?: number;
}

export default function AITransitionEngine({
  transitionProgress,
  opacity = 1.0,
}: AITransitionEngineProps) {
  // Only render when transition is active
  if (transitionProgress <= 0.005) return null;

  return (
    <group name="ai-transition-engine">
      {/* Act 1–2: Phone dissolving */}
      <DissolvingPhone progress={transitionProgress} opacity={opacity} />

      {/* Act 2–4: Particle burst + orbit + converge */}
      <DissolveParticles progress={transitionProgress} opacity={opacity} />

      {/* Act 4–7: AI Core growing */}
      <GrowingAICore progress={transitionProgress} opacity={opacity} />

      {/* Act 5: Knowledge streams from all devices */}
      <KnowledgeStreams progress={transitionProgress} opacity={opacity} />

      {/* Act 6: Room darkens */}
      <DarknessVeil progress={transitionProgress} opacity={opacity} />

      {/* Act 7: Camera approaches AI Core */}
      <CameraApproach progress={transitionProgress} />
    </group>
  );
}
export { AITransitionEngine };
