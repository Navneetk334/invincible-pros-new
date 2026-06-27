"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import MobileAppFactory from "../../mobile-app/canvas/MobileAppFactory";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function MobileAppWorld({
  opacity = 1.0,
  transitionProgress = 0.0,
  isExiting = false,
}: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 8, 3.5], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#f8fafc", intensity: 0.7, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 1.5, opacity: 0.4 },
      aiCore: { position: [0, 2.0, -3.0], scale: 0.4, color: "#cbd5e1", pulseSpeed: 1.8, visible: true },
      mascot: { position: [1.8, -0.6, 1.2], visible: true, scale: 1.0 },
      fog: { color: "#050505", density: 0.04 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-mobile-app">
      <MobileAppFactory
        opacity={opacity}
        transitionProgress={transitionProgress}
        isExiting={isExiting}
      />
    </group>
  );
}
export { MobileAppWorld };
