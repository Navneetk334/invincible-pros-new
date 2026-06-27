"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "../use-world-store";

export default function SharedLighting() {
  const lightingConfig = useWorldStore((state) => state.lightingConfig);
  
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const pointRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!ambientRef.current || !dirRef.current || !pointRef.current) return;

    // Target color interpolation
    const targetColor = new THREE.Color(lightingConfig.color);
    ambientRef.current.color.lerp(targetColor, 0.05);
    dirRef.current.color.lerp(targetColor, 0.05);
    pointRef.current.color.lerp(targetColor, 0.05);

    // Lerp intensities
    const mult = lightingConfig.ambientMultiplier ?? 0.35;
    ambientRef.current.intensity = THREE.MathUtils.lerp(
      ambientRef.current.intensity,
      lightingConfig.intensity * mult,
      0.05
    );
    
    dirRef.current.intensity = THREE.MathUtils.lerp(
      dirRef.current.intensity,
      lightingConfig.intensity,
      0.05
    );
    
    pointRef.current.intensity = THREE.MathUtils.lerp(
      pointRef.current.intensity,
      lightingConfig.intensity * 0.25,
      0.05
    );

    // Key light follows camera shifts dynamically (offset by [4, 10, 4])
    const camPos = state.camera.position;
    dirRef.current.position.set(
      camPos.x + 4.0,
      10.0,
      camPos.z + 4.0
    );
  });

  return (
    <group name="shared-lighting-system">
      <ambientLight ref={ambientRef} color="#ffffff" intensity={0.175} />
      <directionalLight
        ref={dirRef}
        position={[5, 10, 5]}
        color="#ffffff"
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        ref={pointRef}
        position={[-6, -6, -6]}
        color="#ffffff"
        intensity={0.125}
      />
    </group>
  );
}
export { SharedLighting };
