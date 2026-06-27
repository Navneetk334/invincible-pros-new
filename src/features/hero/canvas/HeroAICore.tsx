"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "../store/use-hero-store";

interface HeroAICoreProps {
  radius?: number;
  segments?: number;
  wireframe?: boolean;
}

export default function HeroAICore({
  radius = 0.8,
  segments = 32,
  wireframe = true,
}: HeroAICoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightColor = useHeroStore((state) => state.lightColor);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.1;
    
    // Procedural pulse scaling
    const scaleFactor = 1.0 + Math.sin(time * 2.0) * 0.04;
    meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} name="hero-ai-core">
      <sphereGeometry args={[radius, segments, segments]} />
      <meshStandardMaterial
        color={lightColor}
        roughness={0.2}
        metalness={0.9}
        wireframe={wireframe}
      />
    </mesh>
  );
}
