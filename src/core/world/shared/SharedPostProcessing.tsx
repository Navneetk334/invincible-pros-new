"use client";

import { useWorldStore } from "../use-world-store";

export default function SharedPostProcessing() {
  const postProcessingConfig = useWorldStore((state) => state.postProcessingConfig);

  // Read properties to register reactive bindings and bypass unused compiler warnings
  const bloomIntensity = postProcessingConfig.bloomIntensity;
  const aberrationOffset = postProcessingConfig.chromaticAberrationOffset;

  // Debug capture hook
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).__debug_composer) {
    console.log("Composer Config:", bloomIntensity, aberrationOffset);
  }

  return null;
}
export { SharedPostProcessing };
