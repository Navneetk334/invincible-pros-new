"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useWorldStore } from "../use-world-store";

export default function SharedFog() {
  const fogConfig = useWorldStore((state) => state.fogConfig);
  const fogRef = useRef<THREE.FogExp2>(null);

  useFrame((state) => {
    if (fogRef.current) {
      const dist = state.camera.position.length();
      
      // As the camera moves closer to the center, fog thins out (depth scale)
      const depthFactor = THREE.MathUtils.clamp(dist / 9.0, 0.5, 1.8);
      const targetDensity = fogConfig.density * depthFactor;

      // Lerp density and color smoothly on the WebGL fog system
      fogRef.current.density = THREE.MathUtils.lerp(
        fogRef.current.density,
        targetDensity,
        0.05
      );
      
      const targetColor = new THREE.Color(fogConfig.color);
      fogRef.current.color.lerp(targetColor, 0.05);
    }
  });

  return <fogExp2 ref={fogRef} attach="fog" args={[fogConfig.color, fogConfig.density]} />;
}
export { SharedFog };
