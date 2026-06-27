"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function LoaderWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 0, 8], target: [0, 0, 0] },
      lighting: { color: "#ffffff", intensity: 0.8, ambientMultiplier: 0.3 },
      particles: { color: "#ffffff", speed: 2.0, opacity: 0.5 },
      aiCore: { position: [0, 0, 0], scale: 1.2, color: "#ffffff", pulseSpeed: 2.5, visible: true },
      mascot: { position: [0, 0, -2], visible: false },
      fog: { color: "#000000", density: 0.05 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-loader">
      <mesh>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.15} />
      </mesh>
    </group>
  );
}
export { LoaderWorld };
