"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@store/use-experience-store";
import { useHeroStore } from "../store/use-hero-store";

export default function HeroTimeline() {
  const scrollProgress = useExperienceStore((state) => state.scrollProgress);
  const setLightIntensity = useHeroStore((state) => state.setLightIntensity);
  const setBloomIntensity = useHeroStore((state) => state.setBloomIntensity);

  useEffect(() => {
    // Dynamic mapping coordinates: staggers intensities as progress advances
    const lightVal = 0.4 + Math.sin(scrollProgress * Math.PI) * 0.25;
    setLightIntensity(lightVal);
    
    const bloomVal = 0.8 + scrollProgress * 0.6;
    setBloomIntensity(bloomVal);
  }, [scrollProgress, setLightIntensity, setBloomIntensity]);

  return null;
}
