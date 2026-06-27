"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useInteractiveObject } from "@core/interaction/use-interaction";

// ─── Device Type Configurations ────────────────────────────────────
// Each device type defines geometry dimensions for its assembly layers

export interface DeviceProfile {
  id: string;
  label: string;
  /** Outer frame dimensions [width, height, depth] */
  frame: [number, number, number];
  /** Screen inset from frame edges */
  screenInset: number;
  /** Battery height ratio relative to frame height */
  batteryRatio: number;
  /** Number of camera modules */
  cameraCount: number;
  /** Position of the assembled device */
  position: [number, number, number];
  /** Scale multiplier */
  scale: number;
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  phone: {
    id: "phone",
    label: "HANDSET.UNIT_01",
    frame: [1.1, 2.1, 0.06],
    screenInset: 0.06,
    batteryRatio: 0.35,
    cameraCount: 3,
    position: [0, 0, 0],
    scale: 1.0,
  },
  tablet: {
    id: "tablet",
    label: "TABLET.UNIT_01",
    frame: [1.6, 2.2, 0.05],
    screenInset: 0.08,
    batteryRatio: 0.3,
    cameraCount: 2,
    position: [0, 0, 0],
    scale: 1.0,
  },
  watch: {
    id: "watch",
    label: "WEARABLE.UNIT_01",
    frame: [0.36, 0.4, 0.08],
    screenInset: 0.04,
    batteryRatio: 0.4,
    cameraCount: 0,
    position: [0, 0, 0],
    scale: 1.0,
  },
  desktop: {
    id: "desktop",
    label: "DISPLAY.UNIT_01",
    frame: [2.6, 1.6, 0.06],
    screenInset: 0.1,
    batteryRatio: 0.0,
    cameraCount: 1,
    position: [0, 0, 0],
    scale: 1.0,
  },
  arGlasses: {
    id: "arGlasses",
    label: "SPATIAL.UNIT_01",
    frame: [0.7, 0.22, 0.04],
    screenInset: 0.02,
    batteryRatio: 0.2,
    cameraCount: 2,
    position: [0, 0, 0],
    scale: 1.0,
  },
};

// ─── Assembly Stage Timings ────────────────────────────────────────
// Precision-engineered intervals for each sub-assembly layer

const ASSEMBLY_STAGES = [
  { name: "frame",       delay: 0.0,  duration: 0.6 },
  { name: "glass",       delay: 0.5,  duration: 0.5 },
  { name: "display",     delay: 0.9,  duration: 0.5 },
  { name: "motherboard", delay: 1.3,  duration: 0.5 },
  { name: "battery",     delay: 1.7,  duration: 0.4 },
  { name: "camera",      delay: 2.0,  duration: 0.4 },
  { name: "os",          delay: 2.4,  duration: 0.6 },
  { name: "app",         delay: 2.9,  duration: 0.5 },
] as const;

// ─── Shared Materials ──────────────────────────────────────────────

function useAssemblyMaterials(opacity: number) {
  return useMemo(() => ({
    titaniumFrame: new THREE.MeshStandardMaterial({
      color: "#c8c8cc",
      roughness: 0.18,
      metalness: 0.92,
      transparent: true,
      opacity,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.02,
      transparent: true,
      opacity: 0.14 * opacity,
    }),
    display: new THREE.MeshStandardMaterial({
      color: "#0a0a10",
      roughness: 0.1,
      transparent: true,
      opacity: 0.9 * opacity,
    }),
    motherboard: new THREE.MeshStandardMaterial({
      color: "#1a2a1a",
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85 * opacity,
    }),
    battery: new THREE.MeshStandardMaterial({
      color: "#2a2a30",
      roughness: 0.35,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9 * opacity,
    }),
    cameraLens: new THREE.MeshStandardMaterial({
      color: "#0c0c14",
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity,
    }),
    osGlow: new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.08 * opacity,
    }),
    appBlock: new THREE.MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.06 * opacity,
    }),
  }), [opacity]);
}

// ─── Device Assembly Component ─────────────────────────────────────
// One component that renders and assembles any device profile

export function DeviceAssembly({
  profile,
  opacity = 1.0,
  autoPlay = true,
  assemblyDelay = 0,
}: {
  profile: DeviceProfile;
  opacity?: number;
  autoPlay?: boolean;
  assemblyDelay?: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const displayRef = useRef<THREE.Mesh>(null);
  const motherboardRef = useRef<THREE.Mesh>(null);
  const batteryRef = useRef<THREE.Mesh>(null);
  const cameraGroupRef = useRef<THREE.Group>(null);
  const osRef = useRef<THREE.Group>(null);
  const appRef = useRef<THREE.Group>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [assembled, setAssembled] = useState(false);

  const mats = useAssemblyMaterials(opacity);
  const [fw, fh, fd] = profile.frame;
  const si = profile.screenInset;

  // ── Build the GSAP assembly timeline ──
  const buildTimeline = useCallback(() => {
    const tl = gsap.timeline({ paused: true });

    // 1. Frame appears — slides up from below
    if (frameRef.current) {
      tl.fromTo(frameRef.current.position, { y: -2 }, { y: 0, duration: 0.6, ease: "power3.out" }, ASSEMBLY_STAGES[0].delay + assemblyDelay);
      tl.fromTo(frameRef.current.scale, { x: 0.8, y: 0.8, z: 0.8 }, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power2.out" }, ASSEMBLY_STAGES[0].delay + assemblyDelay);
    }

    // 2. Glass installs — drops from above onto frame
    if (glassRef.current) {
      tl.fromTo(glassRef.current.position, { y: 1.5, z: fd / 2 + 0.005 }, { y: 0, z: fd / 2 + 0.005, duration: 0.5, ease: "power2.inOut" }, ASSEMBLY_STAGES[1].delay + assemblyDelay);
      tl.fromTo(glassRef.current.scale, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" }, ASSEMBLY_STAGES[1].delay + assemblyDelay);
    }

    // 3. Display activates — opacity ramp from behind glass
    if (displayRef.current) {
      tl.fromTo(displayRef.current.scale, { x: 0, y: 0, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.out" }, ASSEMBLY_STAGES[2].delay + assemblyDelay);
    }

    // 4. Motherboard assembles — slides in from the rear
    if (motherboardRef.current) {
      tl.fromTo(motherboardRef.current.position, { z: -fd - 0.5 }, { z: -fd * 0.2, duration: 0.5, ease: "power3.out" }, ASSEMBLY_STAGES[3].delay + assemblyDelay);
      tl.fromTo(motherboardRef.current.scale, { x: 0, y: 0, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" }, ASSEMBLY_STAGES[3].delay + assemblyDelay);
    }

    // 5. Battery slides in — from the side
    if (batteryRef.current && profile.batteryRatio > 0) {
      tl.fromTo(batteryRef.current.position, { x: fw + 0.5 }, { x: 0, duration: 0.4, ease: "power3.inOut" }, ASSEMBLY_STAGES[4].delay + assemblyDelay);
      tl.fromTo(batteryRef.current.scale, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" }, ASSEMBLY_STAGES[4].delay + assemblyDelay + 0.1);
    }

    // 6. Camera modules lock — drop into position with micro-bounce
    if (cameraGroupRef.current && profile.cameraCount > 0) {
      tl.fromTo(cameraGroupRef.current.position, { y: 0.8 }, { y: 0, duration: 0.4, ease: "back.out(2.0)" }, ASSEMBLY_STAGES[5].delay + assemblyDelay);
      tl.fromTo(cameraGroupRef.current.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" }, ASSEMBLY_STAGES[5].delay + assemblyDelay);
    }

    // 7. OS projects — screen content fades in with scale
    if (osRef.current) {
      tl.fromTo(osRef.current.scale, { x: 0.5, y: 0.5, z: 1 }, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power2.out" }, ASSEMBLY_STAGES[6].delay + assemblyDelay);
    }

    // 8. Application launches — app icons pop in
    if (appRef.current) {
      tl.fromTo(appRef.current.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.4)" }, ASSEMBLY_STAGES[7].delay + assemblyDelay);
      tl.call(() => setAssembled(true));
    }

    return tl;
  }, [assemblyDelay, fd, fw, profile.batteryRatio, profile.cameraCount]);

  // ── Play on mount (if autoPlay) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const tl = buildTimeline();
      timelineRef.current = tl;
      if (autoPlay) {
        tl.play();
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [autoPlay, buildTimeline]);

  // ── Interaction hook ──
  const { handlers } = useInteractiveObject({
    id: `device-assembly-${profile.id}`,
    tooltip: `Inspect ${profile.label} assembly sequence`,
    cameraPosition: [profile.position[0], profile.position[1] + 0.4, profile.position[2] + 1.8],
    cameraTarget: profile.position,
    cameraFov: 38,
    onActivate: () => {
      // Replay assembly on click
      if (timelineRef.current) {
        setAssembled(false);
        timelineRef.current.restart();
      }
    },
  }, rootRef);

  // ── Gentle float once assembled ──
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (rootRef.current && assembled) {
      rootRef.current.position.y = profile.position[1] + Math.sin(t * 0.7 + profile.position[0]) * 0.04;
      rootRef.current.rotation.y = Math.sin(t * 0.3) * 0.025;
    }
  });

  // ── Camera module positions (evenly spaced along top-left back) ──
  const cameraPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < profile.cameraCount; i++) {
      positions.push([
        -fw * 0.25 + i * 0.12,
        fh * 0.35,
        -(fd / 2 + 0.015),
      ]);
    }
    return positions;
  }, [profile.cameraCount, fw, fh, fd]);

  return (
    <group
      ref={rootRef}
      position={profile.position}
      scale={[profile.scale, profile.scale, profile.scale]}
      name={`device-assembly-${profile.id}`}
      {...handlers}
    >
      {/* ── 1. Titanium Frame ── */}
      <mesh ref={frameRef} position={[0, -2, 0]}>
        <boxGeometry args={[fw, fh, fd]} />
        <primitive object={mats.titaniumFrame} attach="material" />
      </mesh>

      {/* ── 2. Glass Panel ── */}
      <mesh ref={glassRef} position={[0, 1.5, fd / 2 + 0.005]}>
        <boxGeometry args={[fw - si, fh - si, 0.004]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>

      {/* ── 3. Display Layer ── */}
      <mesh ref={displayRef} position={[0, 0, fd / 2 + 0.002]} scale={[0, 0, 1]}>
        <boxGeometry args={[fw - si - 0.02, fh - si - 0.02, 0.002]} />
        <primitive object={mats.display} attach="material" />
      </mesh>

      {/* ── 4. Motherboard ── */}
      <mesh ref={motherboardRef} position={[0, 0, -(fd + 0.5)]} scale={[0, 0, 1]}>
        <boxGeometry args={[fw * 0.7, fh * 0.5, 0.012]} />
        <primitive object={mats.motherboard} attach="material" />
      </mesh>

      {/* ── 5. Battery Cell ── */}
      {profile.batteryRatio > 0 && (
        <mesh ref={batteryRef} position={[fw + 0.5, -fh * 0.15, -fd * 0.1]} scale={[0, 1, 1]}>
          <boxGeometry args={[fw * 0.6, fh * profile.batteryRatio, fd * 0.6]} />
          <primitive object={mats.battery} attach="material" />
        </mesh>
      )}

      {/* ── 6. Camera Modules ── */}
      {profile.cameraCount > 0 && (
        <group ref={cameraGroupRef} position={[0, 0.8, 0]} scale={[0, 0, 0]}>
          {cameraPositions.map((pos, i) => (
            <group key={i} position={pos}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.025, 16]} />
                <primitive object={mats.cameraLens} attach="material" />
              </mesh>
              {/* Lens ring */}
              <mesh position={[0, 0, -0.014]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.035, 0.004, 8, 16]} />
                <primitive object={mats.titaniumFrame} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ── 7. Operating System Projection ── */}
      <group ref={osRef} position={[0, 0, fd / 2 + 0.01]} scale={[0.5, 0.5, 1]}>
        {/* Status bar */}
        <mesh position={[0, fh * 0.42, 0]}>
          <boxGeometry args={[fw - si - 0.04, 0.04, 0.001]} />
          <primitive object={mats.osGlow} attach="material" />
        </mesh>
        {/* Navigation bar */}
        <mesh position={[0, -fh * 0.42, 0]}>
          <boxGeometry args={[fw * 0.25, 0.012, 0.001]} />
          <primitive object={mats.osGlow} attach="material" />
        </mesh>
      </group>

      {/* ── 8. Application Blocks ── */}
      <group ref={appRef} position={[0, 0, fd / 2 + 0.014]} scale={[0, 0, 0]}>
        {/* App grid (2x2) */}
        {[
          [-fw * 0.15, fh * 0.12],
          [fw * 0.15, fh * 0.12],
          [-fw * 0.15, -fh * 0.08],
          [fw * 0.15, -fh * 0.08],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[fw * 0.22, fh * 0.12, 0.001]} />
            <primitive object={mats.appBlock} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ── Label ── */}
      <Text position={[0, -fh / 2 - 0.2, 0]} fontSize={0.05} color="#88888c" font="/fonts/Inter-Bold.ttf">
        {profile.label}
      </Text>
    </group>
  );
}

// ─── Assembly Line ─────────────────────────────────────────────────
// Renders a configurable row of devices with staggered assembly timings

export interface AssemblyLineConfig {
  devices: (DeviceProfile & { assemblyDelay?: number })[];
  opacity?: number;
}

export function DeviceAssemblyLine({
  config,
}: {
  config: AssemblyLineConfig;
}) {
  return (
    <group name="device-assembly-line">
      {config.devices.map((device) => (
        <DeviceAssembly
          key={device.id}
          profile={device}
          opacity={config.opacity}
          autoPlay
          assemblyDelay={device.assemblyDelay ?? 0}
        />
      ))}
    </group>
  );
}

// ─── Default Assembly Line Preset ──────────────────────────────────
// Five devices staggered across a curved arc

export function DefaultAssemblyShowcase({
  opacity = 1.0,
}: {
  opacity?: number;
}) {
  const devices: (DeviceProfile & { assemblyDelay: number })[] = useMemo(() => [
    { ...DEVICE_PROFILES.phone, id: "asm-phone", position: [-3.0, 0.3, 0.5], scale: 0.9, assemblyDelay: 0.0 },
    { ...DEVICE_PROFILES.tablet, id: "asm-tablet", position: [-1.0, 0.5, -0.8], scale: 0.7, assemblyDelay: 0.6 },
    { ...DEVICE_PROFILES.watch, id: "asm-watch", position: [1.0, 0.2, 0.3], scale: 1.4, assemblyDelay: 1.2 },
    { ...DEVICE_PROFILES.desktop, id: "asm-desktop", position: [3.2, 0.8, -1.0], scale: 0.55, assemblyDelay: 1.8 },
    { ...DEVICE_PROFILES.arGlasses, id: "asm-ar", position: [0.0, 1.2, -2.0], scale: 1.3, assemblyDelay: 2.4 },
  ], []);

  return (
    <group name="default-assembly-showcase">
      <DeviceAssemblyLine config={{ devices, opacity }} />
    </group>
  );
}

export default DeviceAssembly;
