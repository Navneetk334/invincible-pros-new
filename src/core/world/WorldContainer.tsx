"use client";

import React, { useMemo } from "react";
import { WorldId, WORLD_REGISTRY } from "./world-registry";
import { useWorldStore } from "./use-world-store";
import AssemblyContainer from "../assembly/AssemblyContainer";

interface WorldContainerProps {
  id: WorldId;
  isExiting?: boolean;
}

export default function WorldContainer({ id, isExiting = false }: WorldContainerProps) {
  const transitionProgress = useWorldStore((state) => state.transitionProgress);
  const isTransitioning = useWorldStore((state) => state.isTransitioning);

  const worldDef = useMemo(() => {
    return WORLD_REGISTRY.find((w) => w.id === id);
  }, [id]);

  if (!worldDef) return null;

  const LazyComponent = worldDef.component;

  // Fade curves: 
  // Exiting: 1.0 -> 0.0
  // Entering: 0.0 -> 1.0 (if in transition), or 1.0 (if static/completed)
  const opacity = isExiting 
    ? 1 - transitionProgress 
    : isTransitioning 
      ? transitionProgress 
      : 1.0;

  return (
    <group name={`world-container-${id}`}>
      <AssemblyContainer isExiting={isExiting}>
        <LazyComponent
          isExiting={isExiting}
          transitionProgress={transitionProgress}
          opacity={opacity}
        />
      </AssemblyContainer>
    </group>
  );
}
export { WorldContainer };
