"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useAssemblyRegister } from "@core/assembly/use-assembly";

interface HQDigitalHighwaysProps {
  opacity?: number;
}

const FLOWING_POINTS_COUNT = 60;

// Seeded random coordinate generator for purity
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export default function HQDigitalHighways({ opacity = 1.0 }: HQDigitalHighwaysProps) {
  const highwaysRef = useRef<THREE.Group>(null);
  const geomHRef = useRef<THREE.BufferGeometry>(null);
  const geomVRef = useRef<THREE.BufferGeometry>(null);

  // Pre-calculate initial positions for data particles inside channels
  const { initialHPoints, initialVPoints } = useMemo(() => {
    const hArr = new Float32Array(FLOWING_POINTS_COUNT * 3);
    const vArr = new Float32Array(FLOWING_POINTS_COUNT * 3);

    const randH = createRandom(5050);
    const randV = createRandom(6060);

    for (let i = 0; i < FLOWING_POINTS_COUNT; i++) {
      const idx = i * 3;
      // Horizontal Highway 1: runs along X (-4.0 to 4.0), at Y = -1.2, Z = -0.5
      hArr[idx] = (randH() - 0.5) * 8.0;
      hArr[idx + 1] = -1.2 + (randH() - 0.5) * 0.05;
      hArr[idx + 2] = -0.5 + (randH() - 0.5) * 0.4;

      // Vertical Highway 2: runs along Z (-3.5 to 3.5), at X = -1.0, Y = -1.5
      vArr[idx] = -1.0 + (randV() - 0.5) * 0.3;
      vArr[idx + 1] = -1.5 + (randV() - 0.5) * 0.05;
      vArr[idx + 2] = (randV() - 0.5) * 7.0;
    }

    return { initialHPoints: hArr, initialVPoints: vArr };
  }, []);

  // Register with Procedural Assembly System at the energy lines stage
  useAssemblyRegister({
    id: "hq-data-highways-assembly",
    ref: highwaysRef,
    stage: "energy",
    animateIn: () => {
      if (!highwaysRef.current) return;
      const tl = gsap.timeline();
      highwaysRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          tl.fromTo(
            child.scale,
            { x: 0, z: 0 },
            { x: 1, z: 1, duration: 1.0, ease: "power2.out" },
            0.0
          );
        }
      });
      return tl;
    },
    animateOut: () => {
      if (!highwaysRef.current) return;
      const tl = gsap.timeline();
      highwaysRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          tl.to(
            child.scale,
            { x: 0, z: 0, duration: 0.6, ease: "power2.in" },
            0.0
          );
        }
      });
      return tl;
    },
  });

  useFrame(() => {
    // 1. Animate horizontal highway data particles
    if (geomHRef.current) {
      const posAttr = geomHRef.current.getAttribute("position") as THREE.BufferAttribute;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < FLOWING_POINTS_COUNT; i++) {
          const idx = i * 3;
          arr[idx] += 0.035; // Move right along X
          if (arr[idx] > 4.0) {
            arr[idx] = -4.0; // Wrap back to left edge
          }
        }
        posAttr.needsUpdate = true;
      }
    }

    // 2. Animate depth-wise vertical highway data particles
    if (geomVRef.current) {
      const posAttr = geomVRef.current.getAttribute("position") as THREE.BufferAttribute;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < FLOWING_POINTS_COUNT; i++) {
          const idx = i * 3;
          arr[idx + 2] += 0.03; // Move forward along Z
          if (arr[idx + 2] > 3.5) {
            arr[idx + 2] = -3.5; // Wrap back to deep edge
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={highwaysRef} name="hq-data-highways">
      {/* Horizontal Transparent Highway Slab */}
      <mesh position={[0, -1.21, -0.5]}>
        <boxGeometry args={[8.0, 0.03, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.1 * opacity}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Depth-wise Vertical Transparent Highway Slab */}
      <mesh position={[-1.0, -1.51, 0.0]}>
        <boxGeometry args={[0.5, 0.03, 7.0]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08 * opacity}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Horizontal Data Particles */}
      <points>
        <bufferGeometry ref={geomHRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[initialHPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.035}
          transparent
          opacity={0.6 * opacity}
          sizeAttenuation
        />
      </points>

      {/* Depth-wise Data Particles */}
      <points>
        <bufferGeometry ref={geomVRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[initialVPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.03}
          transparent
          opacity={0.5 * opacity}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
export { HQDigitalHighways };
