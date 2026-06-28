"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import {
  useSyncStore,
  DeviceNodeId,
  SYNC_CONNECTIONS,
  DeviceState,
  SyncPayload,
} from "@core/sync/use-sync-store";
import { useAssemblyRegister } from "@core/assembly/use-assembly";

// Seeded deterministic random (shared codebase pattern)
function createRandom(seed: number) {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// ─── Device Node 3D Positions ────────────────────────────────────────
// Arranged in a pentagon with cloud at center-top

export const NODE_POSITIONS: Record<DeviceNodeId, [number, number, number]> = {
  phone:   [-1.8,  0.0,  0.8],
  tablet:  [ 1.8,  0.0,  0.8],
  desktop: [ 0.0,  0.0, -1.8],
  watch:   [-1.8,  0.0, -0.8],
  cloud:   [ 0.0,  1.6,  0.0],
};

// ─── Packet Spawn Schedules ──────────────────────────────────────────
// Auto-spawns packets on a staggered interval per connection

const SPAWN_INTERVALS: Record<string, number> = {
  "phone→cloud":    3.2,
  "tablet→cloud":   4.1,
  "desktop→cloud":  5.3,
  "watch→phone":    2.8,
  "cloud→desktop":  6.0,
  "phone→tablet":   4.8,
};

const PACKET_LABELS: Record<string, string> = {
  "phone→cloud":    "SYNC.UPLOAD",
  "tablet→cloud":   "SYNC.BACKUP",
  "desktop→cloud":  "STATE.PUSH",
  "watch→phone":    "BIOMETRIC.STREAM",
  "cloud→desktop":  "CONFIG.PULL",
  "phone→tablet":   "HANDOFF.SESSION",
};

// ─── Helpers ─────────────────────────────────────────────────────────

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// ─── 1. Single Device Node ────────────────────────────────────────────

function DeviceNode({
  device,
  opacity,
}: {
  device: DeviceState;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pos = NODE_POSITIONS[device.id];

  const { startDrag, endDrag } = useSyncStore((s) => ({
    startDrag: s.startDrag,
    endDrag: s.endDrag,
  }));

  // Materials
  const { bodyMat, glassMat, glowMat } = useMemo(() => ({
    bodyMat: new THREE.MeshStandardMaterial({
      color: "#0a0a0e",
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity,
    }),
    glassMat: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.02,
      transparent: true,
      opacity: 0.1 * opacity,
    }),
    glowMat: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.0,
    }),
  }), [opacity]);

  // Assembly registration
  useAssemblyRegister({
    id: `sync-node-${device.id}`,
    ref: groupRef,
    stage: "glass",
    animateIn: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: "back.out(1.2)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!groupRef.current) return;
      const tl = gsap.timeline();
      tl.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" });
      return tl;
    },
  });

  // Animate glow ring based on activity + receiving state
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const activity = useSyncStore.getState().devices[device.id].activity;
    const receiving = useSyncStore.getState().devices[device.id].receiving;
    const dragging = useSyncStore.getState().devices[device.id].dragging;

    if (glowRef.current) {
      const pulse = receiving
        ? 0.4 + Math.sin(t * 6) * 0.2
        : dragging
          ? 0.35 + Math.sin(t * 4) * 0.15
          : activity * 0.25 + Math.sin(t * 1.5) * 0.04;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * opacity;
      const s = 1.0 + pulse * 0.15;
      glowRef.current.scale.set(s, s, s);
    }

    // Float animation
    if (groupRef.current) {
      groupRef.current.position.y = pos[1] + Math.sin(t * 0.7 + pos[0]) * 0.05;
    }
  });

  // Determine geometry by device type
  const isCloud = device.id === "cloud";
  const isWatch = device.id === "watch";

  return (
    <group ref={groupRef} position={pos} name={`sync-node-${device.id}`}>
      {/* Glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[isCloud ? 0.38 : 0.28, 0.018, 8, 32]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      {/* Device body */}
      {isCloud ? (
        // Cloud node — octahedron representing distributed topology
        <mesh>
          <octahedronGeometry args={[0.28, 0]} />
          <primitive object={bodyMat} attach="material" />
        </mesh>
      ) : isWatch ? (
        // Watch — small square chassis
        <mesh>
          <boxGeometry args={[0.28, 0.32, 0.05]} />
          <primitive object={bodyMat} attach="material" />
        </mesh>
      ) : device.id === "desktop" ? (
        // Desktop — wide flat rectangle
        <group>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.7, 0.42, 0.03]} />
            <primitive object={bodyMat} attach="material" />
          </mesh>
          {/* Stand */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.12, 0.12, 0.06]} />
            <primitive object={bodyMat} attach="material" />
          </mesh>
        </group>
      ) : (
        // Phone / tablet — portrait slab
        <mesh>
          <boxGeometry args={[device.id === "tablet" ? 0.55 : 0.38, device.id === "tablet" ? 0.72 : 0.68, 0.04]} />
          <primitive object={bodyMat} attach="material" />
        </mesh>
      )}

      {/* Glass screen face */}
      {!isCloud && (
        <mesh position={[0, 0, isWatch ? 0.026 : device.id === "desktop" ? 0.016 : 0.021]}>
          <boxGeometry args={[
            isWatch ? 0.22 : device.id === "desktop" ? 0.62 : device.id === "tablet" ? 0.47 : 0.3,
            isWatch ? 0.26 : device.id === "desktop" ? 0.34 : device.id === "tablet" ? 0.64 : 0.6,
            0.002,
          ]} />
          <primitive object={glassMat} attach="material" />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, isCloud ? -0.42 : isWatch ? -0.26 : device.id === "desktop" ? -0.38 : -0.48, 0]}
        fontSize={0.045}
        color="#66666c"
        font="/fonts/Inter-Bold.ttf"
      >
        {device.label}
      </Text>

      {/* Drag interaction surface (invisible large hit area) */}
      <mesh
        visible={false}
        onPointerDown={(e) => { e.stopPropagation(); startDrag(device.id); }}
        onPointerUp={(e) => { e.stopPropagation(); endDrag(device.id); }}
        onPointerEnter={() => endDrag(device.id)}
      >
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ─── 2. Light Stream Connection ───────────────────────────────────────
// Animated tube between two node positions using particles

function LightStream({
  from,
  to,
  opacity,
}: {
  from: DeviceNodeId;
  to: DeviceNodeId;
  opacity: number;
}) {
  const posA = NODE_POSITIONS[from];
  const posB = NODE_POSITIONS[to];
  const streamRef = useRef<THREE.Points>(null);

  // Build static particle positions along the line
  const count = 24;
  const { geo } = useMemo(() => {
    const rand = createRandom((posA[0] + posB[0] + posA[2] + posB[2]) * 100);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = rand();
      positions[i * 3]     = posA[0] + (posB[0] - posA[0]) * t;
      positions[i * 3 + 1] = posA[1] + (posB[1] - posA[1]) * t;
      positions[i * 3 + 2] = posA[2] + (posB[2] - posA[2]) * t;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geo: g };
  }, [posA, posB]);

  // Pulse-breathe opacity on stream dots
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (streamRef.current) {
      const mat = streamRef.current.material as THREE.PointsMaterial;
      mat.opacity = (0.08 + Math.sin(t * 1.4 + posA[0]) * 0.04) * opacity;
    }
  });

  return (
    <points ref={streamRef} geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.022} transparent opacity={0.1 * opacity} sizeAttenuation />
    </points>
  );
}

// ─── 3. Packet Rider ─────────────────────────────────────────────────
// A single bright dot travelling along a connection path

function PacketRider({
  packet,
  opacity,
}: {
  packet: SyncPayload;
  opacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posA = NODE_POSITIONS[packet.from];
  const posB = NODE_POSITIONS[packet.to];

  useFrame(() => {
    const currentProgress = useSyncStore.getState().packets.find(p => p.id === packet.id)?.progress ?? 1;
    if (meshRef.current) {
      const pos = lerp3(posA, posB, Math.min(currentProgress, 1));
      meshRef.current.position.set(pos[0], pos[1], pos[2]);
    }
  });

  return (
    <mesh ref={meshRef} position={posA}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * opacity} />
    </mesh>
  );
}

// ─── 4. Auto-Spawn Controller ────────────────────────────────────────
// Fires packets automatically on SPAWN_INTERVALS timers

function AutoSpawnController() {
  const spawnPacket = useSyncStore((s) => s.spawnPacket);
  const timers = useRef<Record<string, number>>({});

  // Initialise timers with random offsets so they don't all fire at once
  useEffect(() => {
    const rand = createRandom(9191);
    SYNC_CONNECTIONS.forEach((conn) => {
      const key = `${conn.from}→${conn.to}`;
      timers.current[key] = rand() * ((SPAWN_INTERVALS as Record<string, number | undefined>)[key] ?? 4.0);
    });
  }, []);

  useFrame((_, delta) => {
    SYNC_CONNECTIONS.forEach((conn) => {
      const key = `${conn.from}→${conn.to}`;
      timers.current[key] -= delta;
      if (timers.current[key] <= 0) {
        timers.current[key] = SPAWN_INTERVALS[key] ?? 4.0;
        spawnPacket(conn.from, conn.to, PACKET_LABELS[key] ?? "DATA.SYNC");
      }
    });
  });

  return null;
}

// ─── 5. Shared State Ticker ──────────────────────────────────────────
// Advances packet progress every frame

function PacketTicker() {
  const tickPackets = useSyncStore((s) => s.tickPackets);
  useFrame((_, delta) => tickPackets(delta));
  return null;
}

// ─── Main DeviceSyncEngine ────────────────────────────────────────────

interface SyncEngineProps {
  opacity?: number;
}

export default function DeviceSyncEngine({ opacity = 1.0 }: SyncEngineProps) {
  const devices = useSyncStore((s) => s.devices);
  const packets = useSyncStore((s) => s.packets);

  return (
    <group name="device-sync-engine">
      {/* Auto-spawn + ticker controllers */}
      <AutoSpawnController />
      <PacketTicker />

      {/* Light stream connections along every defined edge */}
      {SYNC_CONNECTIONS.map((conn) => (
        <LightStream
          key={`stream-${conn.from}-${conn.to}`}
          from={conn.from}
          to={conn.to}
          opacity={opacity}
        />
      ))}

      {/* Live packet riders */}
      {packets.map((packet) => (
        <PacketRider
          key={packet.id}
          packet={packet}
          opacity={opacity}
        />
      ))}

      {/* Device nodes */}
      {(Object.values(devices) as DeviceState[]).map((device) => (
        <DeviceNode
          key={device.id}
          device={device}
          opacity={opacity}
        />
      ))}
    </group>
  );
}
export { DeviceSyncEngine };
