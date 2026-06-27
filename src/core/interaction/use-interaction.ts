"use client";

import { create } from "zustand";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useAudioStore } from "../audio/use-audio-store";
import { useCameraStore } from "../camera/use-camera-store";

export interface InteractionConfig {
  id: string;
  tooltip?: string;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  cameraFov?: number;
  onHoverStart?: (mesh: THREE.Object3D) => void;
  onHoverEnd?: (mesh: THREE.Object3D) => void;
  onActivate?: (mesh: THREE.Object3D) => void;
}

interface InteractionState {
  hoveredId: string | null;
  tooltipText: string | null;
  focusedId: string | null;
  setHovered: (id: string | null, tooltip: string | null) => void;
  setFocused: (id: string | null) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  hoveredId: null,
  tooltipText: null,
  focusedId: null,

  setHovered: (id, tooltip) => set({ hoveredId: id, tooltipText: tooltip }),
  setFocused: (id) => set({ focusedId: id }),
}));

// Reusable R3F hook that returns ref and pointer handlers to enable spatial interactions
export function useInteractiveObject(
  config: InteractionConfig,
  externalRef?: React.RefObject<THREE.Object3D | null>
) {
  const localRef = useRef<THREE.Object3D>(null);
  // Support sharing existing refs between multiple hooks
  const meshRef = (externalRef || localRef) as React.RefObject<THREE.Object3D | null>;
  const hoverActive = useRef(false);

  const setHovered = useInteractionStore((state) => state.setHovered);
  const setFocused = useInteractionStore((state) => state.setFocused);

  const handlers = useMemo(() => {
    return {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (hoverActive.current) return;
        hoverActive.current = true;

        if (meshRef.current) {
          gsap.to(meshRef.current.scale, {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 0.35,
            ease: "power2.out",
          });
          config.onHoverStart?.(meshRef.current);
        }

        // Trigger procedural hover click
        useAudioStore.getState().playClick();

        setHovered(config.id, config.tooltip || null);
      },
      onPointerOut: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!hoverActive.current) return;
        hoverActive.current = false;

        if (meshRef.current) {
          gsap.to(meshRef.current.scale, {
            x: 1.0,
            y: 1.0,
            z: 1.0,
            duration: 0.35,
            ease: "power2.out",
          });
          config.onHoverEnd?.(meshRef.current);
        }

        setHovered(null, null);
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();

        // Trigger mechanical lock clank audio
        useAudioStore.getState().playLock();

        const currentFocused = useInteractionStore.getState().focusedId;
        if (currentFocused === config.id) {
          // Toggle off: Reset camera view back to spline track
          useCameraStore.getState().triggerReset();
          setFocused(null);
        } else {
          // Toggle on: Focus camera towards target properties
          if (config.cameraPosition && config.cameraTarget) {
            useCameraStore.getState().triggerFocus(
              config.cameraPosition,
              config.cameraTarget,
              config.cameraFov
            );
          }
          setFocused(config.id);
          if (meshRef.current) {
            config.onActivate?.(meshRef.current);
          }
        }
      },
    };
  }, [config, setHovered, setFocused, meshRef]);

  return { ref: meshRef, handlers };
}
export default useInteractiveObject;
