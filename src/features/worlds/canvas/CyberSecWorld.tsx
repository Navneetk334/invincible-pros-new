"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function CyberSecWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 4, 12], target: [0, 1, 0], fov: 45 },
      lighting: { color: "#f4f4f5", intensity: 0.6, ambientMultiplier: 0.35 },
      particles: { color: "#e4e4e7", speed: 1.8, opacity: 0.4 },
      aiCore: { position: [0, 1, -1], scale: 1.1, color: "#ffffff", pulseSpeed: 1.5, visible: true },
      mascot: { position: [0, 1.5, 2], visible: true, scale: 1.0 },
      fog: { color: "#050505", density: 0.035 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-cyber-sec">
      {/* Visual wireframe shield rings represent cyber protection node layers */}
      <mesh position={[0, 1, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.05, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.25} />
      </mesh>
      <mesh position={[0, 1, -1]} rotation={[0, Math.PI / 4, 0]}>
        <ringGeometry args={[2.5, 2.55, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.15} />
      </mesh>
    </group>
  );
}
export { CyberSecWorld };
