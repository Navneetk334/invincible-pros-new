"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function HeroEnvironment() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Extremely slow rotation of background environment shell
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.004;
    }
  });

  return (
    <group ref={groupRef} name="hero-environment">
      <mesh>
        <sphereGeometry args={[24, 16, 16]} />
        <meshBasicMaterial
          color="#050505"
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
