"use client";

import HeroCamera from "./HeroCamera";
import HeroLighting from "./HeroLighting";
import HeroParticles from "./HeroParticles";
import HeroAICore from "./HeroAICore";
import HeroDigitalCity from "./HeroDigitalCity";
import HeroEnvironment from "./HeroEnvironment";
import HeroFog from "./HeroFog";
import HeroPostProcessing from "./HeroPostProcessing";
import HeroCharacter from "./HeroCharacter";
import HeroTimeline from "./HeroTimeline";

export default function HeroScene() {
  return (
    <group name="hero-composer-scene">
      {/* Modular controller nodes */}
      <HeroCamera />
      <HeroTimeline />
      <HeroFog />
      <HeroPostProcessing />

      {/* Core light systems */}
      <HeroLighting />

      {/* Visual environment systems */}
      <HeroEnvironment />
      <HeroParticles />

      {/* Object mesh nodes */}
      <HeroDigitalCity />
      <HeroCharacter />
      <HeroAICore />
    </group>
  );
}
export { HeroScene };
