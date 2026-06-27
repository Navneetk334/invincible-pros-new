"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";
import { useInteractiveObject } from "@core/interaction/use-interaction";
import MobileLab from "./MobileLab";
import { DefaultAssemblyShowcase } from "./DeviceAssembly";
import LiveAppPreview from "./LiveAppPreview";

interface FactoryProps {
  opacity: number;
  transitionProgress?: number;
  isExiting?: boolean;
}

// Seeded deterministic random generator for linter purity compliance
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

// 1. Reusable Handheld Device Viewport component
export function MobilePreviewDevice({
  position,
  aspectRatio,
  label,
  scale = 1.0,
  opacity = 1.0,
  unfoldFactor = 1.0,
}: {
  position: [number, number, number];
  aspectRatio: number;
  label: string;
  scale?: number;
  opacity?: number;
  unfoldFactor?: number;
}) {
  const deviceRef = useRef<THREE.Group>(null);
  const layoutRef = useRef<THREE.Group>(null);

  const width = 1.25;
  const height = width / aspectRatio;

  const { bezelMaterial, glassMaterial, blockMaterial } = useMemo(() => {
    return {
      bezelMaterial: new THREE.MeshStandardMaterial({
        color: "#0a0a0d",
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity,
      }),
      glassMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.05,
        transparent: true,
        opacity: 0.16 * opacity,
      }),
      blockMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.08 * opacity,
      }),
    };
  }, [opacity]);

  // Assembly Register
  useAssemblyRegister({
    id: `mobile-device-${label}-${position.join("-")}`,
    ref: deviceRef,
    stage: "glass",
    animateIn: () => {
      if (!deviceRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        deviceRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.4, ease: "back.out(1.1)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!deviceRef.current) return;
      const tl = gsap.timeline();
      tl.to(deviceRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: `mobile-device-${label}`,
    tooltip: `Inspect ${label} application view`,
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.5],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, deviceRef);

  // Gentle float once unfolded
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (deviceRef.current && unfoldFactor >= 1.0) {
      deviceRef.current.position.y = position[1] + Math.sin(time * 0.8 + position[0]) * 0.05;
      deviceRef.current.rotation.y = Math.sin(time * 0.4) * 0.03;
    }
    if (layoutRef.current) {
      // Simulate responsive viewport wrapping loops
      const stretch = 0.85 + Math.sin(time * 1.1) * 0.08;
      layoutRef.current.scale.x = stretch;
    }
  });

  return (
    <group ref={deviceRef} position={position} scale={[scale, scale, scale]} name="mobile-device" {...handlers}>
      {/* Device Bezel Shell */}
      <mesh>
        <boxGeometry args={[width, height, 0.05]} />
        <primitive object={bezelMaterial} attach="material" />
      </mesh>

      {/* Screen Visor Glass */}
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[width - 0.08, height - 0.08, 0.005]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Synchronized layout preview grids */}
      <group ref={layoutRef} position={[0, 0, 0.029]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[width - 0.16, 0.15, 0.002]} />
          <primitive object={blockMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.2, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.002]} />
          <primitive object={blockMaterial} attach="material" />
        </mesh>
        <mesh position={[0.2, 0.05, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.002]} />
          <primitive object={blockMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[width - 0.16, 0.4, 0.002]} />
          <primitive object={blockMaterial} attach="material" />
        </mesh>
      </group>

      {/* Mobile Label Text */}
      <Text position={[0, -height / 2 - 0.18, 0]} fontSize={0.07} color="#aaaaaa" font="/fonts/Inter-Bold.ttf">
        {label.toUpperCase()}
      </Text>
    </group>
  );
}

// 2. Holographic Widget Controller Maps
export function WidgetStateTree({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const treeRef = useRef<THREE.Group>(null);

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
        { x: scale, y: scale, z: scale, duration: 1.4, ease: "back.out(1.2)" },
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
    id: "widget-state-tree",
    tooltip: "Inspect navigation view state hierarchy",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.5],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 40,
  }, treeRef);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (treeRef.current) {
      treeRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]} name="widget-tree" {...handlers}>
      {/* Root Router Widget */}
      <Text position={[0, 0.5, 0]} fontSize={0.07} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        [VIEW_ROUTER]
      </Text>

      {/* Child Controllers */}
      <Text position={[-0.4, 0.05, 0]} fontSize={0.055} color="#cccccc" font="/fonts/Inter-Bold.ttf">
        [LIST_VIEW]
      </Text>
      <Text position={[0.4, 0.05, 0]} fontSize={0.055} color="#cccccc" font="/fonts/Inter-Bold.ttf">
        [DETAIL_VIEW]
      </Text>

      {/* State Node */}
      <Text position={[0, -0.4, 0]} fontSize={0.06} color="#88888c" font="/fonts/Inter-Bold.ttf">
        [REDUX_STORE]
      </Text>

      {/* Branch rods */}
      <mesh position={[-0.2, 0.27, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.004, 0.004, 0.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
      <mesh position={[0.2, 0.27, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.004, 0.004, 0.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 * opacity} />
      </mesh>
    </group>
  );
}

// 3. Interactive Prototype Dial Console
export function PrototypeConsole({
  position,
  scale = 1.0,
  opacity = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const consoleRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Mesh>(null);
  const [clickCount, setClickCount] = useState(0);

  const { metalMaterial, emissiveMaterial } = useMemo(() => {
    return {
      metalMaterial: new THREE.MeshStandardMaterial({
        color: "#08080a",
        roughness: 0.3,
        metalness: 0.95,
        transparent: true,
        opacity,
      }),
      emissiveMaterial: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.1,
        transparent: true,
        opacity: 0.15 * opacity,
      }),
    };
  }, [opacity]);

  // Register assembly
  useAssemblyRegister({
    id: `prototype-console-${position.join("-")}`,
    ref: consoleRef,
    stage: "glass",
    animateIn: () => {
      if (!consoleRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        consoleRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: scale, y: scale, z: scale, duration: 1.3, ease: "back.out(1.1)" },
        0
      );
      return tl;
    },
    animateOut: () => {
      if (!consoleRef.current) return;
      const tl = gsap.timeline();
      tl.to(consoleRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" });
      return tl;
    },
  });

  const { handlers } = useInteractiveObject({
    id: "prototype-console",
    tooltip: "Simulate widget grid layout testing",
    cameraPosition: [position[0], position[1] + 0.3, position[2] + 1.2],
    cameraTarget: [position[0], position[1], position[2]],
    cameraFov: 36,
    onActivate: () => {
      setClickCount((prev) => prev + 1);
      if (dialRef.current) {
        gsap.to(dialRef.current.rotation, {
          z: clickCount * (Math.PI / 4),
          duration: 0.6,
          ease: "back.out(1.2)",
        });
      }
    },
  }, consoleRef);

  return (
    <group ref={consoleRef} position={position} scale={[scale, scale, scale]} name="console" {...handlers}>
      {/* Console Base Dial Chassis */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 12]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Rotating control dial knob */}
      <mesh ref={dialRef} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 12]} />
        <primitive object={emissiveMaterial} attach="material" />
      </mesh>

      {/* Indicator LED line */}
      <mesh position={[0, 0.091, -0.25]}>
        <boxGeometry args={[0.04, 0.01, 0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Monospaced Dial label */}
      <Text position={[0, -0.15, 0.52]} fontSize={0.06} color="#88888c" font="/fonts/Inter-Bold.ttf">
        PROTOTYPE.DIAL_SYS
      </Text>
    </group>
  );
}

// 4. API Packet Rails (Pulsing data feeds connecting backend to devices)
export function APIPacketRails({
  position,
  opacity = 1.0,
}: {
  position: [number, number, number];
  opacity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 40;

  const { initialPositions, speeds } = useMemo(() => {
    const rand = createRandom(6060);
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (rand() - 0.5) * 0.4;
      pos[idx + 1] = (rand() - 0.5) * 2.8;
      pos[idx + 2] = (rand() - 0.5) * 0.4;
      spds[i] = 0.015 + rand() * 0.02;
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
          if (arr[idx] > 1.4) {
            arr[idx] = -1.4; // Loop back base
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group position={position} name="api-packet-rails">
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.025} transparent opacity={0.4 * opacity} sizeAttenuation />
      </points>
    </group>
  );
}

// Main aggregated MobileAppFactory component
export default function MobileAppFactory({
  opacity = 1.0,
  transitionProgress = 0,
  isExiting = false,
}: FactoryProps) {
  const transitionGroupRef = useRef<THREE.Group>(null);

  // Unfolding entry transformation mapping 0.5 -> 1.0 transition progress
  useFrame(() => {
    if (transitionGroupRef.current) {
      if (!isExiting && transitionProgress > 0) {
        const unfoldFactor = Math.min(Math.max((transitionProgress - 0.5) * 2.0, 0.0), 1.0);

        // Lerp position from AI Core [0, 2.0, -3.0] to final factory slot [0, 0.0, 0.0]
        const startPos = new THREE.Vector3(0, 2.0, -3.0);
        const finalPos = new THREE.Vector3(0, 0.0, 0.0);
        transitionGroupRef.current.position.lerpVectors(startPos, finalPos, unfoldFactor);

        // Scale expands from 0.01 to 1.0
        const startScale = new THREE.Vector3(0.01, 0.01, 0.01);
        const finalScale = new THREE.Vector3(1, 1, 1);
        transitionGroupRef.current.scale.lerpVectors(startScale, finalScale, unfoldFactor);
      } else {
        // Reset transforms
        transitionGroupRef.current.position.set(0, 0, 0);
        transitionGroupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  // Calculate unfold factor for devices oscillations
  const unfoldFactor = isExiting ? 1.0 : Math.min(Math.max((transitionProgress - 0.5) * 2.0, 0.0), 1.0);

  return (
    <group ref={transitionGroupRef} name="mobile-app-factory">
      {/* Base Grid helper */}
      <gridHelper args={[24, 24, "#0f0f12", "#08080a"]} position={[0, -1.2, 0]} />

      {/* 1. Device Preview Cluster (Android, iOS, Tablet aspect displays) */}
      <MobilePreviewDevice position={[-2.2, 0.4, -1.5]} aspectRatio={0.562} label="Android build" scale={0.95} opacity={opacity} unfoldFactor={unfoldFactor} />
      <MobilePreviewDevice position={[0, 0.2, 0]} aspectRatio={0.48} label="iOS main build" scale={1.0} opacity={opacity} unfoldFactor={unfoldFactor} />
      <MobilePreviewDevice position={[2.2, 0.6, -1.2]} aspectRatio={0.75} label="Tablet build" scale={1.05} opacity={opacity} unfoldFactor={unfoldFactor} />

      {/* 2. Holographic Navigation/Widget State tree */}
      <WidgetStateTree position={[-2.4, 0.8, 1.2]} scale={1.0} opacity={opacity} />

      {/* 3. Interactive State Testing Prototype console */}
      <PrototypeConsole position={[2.5, -0.4, 1.4]} scale={0.9} opacity={opacity} />

      {/* 4. API payload particle stream pipes */}
      <APIPacketRails position={[-1.2, 0.2, -0.6]} opacity={opacity} />
      <APIPacketRails position={[1.2, 0.2, -0.6]} opacity={opacity} />

      {/* 5. Engineering Laboratory Environment */}
      <MobileLab opacity={opacity} />

      {/* 6. Device Assembly Showcase (precision robotics staging) */}
      <group position={[0, 0, 4.5]}>
        <DefaultAssemblyShowcase opacity={opacity} />
      </group>

      {/* 7. Live Application Preview Engine */}
      <LiveAppPreview opacity={opacity} />
    </group>
  );
}
export { MobileAppFactory };
