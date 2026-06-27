import { create } from "zustand";
import {
  WorldId,
  CameraConfig,
  LightingConfig,
  ParticlesConfig,
  AICoreConfig,
  MascotConfig,
  PostProcessingConfig,
  FogConfig,
  WorldSharedConfig,
} from "./world-registry";

interface WorldState {
  // World Navigation Lifecycle
  activeWorldId: WorldId;
  previousWorldId: WorldId | null;
  isTransitioning: boolean;
  transitionProgress: number; // 0.0 -> 1.0

  // Shared Core 3D Configs
  cameraConfig: CameraConfig;
  lightingConfig: LightingConfig;
  particlesConfig: ParticlesConfig;
  aiCoreConfig: AICoreConfig;
  mascotConfig: MascotConfig;
  postProcessingConfig: PostProcessingConfig;
  fogConfig: FogConfig;

  // Actions
  setWorld: (worldId: WorldId) => void;
  setTransitionProgress: (progress: number) => void;
  completeTransition: () => void;
  setSharedConfig: (config: Partial<WorldSharedConfig>) => void;
  
  // Direct Setters
  setCameraConfig: (config: Partial<CameraConfig>) => void;
  setLightingConfig: (config: Partial<LightingConfig>) => void;
  setParticlesConfig: (config: Partial<ParticlesConfig>) => void;
  setAICoreConfig: (config: Partial<AICoreConfig>) => void;
  setMascotConfig: (config: Partial<MascotConfig>) => void;
  setPostProcessingConfig: (config: Partial<PostProcessingConfig>) => void;
  setFogConfig: (config: Partial<FogConfig>) => void;
}

// Stable defaults mapped to the default Hero space
const defaultCamera: CameraConfig = {
  position: [0, 0, 10],
  target: [0, 0, 0],
  fov: 45,
};

const defaultLighting: LightingConfig = {
  color: "#ffffff",
  intensity: 0.5,
  ambientMultiplier: 0.35,
};

const defaultParticles: ParticlesConfig = {
  color: "#ffffff",
  speed: 1.0,
  opacity: 0.3,
};

const defaultAICore: AICoreConfig = {
  position: [0, 0, 0],
  scale: 1.0,
  color: "#ffffff",
  pulseSpeed: 1.0,
  visible: true,
};

const defaultMascot: MascotConfig = {
  position: [0, -0.5, 1.5],
  rotation: [0, 0, 0],
  scale: 1.0,
  visible: true,
};

const defaultPostProcessing: PostProcessingConfig = {
  bloomIntensity: 1.0,
  chromaticAberrationOffset: 0.002,
};

const defaultFog: FogConfig = {
  color: "#050505",
  density: 0.02,
};

export const useWorldStore = create<WorldState>((set, get) => ({
  activeWorldId: "loading", // Start at loading world
  previousWorldId: null,
  isTransitioning: false,
  transitionProgress: 0.0,

  cameraConfig: defaultCamera,
  lightingConfig: defaultLighting,
  particlesConfig: defaultParticles,
  aiCoreConfig: defaultAICore,
  mascotConfig: defaultMascot,
  postProcessingConfig: defaultPostProcessing,
  fogConfig: defaultFog,

  setWorld: (worldId) => {
    const current = get().activeWorldId;
    if (current === worldId) return;

    set({
      previousWorldId: current,
      activeWorldId: worldId,
      isTransitioning: true,
      transitionProgress: 0.0,
    });
  },

  setTransitionProgress: (progress) => set({ transitionProgress: progress }),

  completeTransition: () =>
    set({
      previousWorldId: null,
      isTransitioning: false,
      transitionProgress: 1.0,
    }),

  setSharedConfig: (config) => {
    set((state) => {
      const updates: Partial<WorldState> = {};
      if (config.camera) updates.cameraConfig = { ...state.cameraConfig, ...config.camera };
      if (config.lighting) updates.lightingConfig = { ...state.lightingConfig, ...config.lighting };
      if (config.particles) updates.particlesConfig = { ...state.particlesConfig, ...config.particles };
      if (config.aiCore) updates.aiCoreConfig = { ...state.aiCoreConfig, ...config.aiCore };
      if (config.mascot) updates.mascotConfig = { ...state.mascotConfig, ...config.mascot };
      if (config.postProcessing) updates.postProcessingConfig = { ...state.postProcessingConfig, ...config.postProcessing };
      if (config.fog) updates.fogConfig = { ...state.fogConfig, ...config.fog };
      return updates;
    });
  },

  setCameraConfig: (config) =>
    set((state) => ({ cameraConfig: { ...state.cameraConfig, ...config } })),

  setLightingConfig: (config) =>
    set((state) => ({ lightingConfig: { ...state.lightingConfig, ...config } })),

  setParticlesConfig: (config) =>
    set((state) => ({ particlesConfig: { ...state.particlesConfig, ...config } })),

  setAICoreConfig: (config) =>
    set((state) => ({ aiCoreConfig: { ...state.aiCoreConfig, ...config } })),

  setMascotConfig: (config) =>
    set((state) => ({ mascotConfig: { ...state.mascotConfig, ...config } })),

  setPostProcessingConfig: (config) =>
    set((state) => ({ postProcessingConfig: { ...state.postProcessingConfig, ...config } })),

  setFogConfig: (config) =>
    set((state) => ({ fogConfig: { ...state.fogConfig, ...config } })),
}));
export default useWorldStore;
