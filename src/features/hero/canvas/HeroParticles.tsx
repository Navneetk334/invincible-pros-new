"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useHeroStore } from "../store/use-hero-store";
import { useExperienceStore } from "@store/use-experience-store";

// Generate positions outside the component to remain pure for the React compiler
function generateParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  let seed = 54321;
  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    arr[idx] = (pseudoRandom() - 0.5) * 15;
    arr[idx + 1] = (pseudoRandom() - 0.5) * 15;
    arr[idx + 2] = (pseudoRandom() - 0.5) * 15;
  }
  return arr;
}

export default function HeroParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleColor = useHeroStore((state) => state.particleColor);
  const particleSpeed = useHeroStore((state) => state.particleSpeed);
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);

  const count = 250;
  const positions = useMemo(() => {
    return generateParticlePositions(count);
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.02 * particleSpeed;
    pointsRef.current.position.y = -scrollProgress * 3; // Parallax y translation
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={0.05}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
}
