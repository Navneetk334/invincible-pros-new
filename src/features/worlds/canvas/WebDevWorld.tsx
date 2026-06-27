"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import WebDevFactory from "../../web-dev/canvas/WebDevFactory";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function WebDevWorld({
  opacity = 1,
  transitionProgress = 0,
  isExiting = false,
}: WorldSceneProps) {
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
      <WebDevFactory
        opacity={opacity}
        transitionProgress={transitionProgress}
        isExiting={isExiting}
      />
    </group>
  );
}
export { WebDevWorld };
