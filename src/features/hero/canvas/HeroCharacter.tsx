"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface HeroCharacterProps {
  position?: [number, number, number];
}

export default function HeroCharacter({
  position = [0, -0.5, 1.5],
}: HeroCharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Floating movement translation
    meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.04;
  });

  return (
    <mesh ref={meshRef} position={position} name="hero-pilot-avatar">
      <octahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        wireframe
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}
