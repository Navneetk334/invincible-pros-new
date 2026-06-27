"use client";

import { useHeroStore } from "../store/use-hero-store";

export default function HeroFog() {
  const fogColor = useHeroStore((state) => state.fogColor);
  const fogDensity = useHeroStore((state) => state.fogDensity);

  return <fogExp2 attach="fog" args={[fogColor, fogDensity]} />;
}
