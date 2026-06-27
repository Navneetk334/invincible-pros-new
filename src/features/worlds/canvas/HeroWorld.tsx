"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import HeroDigitalCity from "@features/hero/canvas/HeroDigitalCity";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function HeroWorld({ opacity = 1 }: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 0, 10], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#ffffff", intensity: 0.5, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 1.0, opacity: 0.3 },
      aiCore: { position: [0, 0, 0], scale: 1.0, color: "#ffffff", pulseSpeed: 1.0, visible: true },
      mascot: { position: [0, -0.5, 1.5], visible: true, scale: 1.0 },
      fog: { color: "#050505", density: 0.02 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-hero">
      <HeroDigitalCity opacity={opacity} />
    </group>
  );
}
export { HeroWorld };
