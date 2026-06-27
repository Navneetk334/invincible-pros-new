"use client";

import { useEffect, Suspense } from "react";
import gsap from "gsap";
import { useWorldStore } from "./use-world-store";
import WorldContainer from "./WorldContainer";
import CinematicCamera from "../camera/CinematicCamera";
import SharedLighting from "./shared/SharedLighting";
import SharedParticles from "./shared/SharedParticles";
import SharedAICore from "./shared/SharedAICore";
import SharedMascot from "./shared/SharedMascot";
import SharedPostProcessing from "./shared/SharedPostProcessing";
import SharedFog from "./shared/SharedFog";

export default function WorldManager() {
  const activeWorldId = useWorldStore((state) => state.activeWorldId);
  const previousWorldId = useWorldStore((state) => state.previousWorldId);
  const isTransitioning = useWorldStore((state) => state.isTransitioning);
  const setTransitionProgress = useWorldStore((state) => state.setTransitionProgress);
  const completeTransition = useWorldStore((state) => state.completeTransition);

  useEffect(() => {
    if (isTransitioning) {
      const obj = { progress: 0 };
      const tween = gsap.to(obj, {
        progress: 1,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          setTransitionProgress(obj.progress);
        },
        onComplete: () => {
          completeTransition();
        },
      });

      return () => {
        tween.kill();
      };
    }
  }, [activeWorldId, isTransitioning, setTransitionProgress, completeTransition]);

  return (
    <group name="world-engine">
      {/* Shared Single-Instance Infrastructure */}
      <CinematicCamera />
      <SharedLighting />
      <SharedParticles />
      <SharedAICore />
      <SharedMascot />
      <SharedPostProcessing />
      <SharedFog />

      {/* Dynamic Worlds Lifecycle */}
      <Suspense fallback={null}>
        {/* Render Previous World during Transition */}
        {isTransitioning && previousWorldId && (
          <WorldContainer id={previousWorldId} isExiting />
        )}
        
        {/* Render Active World */}
        <WorldContainer id={activeWorldId} />
      </Suspense>
    </group>
  );
}
export { WorldManager };
