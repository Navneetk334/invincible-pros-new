"use client";

import { useEffect } from "react";
import { useCameraStore } from "@core/camera/use-camera-store";
import { useWorldStore } from "@core/world/use-world-store";
import { WorldId } from "@core/world/world-registry";
import { useStoryStore } from "./use-story-store";

export default function StoryEngine() {
  const scrollProgress = useCameraStore((state) => state.scrollProgress);
  const updateProgress = useStoryStore((state) => state.updateProgress);

  const activeNodeId = useStoryStore((state) => state.activeNodeId);
  const interpolated = useStoryStore((state) => state.interpolated);

  const setWorld = useWorldStore((state) => state.setWorld);
  const setAICoreConfig = useWorldStore((state) => state.setAICoreConfig);
  const setLightingConfig = useWorldStore((state) => state.setLightingConfig);
  const setParticlesConfig = useWorldStore((state) => state.setParticlesConfig);

  // Sync scroll progress into Story Store state machine
  useEffect(() => {
    updateProgress(scrollProgress);
  }, [scrollProgress, updateProgress]);

  // Push interpolated configurations down to active R3F visual systems
  useEffect(() => {
    if (!activeNodeId) return;

    // 1. Swap active rendering world
    setWorld(activeNodeId as WorldId);

    // 2. Adjust AI Core scale and colors
    setAICoreConfig({
      scale: interpolated.aiCoreScale,
      color: interpolated.aiCoreColor,
    });

    // 3. Modulate volumetric spotlights
    setLightingConfig({
      intensity: interpolated.lightIntensity,
      color: interpolated.lightColor,
    });

    // 4. Accelerate particles
    setParticlesConfig({
      speed: interpolated.particlesSpeed,
      color: interpolated.aiCoreColor,
    });
  }, [
    activeNodeId,
    interpolated,
    setWorld,
    setAICoreConfig,
    setLightingConfig,
    setParticlesConfig,
  ]);

  return null;
}
export { StoryEngine };
