"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function ContactWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 0, 6], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#ffffff", intensity: 0.6, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 0.3, opacity: 0.15 },
      aiCore: { position: [0, 0.5, -4], scale: 1.4, color: "#ffffff", pulseSpeed: 0.4, visible: true },
      mascot: { position: [0, 0.2, 0], visible: true, scale: 1.0 },
      fog: { color: "#050505", density: 0.015 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-contact">
      {/* Interactive visual contact concentric rings */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.02, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.1} />
      </mesh>
    </group>
  );
}
export { ContactWorld };
