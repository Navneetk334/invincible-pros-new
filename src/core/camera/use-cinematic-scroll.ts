"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCameraStore } from "./use-camera-store";
import { useWorldStore } from "../world/use-world-store";
import { WORLD_REGISTRY } from "../world/world-registry";

export function useCinematicScroll() {
  const setScrollProgress = useCameraStore((state) => state.setScrollProgress);
  const setScrolling = useCameraStore((state) => state.setScrolling);
  const setWorld = useWorldStore((state) => state.setWorld);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: typeof window !== "undefined" ? document.body : undefined,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.0, // Smooth delay scrubbing
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        // Update active world navigation block based on segment progress bounds
        const numWorlds = WORLD_REGISTRY.length;
        const rawIndex = progress * (numWorlds - 1);
        const index = Math.min(Math.floor(rawIndex), numWorlds - 1);
        const targetWorld = WORLD_REGISTRY[index].id;
        
        // Dynamic world switch trigger
        setWorld(targetWorld);

        // Set scroll motion active status
        setScrolling(true);

        // Debounce scroll status reset
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setScrolling(false);
        }, 100);
      },
    });

    return () => {
      trigger.kill();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [setScrollProgress, setScrolling, setWorld]);
}
export default useCinematicScroll;
