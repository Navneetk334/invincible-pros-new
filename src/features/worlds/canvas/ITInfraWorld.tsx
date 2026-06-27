"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function ITInfraWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [-8, -2, 8], target: [-2, 0, 0], fov: 45 },
      lighting: { color: "#a1a1aa", intensity: 0.4, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 0.9, opacity: 0.25 },
      aiCore: { position: [-3, 0, -1], scale: 0.75, color: "#ffffff", pulseSpeed: 0.7, visible: true },
      mascot: { position: [2, -1, 1], visible: true, scale: 0.8 },
      fog: { color: "#050505", density: 0.02 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-it-infra">
      {/* Visual blocks representing server rows */}
      <mesh position={[-3, -1.5, -2]}>
        <boxGeometry args={[3, 1, 0.5]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[-3, -1.5, -3.5]}>
        <boxGeometry args={[3, 1, 0.5]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { ITInfraWorld };
