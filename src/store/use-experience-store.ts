import { create } from "zustand";

interface ExperienceState {
  // Loader States
  assetsLoaded: number;
  assetsTotal: number;
  isLoaderCompleted: boolean;
  setAssetLoaded: (loaded?: number, total?: number) => void;
  completeLoader: () => void;

  // Active Cinematic Scene Section
  activeSceneId: string;
  setActiveSceneId: (sceneId: string) => void;

  // Global Camera Orbit/Target parameters (fed to R3F frame loops)
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;

  // HUD & UI States
  hudVisible: boolean;
  setHudVisible: (visible: boolean) => void;
  activePanelId: string | null;
  setActivePanelId: (panelId: string | null) => void;

  // Interaction reticle feed
  hoveredTechnicalDetail: string | null;
  setHoveredTechnicalDetail: (detail: string | null) => void;

  // Debug states (Leva dashboards, helper grids)
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;

  // Scroll Engine States
  scrollProgress: number;
  activeSection: number;
  isScrollLocked: boolean;
  setScrollProgress: (progress: number) => void;
  setActiveSection: (section: number) => void;
  setScrollLocked: (locked: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  // Loader Defaults
  assetsLoaded: 0,
  assetsTotal: 0,
  isLoaderCompleted: false,
  setAssetLoaded: (loaded, total) =>
    set((state) => ({
      assetsLoaded: loaded ?? state.assetsLoaded + 1,
      assetsTotal: total ?? state.assetsTotal,
    })),
  completeLoader: () => set({ isLoaderCompleted: true }),

  // Scene Defaults
  activeSceneId: "intro",
  setActiveSceneId: (sceneId) => set({ activeSceneId: sceneId }),

  // Camera Orbit Defaults (Targeting center, slightly pulled back)
  cameraPosition: [0, 0, 10],
  cameraTarget: [0, 0, 0],
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  setCameraTarget: (target) => set({ cameraTarget: target }),

  // HUD Panel Defaults
  hudVisible: true,
  setHudVisible: (visible) => set({ hudVisible: visible }),
  activePanelId: null,
  setActivePanelId: (panelId) => set({ activePanelId: panelId }),

  // Reticle/Hover Feedback Defaults
  hoveredTechnicalDetail: null,
  setHoveredTechnicalDetail: (detail) => set({ hoveredTechnicalDetail: detail }),

  // Debug defaults - pull from env if available
  debugMode: typeof window !== "undefined" 
    ? process.env.NEXT_PUBLIC_EXPERIENCE_DEBUG === "true"
    : false,
  setDebugMode: (debug) => set({ debugMode: debug }),

  // Scroll Defaults
  scrollProgress: 0,
  activeSection: 0,
  isScrollLocked: false,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setActiveSection: (section) => set({ activeSection: section }),
  setScrollLocked: (locked) => set({ isScrollLocked: locked }),
}));
export default useExperienceStore;
