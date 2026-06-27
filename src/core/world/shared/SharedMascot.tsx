"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "../use-world-store";

export default function SharedMascot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mascotConfig = useWorldStore((state) => state.mascotConfig);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Handle visibility state
    if (!mascotConfig.visible) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    const time = state.clock.getElapsedTime();

    // Floating movement translation base offset
    const floatOffset = Math.sin(time * 1.5) * 0.04;

    // Smooth position lerp
    const [px, py, pz] = mascotConfig.position;
    const targetPos = new THREE.Vector3(px, py + floatOffset, pz);
    meshRef.current.position.lerp(targetPos, 0.05);

    // Smooth scale lerp
    const finalScale = mascotConfig.scale ?? 1.0;
    const targetScale = new THREE.Vector3(finalScale, finalScale, finalScale);
    meshRef.current.scale.lerp(targetScale, 0.05);

    // Smooth rotation slerp using quaternions to prevent gimbal lock
    const rotArr = mascotConfig.rotation ?? [0, 0, 0];
    const targetRot = new THREE.Euler(rotArr[0], rotArr[1], rotArr[2]);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
    meshRef.current.quaternion.slerp(targetQuat, 0.05);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.5, 1.5]} name="shared-mascot-avatar">
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
export { SharedMascot };
