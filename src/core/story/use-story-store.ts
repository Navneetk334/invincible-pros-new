import { create } from "zustand";
import { STORY_TIMELINE, StoryState } from "./story-config";

// Linear interpolation utility helper
function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

// Color interpolation utility helper
function lerpColor(color1: string, color2: string, amt: number) {
  // Convert hex to RGB, interpolate, and convert back to hex
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(lerp(r1, r2, amt)).toString(16).padStart(2, "0");
  const g = Math.round(lerp(g1, g2, amt)).toString(16).padStart(2, "0");
  const b = Math.round(lerp(b1, b2, amt)).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

export type StoryStateName = "entry" | "focus" | "interaction" | "exit";

interface StoryStoreState {
  activeNodeId: string;
  activeState: StoryStateName;
  branchChoice: "default" | "alternative";
  locale: "en" | "de" | "fr";
  interpolated: Omit<StoryState, "uiTitle" | "uiSubtitle"> & {
    uiTitle: string;
    uiSubtitle: string;
  };
  setBranchChoice: (choice: "default" | "alternative") => void;
  setLocale: (locale: "en" | "de" | "fr") => void;
  updateProgress: (globalProgress: number) => void;
}

// Generates sequence of world nodes dynamically based on active timeline branch selection
export const getActiveTimelineList = (branchChoice: "default" | "alternative"): string[] => {
  const sequence = ["loading", "hero", "digital-hq"];
  if (branchChoice === "alternative") {
    sequence.push(
      "artificial-intelligence",
      "cloud-infrastructure",
      "crm-systems",
      "cyber-security",
      "it-infrastructure",
      "contact"
    );
  } else {
    sequence.push(
      "website-development",
      "mobile-applications",
      "artificial-intelligence",
      "cloud-infrastructure",
      "crm-systems",
      "cyber-security",
      "it-infrastructure",
      "contact"
    );
  }
  return sequence;
};

// Initial state values matching Loading -> Entry config parameters
const initialInterpolated: Omit<StoryState, "uiTitle" | "uiSubtitle"> & {
  uiTitle: string;
  uiSubtitle: string;
} = {
  aiCoreScale: 0.1,
  aiCoreColor: "#ffffff",
  aiCoreShape: "sphere",
  lightIntensity: 0.1,
  lightColor: "#ffffff",
  particlesCount: 20,
  particlesSpeed: 0.5,
  uiTitle: "INITIALIZING",
  uiSubtitle: "Assembling core neural array...",
};

export const useStoryStore = create<StoryStoreState>((set, get) => ({
  activeNodeId: "loading",
  activeState: "entry",
  branchChoice: "default",
  locale: "en",
  interpolated: initialInterpolated,

  setBranchChoice: (choice) => {
    set({ branchChoice: choice });
    // Re-evaluate interpolation at current scroll depth immediately
    const lastProgress = (window as unknown as { __lastGlobalProgress?: number }).__lastGlobalProgress || 0;
    get().updateProgress(lastProgress);
  },

  setLocale: (locale) => {
    set({ locale });
    const lastProgress = (window as unknown as { __lastGlobalProgress?: number }).__lastGlobalProgress || 0;
    get().updateProgress(lastProgress);
  },

  updateProgress: (globalProgress) => {
    if (typeof window !== "undefined") {
      (window as unknown as { __lastGlobalProgress?: number }).__lastGlobalProgress = globalProgress;
    }

    const { branchChoice, locale } = get();
    const list = getActiveTimelineList(branchChoice);
    const L = list.length;

    // 1. Identify active node index in active branch
    const nodeIndex = Math.min(Math.floor(globalProgress * L), L - 1);
    const activeId = list[nodeIndex];
    const node = STORY_TIMELINE.find((n) => n.id === activeId);
    if (!node) return;

    // 2. Local progress inside node (0.0 to 1.0)
    const localProgress = (globalProgress * L) % 1.0;

    // 3. Determine active quadrant, source state, target state and interpolation factor
    let src: StoryState;
    let dst: StoryState;
    let t = 0;
    let stateName: StoryStateName;

    if (localProgress < 0.25) {
      stateName = "entry";
      src = node.states.entry;
      dst = node.states.focus;
      t = localProgress / 0.25;
    } else if (localProgress < 0.5) {
      stateName = "focus";
      src = node.states.focus;
      dst = node.states.interaction;
      t = (localProgress - 0.25) / 0.25;
    } else if (localProgress < 0.75) {
      stateName = "interaction";
      src = node.states.interaction;
      dst = node.states.exit;
      t = (localProgress - 0.5) / 0.25;
    } else {
      stateName = "exit";
      src = node.states.exit;
      
      // Interpolate with next node's entry if available, or stay on exit
      const nextId = list[nodeIndex + 1];
      const nextNode = nextId ? STORY_TIMELINE.find((n) => n.id === nextId) : null;
      
      dst = nextNode ? nextNode.states.entry : node.states.exit;
      t = (localProgress - 0.75) / 0.25;
    }

    // 4. Interpolate numeric and color parameters smoothly
    const interpolatedValues = {
      aiCoreScale: lerp(src.aiCoreScale, dst.aiCoreScale, t),
      aiCoreColor: lerpColor(src.aiCoreColor, dst.aiCoreColor, t),
      aiCoreShape: t > 0.5 ? dst.aiCoreShape : src.aiCoreShape,
      lightIntensity: lerp(src.lightIntensity, dst.lightIntensity, t),
      lightColor: lerpColor(src.lightColor, dst.lightColor, t),
      particlesCount: Math.round(lerp(src.particlesCount, dst.particlesCount, t)),
      particlesSpeed: lerp(src.particlesSpeed, dst.particlesSpeed, t),
      uiTitle: src.uiTitle[locale],
      uiSubtitle: src.uiSubtitle[locale],
    };

    set({
      activeNodeId: activeId,
      activeState: stateName,
      interpolated: interpolatedValues,
    });
  },
}));
export default useStoryStore;
