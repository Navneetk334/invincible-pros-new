"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function CloudInfraWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [-6, 6, -6], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#d4d4d8", intensity: 0.5, ambientMultiplier: 0.35 },
      particles: { color: "#a1a1aa", speed: 0.5, opacity: 0.2 },
      aiCore: { position: [0, 0, 0], scale: 0.6, color: "#ffffff", pulseSpeed: 0.8, visible: true },
      mascot: { position: [-3, 1, -1], visible: true, scale: 0.9 },
      fog: { color: "#09090b", density: 0.025 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-cloud-infra">
      {/* Mock structures representing server racks and clouds */}
      <mesh position={[0, -2, 0]}>
        <gridHelper args={[30, 30, "#27272a", "#09090b"]} />
      </mesh>
      <mesh position={[-3, -0.5, -2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#18181b" transparent opacity={opacity} wireframe />
      </mesh>
      <mesh position={[3, -0.5, 2]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#18181b" transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}
export { CloudInfraWorld };
