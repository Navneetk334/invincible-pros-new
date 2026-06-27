"use client";

import { createContext, useContext, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

export type AssemblyStage =
  | "foundation"
  | "frame"
  | "mechanical"
  | "glass"
  | "energy"
  | "lighting"
  | "hologram"
  | "particles";

export interface RegisteredElement {
  id: string;
  ref: React.RefObject<THREE.Object3D | HTMLElement | null>;
  stage: AssemblyStage;
  animateIn: () => gsap.core.Tween | gsap.core.Timeline | void;
  animateOut: () => gsap.core.Tween | gsap.core.Timeline | void;
}

interface AssemblyContextType {
  registerElement: (element: RegisteredElement) => () => void;
  assemble: () => gsap.core.Timeline;
  disassemble: () => gsap.core.Timeline;
}

export const AssemblyContext = createContext<AssemblyContextType | null>(null);

const STAGE_START_TIMES: Record<AssemblyStage, number> = {
  foundation: 0.0,
  frame: 0.4,
  mechanical: 0.8,
  glass: 1.2,
  energy: 1.6,
  lighting: 2.0,
  hologram: 2.4,
  particles: 2.8,
};

export function useAssembly() {
  return useContext(AssemblyContext);
}

// Reusable hook to register any R3F mesh or DOM element into the assembly engine
export function useAssemblyRegister({
  id,
  ref,
  stage,
  animateIn,
  animateOut,
}: Omit<RegisteredElement, "">) {
  const context = useContext(AssemblyContext);

  useEffect(() => {
    if (context) {
      return context.registerElement({
        id,
        ref,
        stage,
        animateIn,
        animateOut,
      });
    }
  }, [context, id, ref, stage, animateIn, animateOut]);
}
export { STAGE_START_TIMES };
