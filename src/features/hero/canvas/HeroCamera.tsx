"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@store/use-experience-store";
import { useHeroStore } from "../store/use-hero-store";

export default function HeroCamera() {
  const activeSection = useExperienceStore((state) => state.activeSection);
  const setCameraPosition = useExperienceStore((state) => state.setCameraPosition);
  const setCameraTarget = useExperienceStore((state) => state.setCameraTarget);
  
  const waypoints = useHeroStore((state) => state.waypoints);

  useEffect(() => {
    const activeWaypoint = waypoints[activeSection];
    if (activeWaypoint) {
      // Direct store update mapping scroll progress waypoints
      setCameraPosition(activeWaypoint.position);
      setCameraTarget(activeWaypoint.target);
    }
  }, [activeSection, waypoints, setCameraPosition, setCameraTarget]);

  return null;
}
