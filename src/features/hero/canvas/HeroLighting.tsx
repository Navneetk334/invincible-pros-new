"use client";

import { useHeroStore } from "../store/use-hero-store";

export default function HeroLighting() {
  const lightColor = useHeroStore((state) => state.lightColor);
  const lightIntensity = useHeroStore((state) => state.lightIntensity);

  return (
    <group name="hero-lighting-system">
      <ambientLight color={lightColor} intensity={lightIntensity * 0.35} />
      <directionalLight
        position={[5, 10, 5]}
        color={lightColor}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-6, -6, -6]}
        color={lightColor}
        intensity={lightIntensity * 0.25}
      />
    </group>
  );
}
