"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import AITransitionEngine from "../../mobile-app/canvas/AITransitionEngine";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function AIWorld({
  opacity = 1,
  transitionProgress = 0,
  isExiting = false,
}: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [5, -2, 5], target: [0, 0, -2], fov: 40 },
      lighting: { color: "#fafafa", intensity: 0.8, ambientMultiplier: 0.25 },
      particles: { color: "#f4f4f5", speed: 2.5, opacity: 0.5 },
      aiCore: { position: [0, 0, -2], scale: 1.8, color: "#ffffff", pulseSpeed: 3.0, visible: true },
      mascot: { position: [2, 0.5, 1], visible: true, scale: 1.2 },
      fog: { color: "#030303", density: 0.01 },
    });
  }, [setSharedConfig]);

  // Entry: incoming transitionProgress 0→1 means Mobile World is dissolving into this world.
  // Re-use AITransitionEngine in reverse (progress acts as the world-reveal).
  const entryProgress = !isExiting ? transitionProgress : 0;

  return (
    <group name="world-ai">
      {/* Existing AI World geometry */}
      <mesh position={[0, 0, -2]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial
          color="#27272a"
          transparent
          opacity={opacity * 0.2 * Math.max(0, (transitionProgress - 0.7) / 0.3)}
          wireframe
        />
      </mesh>
      <mesh position={[-2, 1, 0]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#101010"
          transparent
          opacity={opacity * Math.max(0, (transitionProgress - 0.8) / 0.2)}
          wireframe
        />
      </mesh>

      {/* Cinematic entry — the same transition engine that the Mobile World exits with
          now renders from the AI World's perspective, fading in as transitionProgress → 1 */}
      {entryProgress > 0 && (
        <AITransitionEngine
          transitionProgress={entryProgress}
          opacity={opacity}
        />
      )}
    </group>
  );
}
export { AIWorld };
