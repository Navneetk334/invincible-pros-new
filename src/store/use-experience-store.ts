import { create } from "zustand";

interface ExperienceState {
  scrollProgress: number;
  activeSection: number;
  activeSceneId: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  hudVisible: boolean;
  
  // Setters
  setScrollProgress: (progress: number) => void;
  setActiveSection: (index: number) => void;
  setActiveSceneId: (id: string) => void;
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setHudVisible: (visible: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  scrollProgress: 0.0,
  activeSection: 0,
  activeSceneId: "boot",
  cameraPosition: [0, 0, 10],
  cameraTarget: [0, 0, 0],
  hudVisible: true,

  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setActiveSection: (index) => set({ activeSection: index }),
  setActiveSceneId: (id) => set({ activeSceneId: id }),
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setHudVisible: (visible) => set({ hudVisible: visible }),
}));

export default useExperienceStore;
