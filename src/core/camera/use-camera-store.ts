import { create } from "zustand";
import gsap from "gsap";

interface CameraState {
  // Global path progress scrub
  scrollProgress: number;
  
  // Camera behavior modifiers
  shakeIntensityMultiplier: number;
  shakeEnabled: boolean;
  isScrolling: boolean;

  // Focus targets telemetry
  focusTarget: [number, number, number] | null;
  focusPosition: [number, number, number] | null;
  focusFov: number | null;
  focusProgress: number;

  // Actions
  setScrollProgress: (progress: number) => void;
  setShakeIntensityMultiplier: (multiplier: number) => void;
  setShakeEnabled: (enabled: boolean) => void;
  setScrolling: (scrolling: boolean) => void;

  triggerFocus: (position: [number, number, number], target: [number, number, number], fov?: number) => void;
  triggerReset: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  scrollProgress: 0.0,
  shakeIntensityMultiplier: 1.0,
  shakeEnabled: true,
  isScrolling: false,

  focusTarget: null,
  focusPosition: null,
  focusFov: null,
  focusProgress: 0.0,

  setScrollProgress: (progress) => {
    set({
      // Bound value between 0.0 and 1.0
      scrollProgress: Math.min(Math.max(progress, 0.0), 1.0),
    });

    // Auto-interrupt camera focus on user scroll input
    const state = useCameraStore.getState();
    if (state.focusTarget !== null || state.focusProgress > 0) {
      state.triggerReset();
    }
  },

  setShakeIntensityMultiplier: (multiplier) => set({ shakeIntensityMultiplier: multiplier }),
  setShakeEnabled: (enabled) => set({ shakeEnabled: enabled }),
  setScrolling: (scrolling) => set({ isScrolling: scrolling }),

  triggerFocus: (position, target, fov) => {
    // Instantly set position targets so the R3F frame loop can begin lerping
    set({ focusPosition: position, focusTarget: target, focusFov: fov || null });

    const store = useCameraStore.getState();
    gsap.killTweensOf(store);
    gsap.to(store, {
      focusProgress: 1.0,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        set({ focusProgress: store.focusProgress });
      },
    });
  },

  triggerReset: () => {
    const store = useCameraStore.getState();
    gsap.killTweensOf(store);
    gsap.to(store, {
      focusProgress: 0.0,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        set({ focusProgress: store.focusProgress });
      },
      onComplete: () => {
        // Clear variables on completion
        set({ focusPosition: null, focusTarget: null, focusFov: null });
      },
    });
  },
}));
export default useCameraStore;
