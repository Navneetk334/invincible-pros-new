"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import gsap from "gsap";
import WorldManager from "@core/world/WorldManager";
import useWorldStore from "@core/world/use-world-store";
import { WORLD_REGISTRY } from "@core/world/world-registry";
import { useCameraStore } from "@core/camera/use-camera-store";
import { useCinematicScroll } from "@core/camera/use-cinematic-scroll";
import { useAudioStore } from "@core/audio/use-audio-store";
import { useStoryStore, getActiveTimelineList } from "@core/story/use-story-store";
import { useInteractionStore } from "@core/interaction/use-interaction";

export default function Home() {
  // Initialize the scroll engine connecting ScrollTrigger to the camera store
  useCinematicScroll();

  const activeWorldId = useWorldStore((state) => state.activeWorldId);
  const scrollProgress = useCameraStore((state) => state.scrollProgress);
  const shakeEnabled = useCameraStore((state) => state.shakeEnabled);

  const unlock = useAudioStore((state) => state.unlock);
  const playClick = useAudioStore((state) => state.playClick);

  // Tooltip tracking states
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const tooltipText = useInteractionStore((state) => state.tooltipText);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setTooltipPos({ x: e.clientX + 16, y: e.clientY + 16 });
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  // Story Engine selectors
  const activeState = useStoryStore((state) => state.activeState);
  const locale = useStoryStore((state) => state.locale);
  const branchChoice = useStoryStore((state) => state.branchChoice);
  const interpolated = useStoryStore((state) => state.interpolated);
  
  const setLocale = useStoryStore((state) => state.setLocale);
  const setBranchChoice = useStoryStore((state) => state.setBranchChoice);

  // Retrieve active branch timeline nodes list dynamically
  const activeList = getActiveTimelineList(branchChoice);
  const activeWorlds = WORLD_REGISTRY.filter((w) => activeList.includes(w.id));

  // Determine active index for counter display
  const activeIndex = activeList.indexOf(activeWorldId);
  const counterText = (activeIndex + 1).toString().padStart(2, "0");

  // Global window listener to unlock audio context on initial page interaction
  useEffect(() => {
    const handleGlobalClick = () => {
      unlock();
    };
    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [unlock]);

  // GSAP Transition timelines on active scene swaps
  useEffect(() => {
    // 1. Text slide entry
    gsap.fromTo(
      ".hud-title-slide",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.05 }
    );

    // 2. Large backdrop counter scale entry
    gsap.fromTo(
      ".hud-counter-slide",
      { scale: 0.75, opacity: 0 },
      { scale: 1.0, opacity: 0.07, duration: 1.2, ease: "power2.out" }
    );
  }, [activeWorldId]);

  const handleWorldClick = (index: number) => {
    unlock();
    playClick();

    if (typeof window === "undefined") return;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / (activeList.length - 1)) * scrollHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const scrollToContact = () => {
    handleWorldClick(activeList.length - 1);
  };

  return (
    <main className="w-full min-h-screen bg-[#050505] relative select-none overflow-hidden">
      {/* 1. Fixed WebGL Viewport Container (Locked in background) */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#050505");
          }}
          onPointerMissed={() => {
            useCameraStore.getState().triggerReset();
            useInteractionStore.getState().setFocused(null);
          }}
        >
          <Suspense fallback={null}>
            <WorldManager />
          </Suspense>
        </Canvas>
      </div>

      {/* 2. Floating Header Bar (Top viewport boundary) */}
      <header className="fixed top-0 inset-x-0 h-16 px-8 z-10 flex items-center justify-between font-mono text-[10px] text-zinc-500 pointer-events-none">
        <div className="flex items-center gap-4 hud-logo pointer-events-auto">
          <span className="text-zinc-100 font-bold tracking-widest text-[11px]">INVINCIBLE PROS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>V1.2</span>
        </div>

        {/* Floating branch track selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-full border border-white/5 bg-black/45 backdrop-blur-md pointer-events-auto">
          {(["default", "alternative"] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                playClick();
                setBranchChoice(c);
              }}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                branchChoice === c
                  ? "bg-white text-black font-extrabold"
                  : "hover:text-zinc-200 text-zinc-500"
              }`}
            >
              {c === "default" ? "Linear timeline" : "Neural pathway"}
            </button>
          ))}
        </div>

        {/* Floating localized language selectors */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {(["en", "de", "fr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => {
                playClick();
                setLocale(l);
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all duration-300 cursor-pointer ${
                locale === l
                  ? "bg-white text-black border-white"
                  : "border-[#202020] text-zinc-500 bg-black/35 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* 3. Massive Background Scene Counter (Left viewport quadrant) */}
      <div className="fixed left-10 top-1/4 pointer-events-none select-none z-1 flex flex-col items-start gap-1">
        <span className="hud-counter-slide text-[12vw] font-black text-white/5 tracking-tighter leading-none">
          {counterText}
        </span>
        <div className="hud-title-slide flex flex-col font-mono text-[9px] text-zinc-600 gap-0.5 pl-3">
          <span>ACTIVE_NODE: {activeWorldId.toUpperCase()}</span>
          <span>STATE_QUADRANT: {activeState.toUpperCase()}</span>
        </div>
      </div>

      {/* 4. Center-Left Hero Narrative Title (Focal overlay) */}
      <section className="fixed left-12 bottom-1/4 max-w-lg z-10 select-none pointer-events-none flex flex-col gap-2">
        <h1 className="hud-title-slide text-5xl font-black text-white tracking-tight uppercase leading-none">
          {interpolated.uiTitle}
        </h1>
        <p className="hud-title-slide text-sm text-zinc-400 font-sans leading-relaxed">
          {interpolated.uiSubtitle}
        </p>
      </section>

      {/* 5. Right Telemetry Widget Grid (Mission Control Aesthetic) */}
      <aside className="fixed right-8 top-20 bottom-24 w-64 z-10 flex flex-col justify-between font-mono text-[9px] text-zinc-500 pointer-events-none">
        
        {/* Core diagnostics glass panel */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/35 backdrop-blur-md flex flex-col gap-2.5 pointer-events-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
            <span className="text-zinc-300 font-bold">COGNITIVE_ARRAY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex justify-between">
            <span>CORE_STATUS:</span>
            <span className="text-zinc-200">ACTIVE_RUNNING</span>
          </div>
          <div className="flex justify-between">
            <span>CORE_SHAPE:</span>
            <span className="text-zinc-200 uppercase">{interpolated.aiCoreShape}</span>
          </div>
          <div className="flex justify-between">
            <span>CORE_SCALE:</span>
            <span className="text-zinc-200">x{interpolated.aiCoreScale.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>CORE_COLOR:</span>
            <span className="text-zinc-200 uppercase" style={{ color: interpolated.aiCoreColor }}>
              {interpolated.aiCoreColor}
            </span>
          </div>
        </div>

        {/* Active branch timeline nodes index widget */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/35 backdrop-blur-md flex flex-col gap-2 pointer-events-auto my-4 overflow-y-auto max-h-[30vh]">
          <span className="text-zinc-300 font-bold border-b border-white/5 pb-1.5">SYSTEM_INDEX</span>
          <div className="flex flex-col gap-1.5 pt-1">
            {activeWorlds.map((world) => {
              const index = activeList.indexOf(world.id);
              const isActive = activeWorldId === world.id;
              return (
                <button
                  key={world.id}
                  onClick={() => handleWorldClick(index)}
                  className={`text-left text-[8px] uppercase tracking-wider py-1 border-b border-transparent transition-all duration-300 flex justify-between cursor-pointer ${
                    isActive 
                      ? "text-white border-white/20 font-bold" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span>{world.name}</span>
                  <span>[{world.id.substring(0, 3).toUpperCase()}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live camera coordinates widget */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/35 backdrop-blur-md flex flex-col gap-2.5 pointer-events-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
            <span className="text-zinc-300 font-bold">OPTICAL_TELEMETRY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <div className="flex justify-between">
            <span>TRACKING_STATUS:</span>
            <span className="text-zinc-200 font-bold text-amber-500">LOCKED_ON_SPLINE</span>
          </div>
          <div className="flex justify-between">
            <span>COORDS_XYZ:</span>
            <span id="hud-cam-coords" className="text-zinc-100 font-bold font-mono">0.00, 0.00, 10.00</span>
          </div>
          <div className="flex justify-between">
            <span>SHAKE_JITTER:</span>
            <span className="text-zinc-200">{shakeEnabled ? "MODULATED" : "BYPASSED"}</span>
          </div>
        </div>
      </aside>

      {/* 6. Cinematic Horizontal Progress Track (Bottom viewport boundary) */}
      <footer className="fixed bottom-0 inset-x-0 h-16 px-8 z-10 flex items-center justify-between font-mono text-[9px] text-zinc-600 pointer-events-none">
        
        {/* Left footer copyright */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <span>© 2026 INVINCIBLE PROS. ALL RIGHTS RESERVED.</span>
          <span>SYS_LOCALE: {locale.toUpperCase()}</span>
        </div>

        {/* Center horizontal progress track scrub bar */}
        <div className="w-96 flex items-center gap-3 p-2 rounded-full border border-white/5 bg-black/45 backdrop-blur-md pointer-events-auto">
          <span>00:00</span>
          <div className="flex-1 h-0.5 bg-zinc-800 rounded-full relative">
            {/* Sliding progress dot */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-black shadow"
              style={{ left: `calc(${scrollProgress * 100}% - 5px)` }}
            />
          </div>
          <span>{(scrollProgress * 100).toFixed(0)}%</span>
        </div>

        {/* Bottom right corner floating CTA button */}
        <button
          onClick={scrollToContact}
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-[9px] tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          ENGAGE PROTOCOL
        </button>
      </footer>
      {tooltipText && (
        <div 
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg border border-white/10 bg-black/75 backdrop-blur-md text-[9px] font-mono text-zinc-100 tracking-wider flex items-center gap-2"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>{tooltipText.toUpperCase()}</span>
        </div>
      )}
    </main>
  );
}
export { Home };
