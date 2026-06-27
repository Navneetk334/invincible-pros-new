import React from "react";

export type WorldId =
  | "loading"
  | "hero"
  | "digital-hq"
  | "web-dev"
  | "mobile-app"
  | "ai"
  | "cloud-infra"
  | "crm"
  | "cyber-sec"
  | "it-infra"
  | "contact";

// Configuration Interfaces for Shared 3D Components
export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface LightingConfig {
  color: string;
  intensity: number;
  ambientMultiplier?: number;
}

export interface ParticlesConfig {
  color: string;
  speed: number;
  opacity?: number;
}

export interface AICoreConfig {
  position: [number, number, number];
  scale: number;
  color: string;
  pulseSpeed: number;
  visible: boolean;
}

export interface MascotConfig {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  visible: boolean;
}

export interface PostProcessingConfig {
  bloomIntensity: number;
  chromaticAberrationOffset: number;
}

export interface FogConfig {
  color: string;
  density: number;
}

// Unified Configuration mapping a World's preferred state for shared assets
export interface WorldSharedConfig {
  camera: CameraConfig;
  lighting: LightingConfig;
  particles: ParticlesConfig;
  aiCore: AICoreConfig;
  mascot: MascotConfig;
  postProcessing: PostProcessingConfig;
  fog: FogConfig;
}

export interface WorldSceneProps {
  isExiting?: boolean;
  transitionProgress?: number;
  opacity?: number;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  component: React.LazyExoticComponent<React.ComponentType<WorldSceneProps>>;
}

export const WORLD_REGISTRY: WorldDefinition[] = [
  {
    id: "loading",
    name: "System Boot Loader",
    component: React.lazy(() => import("@features/worlds/canvas/LoaderWorld")),
  },
  {
    id: "hero",
    name: "Hero Nexus Headquarters",
    component: React.lazy(() => import("@features/worlds/canvas/HeroWorld")),
  },
  {
    id: "digital-hq",
    name: "Digital Headquarters",
    component: React.lazy(() => import("@features/worlds/canvas/DigitalHQWorld")),
  },
  {
    id: "web-dev",
    name: "Web Development Forge",
    component: React.lazy(() => import("@features/worlds/canvas/WebDevWorld")),
  },
  {
    id: "mobile-app",
    name: "Mobile App Hub",
    component: React.lazy(() => import("@features/worlds/canvas/MobileAppWorld")),
  },
  {
    id: "ai",
    name: "Artificial Intelligence Core",
    component: React.lazy(() => import("@features/worlds/canvas/AIWorld")),
  },
  {
    id: "cloud-infra",
    name: "Cloud Infrastructure Gateway",
    component: React.lazy(() => import("@features/worlds/canvas/CloudInfraWorld")),
  },
  {
    id: "crm",
    name: "CRM Systems Node",
    component: React.lazy(() => import("@features/worlds/canvas/CRMWorld")),
  },
  {
    id: "cyber-sec",
    name: "Cyber Security Citadel",
    component: React.lazy(() => import("@features/worlds/canvas/CyberSecWorld")),
  },
  {
    id: "it-infra",
    name: "IT Infrastructure Layer",
    component: React.lazy(() => import("@features/worlds/canvas/ITInfraWorld")),
  },
  {
    id: "contact",
    name: "Contact Terminal",
    component: React.lazy(() => import("@features/worlds/canvas/ContactWorld")),
  },
];
