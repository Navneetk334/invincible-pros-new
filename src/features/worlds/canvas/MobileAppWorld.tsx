"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function MobileAppWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 8, 3.5], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#f8fafc", intensity: 0.7, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 1.5, opacity: 0.4 },
      aiCore: { position: [0, -1, -3], scale: 0.4, color: "#cbd5e1", pulseSpeed: 1.8, visible: true },
      mascot: { position: [0, 1.5, 1], visible: true, scale: 1.1 },
      fog: { color: "#050505", density: 0.04 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-mobile-app">
      {/* Mock structures representing wireframe screens */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 2.2, 0.1]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[1.5, 0.5, -1]}>
        <boxGeometry args={[0.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { MobileAppWorld };
