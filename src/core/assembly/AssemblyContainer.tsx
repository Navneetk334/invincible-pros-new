"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { AssemblyContext, RegisteredElement, STAGE_START_TIMES } from "./use-assembly";
import { useAudioStore } from "../audio/use-audio-store";

interface AssemblyContainerProps {
  children: React.ReactNode;
  isExiting?: boolean;
}

export default function AssemblyContainer({
  children,
  isExiting = false,
}: AssemblyContainerProps) {
  const elementsRef = useRef<Set<RegisteredElement>>(new Set());
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const registerElement = (el: RegisteredElement) => {
    elementsRef.current.add(el);
    return () => {
      elementsRef.current.delete(el);
    };
  };

  const assemble = () => {
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    // Trigger mechanical click lock audio
    useAudioStore.getState().playLock();

    const tl = gsap.timeline();
    activeTimelineRef.current = tl;

    elementsRef.current.forEach((el) => {
      const tween = el.animateIn();
      if (tween) {
        tl.add(tween, STAGE_START_TIMES[el.stage]);
      }
    });

    return tl;
  };

  const disassemble = () => {
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    const tl = gsap.timeline();
    activeTimelineRef.current = tl;

    elementsRef.current.forEach((el) => {
      const tween = el.animateOut();
      if (tween) {
        // Disassemble in reverse order
        const maxTime = 3.2;
        const offset = maxTime - STAGE_START_TIMES[el.stage];
        tl.add(tween, offset);
      }
    });

    return tl;
  };

  useEffect(() => {
    // Automatically trigger timelines on state changes
    if (isExiting) {
      disassemble();
    } else {
      // Small timeout to allow all child registers to mount and register on first frame
      const timer = setTimeout(() => {
        assemble();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <AssemblyContext.Provider value={{ registerElement, assemble, disassemble }}>
      {children}
    </AssemblyContext.Provider>
  );
}
export { AssemblyContainer };
