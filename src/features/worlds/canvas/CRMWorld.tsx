"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function CRMWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [7, 0.5, 3], target: [1, 0, -1], fov: 45 },
      lighting: { color: "#e4e4e7", intensity: 0.5, ambientMultiplier: 0.3 },
      particles: { color: "#d4d4d8", speed: 1.0, opacity: 0.3 },
      aiCore: { position: [3, -1, -2], scale: 0.8, color: "#ffffff", pulseSpeed: 1.0, visible: true },
      mascot: { position: [-2, 0, 1], visible: true, scale: 1.0 },
      fog: { color: "#050505", density: 0.02 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-crm">
      {/* Mock database cylinders represent relational CRM stacks */}
      <mesh position={[3, -1.5, -2]}>
        <cylinderGeometry args={[1, 1, 1.5, 12]} />
        <meshStandardMaterial color="#27272a" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[1, -1.5, -4]}>
        <cylinderGeometry args={[0.8, 0.8, 1, 12]} />
        <meshStandardMaterial color="#27272a" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { CRMWorld };
