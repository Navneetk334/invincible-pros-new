import { create } from "zustand";

interface CameraState {
  // Global path progress scrub
  scrollProgress: number;
  
  // Camera behavior modifiers
  shakeIntensityMultiplier: number;
  shakeEnabled: boolean;
  isScrolling: boolean;

  // Actions
  setScrollProgress: (progress: number) => void;
  setShakeIntensityMultiplier: (multiplier: number) => void;
  setShakeEnabled: (enabled: boolean) => void;
  setScrolling: (scrolling: boolean) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  scrollProgress: 0.0,
  shakeIntensityMultiplier: 1.0,
  shakeEnabled: true,
  isScrolling: false,

  setScrollProgress: (progress) =>
    set({
      // Bound value between 0.0 and 1.0
      scrollProgress: Math.min(Math.max(progress, 0.0), 1.0),
    }),

  setShakeIntensityMultiplier: (multiplier) => set({ shakeIntensityMultiplier: multiplier }),
  setShakeEnabled: (enabled) => set({ shakeEnabled: enabled }),
  setScrolling: (scrolling) => set({ isScrolling: scrolling }),
}));
export default useCameraStore;
