"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import WorldManager from "@core/world/WorldManager";
import useWorldStore from "@core/world/use-world-store";
import { WORLD_REGISTRY } from "@core/world/world-registry";
import { useCameraStore } from "@core/camera/use-camera-store";
import { useCinematicScroll } from "@core/camera/use-cinematic-scroll";

export default function Home() {
  // Initialize the scroll engine connecting ScrollTrigger to the camera store
  useCinematicScroll();

  const activeWorldId = useWorldStore((state) => state.activeWorldId);
  const isTransitioning = useWorldStore((state) => state.isTransitioning);
  const scrollProgress = useCameraStore((state) => state.scrollProgress);

  const handleWorldClick = (index: number) => {
    if (typeof window === "undefined") return;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / (WORLD_REGISTRY.length - 1)) * scrollHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full min-h-screen bg-[#050505] relative select-none">
      {/* 1. Fixed WebGL Viewport Container (Locked in background) */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#050505");
          }}
        >
          <Suspense fallback={null}>
            <WorldManager />
          </Suspense>
        </Canvas>
      </div>

      {/* 2. Fixed HUD Telemetry & Control Panel (Locked on left) */}
      <div className="fixed inset-y-0 left-0 w-80 bg-[#101010]/85 border-r border-[#202020] z-10 flex flex-col justify-between p-6 font-mono text-xs text-zinc-400">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-[#202020] pb-4">
            <span className="text-zinc-100 font-bold tracking-widest">INVINCIBLE PROS</span>
            <span className="text-[10px] text-zinc-500">SYS_WORLD_ENGINE_V1.1</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Cinematic Worlds Control</span>
            <div className="flex flex-col gap-1.5">
              {WORLD_REGISTRY.map((world, index) => {
                const isActive = activeWorldId === world.id;
                return (
                  <button
                    key={world.id}
                    onClick={() => handleWorldClick(index)}
                    className={`text-left p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-white text-black border-white font-bold"
                        : "border-[#202020] hover:border-zinc-500 hover:text-zinc-200 bg-[#161616]"
                    }`}
                  >
                    <span>{world.name}</span>
                    <span className="text-[9px] opacity-60">[{world.id.toUpperCase()}]</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#202020] pt-4">
          <div className="flex justify-between items-center">
            <span>ACTIVE:</span>
            <span className="text-zinc-100 font-bold">{activeWorldId.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>TRANSITION:</span>
            <span className={isTransitioning ? "text-amber-500 font-bold" : "text-zinc-500"}>
              {isTransitioning ? "SWAPPING_WAYPOINTS" : "STABLE_RENDER"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>CAMERA PROGRESS:</span>
            <span className="text-zinc-300 font-mono">{(scrollProgress * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 3. Mock Scroll Track (Allows scrolling the document body to scrub camera progress) */}
      <div className="relative z-0 h-[1100vh] w-full pointer-events-none" />
    </main>
  );
}
