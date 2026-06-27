"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import HeroDigitalCity from "@features/hero/canvas/HeroDigitalCity";
import HeroHeadquarters from "@features/hero/canvas/HeroHeadquarters";
import HeroVolumetricLight from "@features/hero/canvas/HeroVolumetricLight";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function HeroWorld({
  transitionProgress = 1.0,
  opacity = 1.0,
}: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [0, 0.5, 9.5], target: [0, 0, 0], fov: 45 },
      lighting: { color: "#ffffff", intensity: 0.5, ambientMultiplier: 0.35 },
      particles: { color: "#ffffff", speed: 0.4, opacity: 0.15 },
      aiCore: { position: [0, 0, 0], scale: 1.0, color: "#ffffff", pulseSpeed: 0.5, visible: true },
      mascot: { position: [0, -0.4, 1.5], visible: true, scale: 0.8 },
      fog: { color: "#050505", density: 0.02 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-hero">
      {/* Background outline grids */}
      <HeroDigitalCity opacity={opacity * 0.4} />
      
      {/* Volumetric spotlight beam */}
      <HeroVolumetricLight opacity={opacity} />

      {/* Main architectural structures */}
      <HeroHeadquarters transitionProgress={transitionProgress} opacity={opacity} />
    </group>
  );
}
export { HeroWorld };
