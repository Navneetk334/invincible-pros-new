"use client";

import { useEffect } from "react";
import { useWorldStore } from "@core/world/use-world-store";
import HQArchitecture from "@features/digital-hq/canvas/HQArchitecture";
import HQHolograms from "@features/digital-hq/canvas/HQHolograms";
import HQDigitalHighways from "@features/digital-hq/canvas/HQDigitalHighways";
import HQAerialTraffic from "@features/digital-hq/canvas/HQAerialTraffic";

interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export default function DigitalHQWorld({
  transitionProgress = 1.0,
  opacity = 1.0,
}: WorldSceneProps) {
  const setSharedConfig = useWorldStore((state) => state.setSharedConfig);

  useEffect(() => {
    setSharedConfig({
      camera: { position: [4, 1.5, 8], target: [1, 0, 0], fov: 45 },
      lighting: { color: "#ffffff", intensity: 0.45, ambientMultiplier: 0.3 },
      particles: { color: "#ffffff", speed: 0.6, opacity: 0.2 },
      aiCore: { position: [2, 0, -2], scale: 0.75, color: "#ffffff", pulseSpeed: 0.6, visible: true },
      mascot: { position: [-1.5, -0.2, 2], visible: true, scale: 0.8 },
      fog: { color: "#050505", density: 0.025 },
    });
  }, [setSharedConfig]);

  return (
    <group name="world-digital-hq">
      {/* 1. Structural Glass Nodes & Bridges */}
      <HQArchitecture transitionProgress={transitionProgress} opacity={opacity} />

      {/* 2. Floating Telemetry Holograms */}
      <HQHolograms opacity={opacity} />

      {/* 3. Optical Flowing Highways */}
      <HQDigitalHighways opacity={opacity} />

      {/* 4. Slow Hovering AI Drones */}
      <HQAerialTraffic opacity={opacity} />
    </group>
  );
}
export { DigitalHQWorld };
