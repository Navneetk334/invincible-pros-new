"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";

interface FactoryProps {
  opacity: number;
  transitionProgress?: number;
  isExiting?: boolean;
}

// Deterministic seed-based random coordinate generator for linter compliance
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// 1. Device Preview Wall (Synchronized aspect ratio frames)
export function DevicePreviewFrame({
  position,
  aspectRatio,
  label,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  aspectRatio: number; // width / height
  label: string;
  scale?: number;
  opacity?: number;
}) {
  const frameRef = useRef<THREE.Group>(null);
  const contentRef = useRef<THREE.Group>(null);

  const width = 1.6;
  const height = width / aspectRatio;

  const { borderMaterial, glassMaterial, gridMaterial } = useMemo(() => {
    return {
      borderMaterial: new THREE.MeshStandardMaterial({
        color: "#0a0a0c",
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity,
      }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.12 * opacity,
      }),
      gridMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.08 * opacity,
      }),
    };
  }, [opacity]);

  // Register with Procedural Assembly
  useAssemblyRegister({
    id: `device-frame-${label}-${position.join("-")}`,
    ref: frameRef,
    stage: "glass",
    animateIn: () => {
      if (!frameRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        frameRef.current.position,
        { y: position[1] - 2 },
        { y: position[1], duration: 1.4, ease: "power3.out" },
        0
      );
      tl.fromTo(
        frameRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.1, ease: "back.out(1.1)" },
        0.1
      );
      return tl;
    },
    animateOut: () => {
      if (!frameRef.current) return;
      const tl = gsap.timeline();
      tl.to(
        frameRef.current.scale,
        { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.in" },
        0
      );
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `device-frame-${label}`,
    tooltip: `Inspect ${label} viewport grid`,
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.6],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 42,
  }, frameRef);

  // Synchronized layout responsive scaling grid
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (contentRef.current) {
      // Simulate layout responsive wrapping inside the window aspect bounds
      const stretch = 0.85 + Math.sin(time * 0.9) * 0.1;
      contentRef.current.scale.x = stretch;
    }
  });

  return (
    <group ref={frameRef} position={position} scale={[scale, scale, scale]} name="device-frame" {...handlers}>
      {/* Device Frame Bezel */}
      <mesh>
        <boxGeometry args={[width, height, 0.04]} />
        <primitive object={borderMaterial} attach="material" />
      </mesh>

      {/* Screen Glass */}
      <mesh position={[0, 0, 0.021]}>
        <boxGeometry args={[width - 0.08, height - 0.08, 0.005]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Synchronized Grid Content */}
      <group ref={contentRef} position={[0, 0, 0.024]}>
        <mesh position={[-0.3, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.002]} />
          <primitive object={gridMaterial} attach="material" />
        </mesh>
        <mesh position={[0.3, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.002]} />
          <primitive object={gridMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1.0, 0.2, 0.002]} />
          <primitive object={gridMaterial} attach="material" />
        </mesh>
      </group>

      {/* Device Label Text */}
      <Text position={[0, -height / 2 - 0.15, 0]} fontSize={0.08} color="#cccccc" font="/fonts/Inter-Bold.ttf">
        {label.toUpperCase()}
      </Text>
    </group>
  );
}

// 2. Interactive Code Editor Panel (Real React structures)
export function CodeEditorPanel({ position, scale = 1.0, opacity = 1.0 }: { position: [number, number, number]; scale?: number; opacity?: number }) {
  const panelRef = useRef<THREE.Group>(null);
  const [lineHighlight, setLineHighlight] = useState(0);

  const { frameMaterial, glassMaterial } = useMemo(() => {
    return {
      frameMaterial: new THREE.MeshStandardMaterial({
        color: "#050508",
        roughness: 0.3,
        metalness: 0.9,
        transparent: true,
        opacity,
      }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.05,
        transparent: true,
        opacity: 0.15 * opacity,
      }),
    };
  }, [opacity]);

  // Register with Procedural Assembly
  useAssemblyRegister({
    id: `code-editor-${position.join("-")}`,
    ref: panelRef,
    stage: "hologram",
    animateIn: () => {
      if (!panelRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        panelRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.5, ease: "power2.out" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!panelRef.current) return;
      const tl = gsap.timeline();
      tl.to(
        panelRef.current.scale,
        { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" },
        0
      );
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "code-editor",
    tooltip: "Inspect React code structures",
    cameraPosition: [position[0], position[1] + 0.2, position[2] + 1.2],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 36,
  }, panelRef);

  // Cycle highlighted lines slowly
  useEffect(() => {
    const timer = setInterval(() => {
      setLineHighlight((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <group ref={panelRef} position={position} scale={[scale, scale, scale]} name="code-editor" {...handlers}>
      {/* Chassis Frame */}
      <mesh>
        <boxGeometry args={[1.5, 1.8, 0.03]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Editor Screen Visor */}
      <mesh position={[0, 0, 0.016]}>
        <boxGeometry args={[1.44, 1.72, 0.005]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Code Editor Header */}
      <Text position={[-0.45, 0.72, 0.02]} fontSize={0.06} color="#888888" font="/fonts/Inter-Bold.ttf">
        ecosystem.tsx
      </Text>

      {/* Line Indicator Highlight Bar */}
      <mesh position={[0, 0.35 - lineHighlight * 0.18, 0.018]}>
        <planeGeometry args={[1.38, 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>

      {/* Realistic Code Lines */}
      <group position={[-0.6, 0.35, 0.02]}>
        <Text position={[0.42, 0.18, 0]} fontSize={0.05} color="#e2e8f0" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"import { useState } from 'react';"}
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.05} color="#a1a1aa" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"export function Platform() {"}
        </Text>
        <Text position={[0.1, -0.18, 0]} fontSize={0.05} color="#34d399" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"const [nodes] = useState(128);"}
        </Text>
        <Text position={[0.1, -0.36, 0]} fontSize={0.05} color="#60a5fa" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"return <Grid scale={nodes} />;"}
        </Text>
        <Text position={[0, -0.54, 0]} fontSize={0.05} color="#a1a1aa" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"}"}
        </Text>
      </group>
    </group>
  );
}

// 3. Live Deployment Terminal (Turbopack compilation logs)
export function DeploymentTerminal({ position, scale = 1.0, opacity = 1.0 }: { position: [number, number, number]; scale?: number; opacity?: number }) {
  const terminalRef = useRef<THREE.Group>(null);
  const [compilationCount, setCompilationCount] = useState(1);

  const { frameMaterial, screenMaterial } = useMemo(() => {
    return {
      frameMaterial: new THREE.MeshStandardMaterial({
        color: "#050507",
        roughness: 0.35,
        metalness: 0.9,
        transparent: true,
        opacity,
      }),
      screenMaterial: new THREE.MeshStandardMaterial({
        color: "#0c0a0f",
        transparent: true,
        opacity: 0.8 * opacity,
      }),
    };
  }, [opacity]);

  // Register with Procedural Assembly
  useAssemblyRegister({
    id: `deployment-terminal-${position.join("-")}`,
    ref: terminalRef,
    stage: "hologram",
    animateIn: () => {
      if (!terminalRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        terminalRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.4, ease: "power2.out" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!terminalRef.current) return;
      const tl = gsap.timeline();
      tl.to(
        terminalRef.current.scale,
        { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" },
        0
      );
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "deployment-terminal",
    tooltip: "Inspect terminal deployment logs",
    cameraPosition: [position[0], position[1] + 0.2, position[2] + 1.2],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 36,
  }, terminalRef);

  // Trigger rebuild logs periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCompilationCount((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <group ref={terminalRef} position={position} scale={[scale, scale, scale]} name="deployment-terminal" {...handlers}>
      {/* Bezel frame container */}
      <mesh>
        <boxGeometry args={[1.4, 1.1, 0.04]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* CRT Screen Visor */}
      <mesh position={[0, 0, 0.021]}>
        <boxGeometry args={[1.34, 1.04, 0.005]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>

      {/* Terminal Title Header */}
      <Text position={[-0.48, 0.38, 0.025]} fontSize={0.05} color="#888888" font="/fonts/Inter-Bold.ttf">
        SHELL: NEXT.JS COMPILER
      </Text>

      {/* Glowing Status Dot */}
      <mesh position={[0.5, 0.38, 0.025]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>

      {/* Live build logs text lines */}
      <group position={[-0.55, 0.15, 0.025]}>
        <Text position={[0, 0.05, 0]} fontSize={0.045} color="#34d399" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"▲ NEXT.JS (TURBOPACK)"}
        </Text>
        <Text position={[0, -0.12, 0]} fontSize={0.042} color="#ffffff" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {`- compile run: v${compilationCount}.2.0`}
        </Text>
        <Text position={[0, -0.24, 0]} fontSize={0.042} color="#ffffff" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"✓ compiled successfully in 142ms"}
        </Text>
        <Text position={[0, -0.36, 0]} fontSize={0.042} color="#f59e0b" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {"● static page generation: complete"}
        </Text>
      </group>
    </group>
  );
}

// 4. Expanding Glass Architecture Cards
export function ExpandingProjectCard({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const cardRef = useRef<THREE.Group>(null);
  const [expanded, setExpanded] = useState(false);

  const { frameMaterial, glassMaterial } = useMemo(() => {
    return {
      frameMaterial: new THREE.MeshStandardMaterial({
        color: "#08080a",
        roughness: 0.3,
        transparent: true,
        opacity,
      }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.05,
        transparent: true,
        opacity: 0.15 * opacity,
      }),
    };
  }, [opacity]);

  // Register with Procedural Assembly
  useAssemblyRegister({
    id: `project-card-${position.join("-")}`,
    ref: cardRef,
    stage: "glass",
    animateIn: () => {
      if (!cardRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        cardRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "back.out(1.1)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!cardRef.current) return;
      const tl = gsap.timeline();
      tl.to(
        cardRef.current.scale,
        { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" },
        0
      );
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `project-card-${position.join("-")}`,
    tooltip: "Inspect project directory files",
    cameraPosition: [position[0], position[1] + 0.1, position[2] + 1.2],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 38,
    onActivate: () => {
      setExpanded((prev) => !prev);
      if (cardRef.current) {
        gsap.to(cardRef.current.scale, {
          x: expanded ? scale : scale * 1.2,
          y: expanded ? scale : scale * 1.15,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    },
  }, cardRef);

  return (
    <group ref={cardRef} position={position} scale={[scale, scale, scale]} name="project-card" {...handlers}>
      {/* Outer casing */}
      <mesh>
        <boxGeometry args={[1.2, 0.7, 0.03]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Screen view */}
      <mesh position={[0, 0, 0.016]}>
        <boxGeometry args={[1.14, 0.64, 0.005]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* File Structure text */}
      <group position={[-0.45, 0.15, 0.02]}>
        <Text position={[0, 0, 0]} fontSize={0.065} color="#ffffff" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {expanded ? "src/components" : "src/dir"}
        </Text>
        <Text position={[0, -0.15, 0]} fontSize={0.045} color="#a1a1aa" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {expanded ? "- button.tsx" : "- package.json"}
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.045} color="#a1a1aa" font="/fonts/Inter-Bold.ttf" anchorX="left">
          {expanded ? "- platform.tsx" : "- tsconfig.json"}
        </Text>
      </group>
    </group>
  );
}

// 5. Code Stream Particle Rails
export function CodeStreamRails({ position, opacity = 1.0 }: { position: [number, number, number]; opacity?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 60;

  const { initialPositions, speeds } = useMemo(() => {
    const rand = createRandom(2026);
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (rand() - 0.5) * 0.7;
      pos[idx + 1] = (rand() - 0.5) * 3.4;
      pos[idx + 2] = (rand() - 0.5) * 0.7;
      spds[i] = 0.012 + rand() * 0.018;
    }
    return { initialPositions: pos, speeds: spds };
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const idx = i * 3 + 1; // Y axis
          arr[idx] += speeds[i];
          if (arr[idx] > 1.7) {
            arr[idx] = -1.7; // Loop back bottom boundary
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group position={position} name="code-streams">
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.025} transparent opacity={0.45 * opacity} sizeAttenuation />
      </points>
    </group>
  );
}

// Main upgraded WebDevFactory world aggregation wrapper
export default function WebDevFactory({
  opacity = 1.0,
  transitionProgress = 0,
  isExiting = false,
}: FactoryProps) {
  const transitionGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (transitionGroupRef.current) {
      if (isExiting && transitionProgress > 0) {
        // Map 0.0 -> 0.5 transition window to a full 0.0 -> 1.0 collapse progress
        const progress = Math.min(transitionProgress * 2.0, 1.0);

        // 1. Position merging towards AI Core coordinates [0, 2, -1]
        const startPos = new THREE.Vector3(0, 0, 0);
        const targetPos = new THREE.Vector3(0, 2.0, -1.0);
        transitionGroupRef.current.position.lerpVectors(startPos, targetPos, progress);

        // 2. Scale folding into thin layer sheet
        const startScale = new THREE.Vector3(1, 1, 1);
        const targetScale = new THREE.Vector3(0.01, 0.01, 0.001);
        transitionGroupRef.current.scale.lerpVectors(startScale, targetScale, progress);

        // 3. Continuous spin alignment
        transitionGroupRef.current.rotation.y = progress * Math.PI;
      } else {
        // Safe resets on focus return
        transitionGroupRef.current.position.set(0, 0, 0);
        transitionGroupRef.current.scale.set(1, 1, 1);
        transitionGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  return (
    <group ref={transitionGroupRef} name="web-dev-factory">
      {/* Base grid layout */}
      <gridHelper args={[24, 24, "#0f0f11", "#08080a"]} position={[0, -1.2, 0]} />

      {/* 1. Device Preview Wall (Aligned Aspect Ratio Screens) */}
      <DevicePreviewFrame position={[-3.2, 0.4, -2.2]} aspectRatio={0.562} label="Mobile preview" scale={1.0} opacity={opacity} />
      <DevicePreviewFrame position={[-1.2, 0.6, -2.2]} aspectRatio={0.75} label="Tablet preview" scale={1.05} opacity={opacity} />
      <DevicePreviewFrame position={[1.4, 0.8, -2.4]} aspectRatio={1.6} label="Desktop view" scale={1.1} opacity={opacity} />

      {/* 2. Interactive Code Editor Panel */}
      <CodeEditorPanel position={[-2.8, 0.8, 1.2]} scale={1.0} opacity={opacity} />

      {/* 3. Live Deployment Terminal */}
      <DeploymentTerminal position={[2.8, 0.6, -0.6]} scale={1.0} opacity={opacity} />

      {/* 4. Expanding Directory Project Cards */}
      <ExpandingProjectCard position={[2.6, -0.2, 1.4]} scale={0.95} opacity={opacity} />
      <ExpandingProjectCard position={[0.2, -0.6, -3.2]} scale={0.85} opacity={opacity} />

      {/* 5. Code Stream particle columns */}
      <CodeStreamRails position={[-1.6, 0.2, -0.8]} opacity={opacity} />
      <CodeStreamRails position={[0.8, 0.2, -1.4]} opacity={opacity} />
      <CodeStreamRails position={[2.4, 0.2, 0.6]} opacity={opacity} />
    </group>
  );
}
export { WebDevFactory };
