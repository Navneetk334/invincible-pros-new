"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function WebDevWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [-4.5, 3.5, 6], target: [-1.5, 0.5, 0], fov: 45 },
      lighting: { color: "#e2e8f0", intensity: 0.6, ambientMultiplier: 0.4 },
      particles: { color: "#94a3b8", speed: 1.2, opacity: 0.35 },
      aiCore: { position: [0, 2, -1], scale: 0.5, color: "#94a3b8", pulseSpeed: 1.2, visible: true },
      mascot: { position: [1, -0.5, 1], visible: true, scale: 0.9 },
      fog: { color: "#0a0a0a", density: 0.015 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-web-dev">
      {/* Mock structures representing development code arrays */}
      <mesh position={[0, -1, 0]}>
        <gridHelper args={[10, 10, "#1e293b", "#0f172a"]} />
      </mesh>
      <mesh position={[-2, 0.5, -2]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[2, 0.5, -3]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { WebDevWorld };
