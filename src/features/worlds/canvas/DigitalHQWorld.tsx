"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function DigitalHQWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [4, 1.5, 8], target: [1, 0, 0], fov: 45 },
      lighting: { color: "#a1a1aa", intensity: 0.45, ambientMultiplier: 0.3 },
      particles: { color: "#ffffff", speed: 0.8, opacity: 0.25 },
      aiCore: { position: [2, 0, -2], scale: 0.7, color: "#a1a1aa", pulseSpeed: 0.5, visible: true },
      mascot: { position: [-1.5, -0.2, 2], visible: true, scale: 0.8 },
      fog: { color: "#050505", density: 0.03 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-digital-hq">
      {/* Mock structures represent headquarters nodes */}
      <mesh position={[2, -1, -2]}>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[-2, -1.5, -1]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#101010" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { DigitalHQWorld };
