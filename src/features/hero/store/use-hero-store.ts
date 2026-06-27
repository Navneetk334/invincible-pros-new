import { create } from "zustand";

export interface Waypoint {
  position: [number, number, number];
  target: [number, number, number];
}

interface HeroState {
  // Camera Waypoint Mapping
  waypoints: Waypoint[];
  currentWaypointIndex: number;
  setCurrentWaypointIndex: (index: number) => void;

  // Modular Lighting Properties
  lightColor: string;
  lightIntensity: number;
  setLightColor: (color: string) => void;
  setLightIntensity: (intensity: number) => void;

  // Fog Mappings
  fogColor: string;
  fogDensity: number;
  setFogColor: (color: string) => void;
  setFogDensity: (density: number) => void;

  // Background Particles Config
  particleColor: string;
  particleSpeed: number;
  setParticleColor: (color: string) => void;
  setParticleSpeed: (speed: number) => void;

  // Post-Processing parameters
  bloomIntensity: number;
  chromaticAberrationOffset: number;
  setBloomIntensity: (intensity: number) => void;
  setChromaticAberrationOffset: (offset: number) => void;
}

export const useHeroStore = create<HeroState>((set) => ({
  // Default Section Camera coordinates (Snaps to 4 quadrants)
  waypoints: [
    { position: [0, 0, 10], target: [0, 0, 0] },
    { position: [4, 1.5, 8], target: [1, 0, 0] },
    { position: [-4.5, 3.5, 6], target: [-1.5, 0.5, 0] },
    { position: [0, 8, 3.5], target: [0, 0, 0] },
  ],
  currentWaypointIndex: 0,
  setCurrentWaypointIndex: (index) => set({ currentWaypointIndex: index }),

  // Lights
  lightColor: "#ffffff",
  lightIntensity: 0.5,
  setLightColor: (color) => set({ lightColor: color }),
  setLightIntensity: (intensity) => set({ lightIntensity: intensity }),

  // Fog
  fogColor: "#050505",
  fogDensity: 0.02,
  setFogColor: (color) => set({ fogColor: color }),
  setFogDensity: (density) => set({ fogDensity: density }),

  // Particles
  particleColor: "#ffffff",
  particleSpeed: 1.0,
  setParticleColor: (color) => set({ particleColor: color }),
  setParticleSpeed: (speed) => set({ particleSpeed: speed }),

  // Filter properties
  bloomIntensity: 1.0,
  chromaticAberrationOffset: 0.002,
  setBloomIntensity: (intensity) => set({ bloomIntensity: intensity }),
  setChromaticAberrationOffset: (offset) => set({ chromaticAberrationOffset: offset }),
}));
export default useHeroStore;
