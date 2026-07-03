"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for the glass panel tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Smooth out the tilt with spring physics
  const springConfig = { damping: 30, stiffness: 150 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  // Mouse move handler for interactive lighting and panel tilt
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Update CSS variables for hardware-accelerated spotlight gradient
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);

      // 2. Calculate tilt parameters relative to center of the viewport
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        // Max tilt range in degrees
        const maxTilt = 8;
        const tiltX = ((e.clientY - cardCenterY) / (window.innerHeight / 2)) * -maxTilt;
        const tiltY = ((e.clientX - cardCenterX) / (window.innerWidth / 2)) * maxTilt;

        rotateX.set(tiltX);
        rotateY.set(tiltY);
      }
    };

    const handleMouseLeave = () => {
      // Reset tilt values when cursor leaves screen
      rotateX.set(0);
      rotateY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rotateX, rotateY]);

  // GSAP animation for initial timeline reveal (0.8s total duration)
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Stagger reveal text elements and CTA buttons
    tl.fromTo(
      ".reveal-label",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      0.1
    )
      .fromTo(
        ".reveal-title",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.15
      )
      .fromTo(
        ".reveal-subtitle",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.3
      )
      .fromTo(
        ".reveal-ctas",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.4
      )
      .fromTo(
        ".reveal-card",
        { scale: 0.95, opacity: 0 },
        { scale: 1.0, opacity: 1, duration: 0.7 },
        0.2
      );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 py-20 overflow-hidden bg-background select-none"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Animated Engineering Grid Lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-spotlight-radial pointer-events-none transition-opacity duration-300" />

      {/* 2. Content Layout split in two columns */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Heading and Description Copy */}
        <div className="lg:col-span-7 flex flex-col items-start gap-8">
          {/* Label telemetry */}
          <div className="reveal-label opacity-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
              STUDIO_INIT // RUNNING_V1.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="reveal-title opacity-0 text-5xl md:text-8xl font-bold font-display text-accent tracking-tighter leading-[0.85] uppercase">
            WE ENGINEER <br />
            DIGITAL BUSINESSES.
          </h1>

          {/* Subtitle */}
          <p className="reveal-subtitle opacity-0 text-base text-accent-muted font-sans leading-relaxed max-w-md">
            From websites and AI to enterprise systems and IT infrastructure.
          </p>

          {/* Action CTAs */}
          <div className="reveal-ctas opacity-0 flex flex-wrap gap-4 mt-2">
            <button className="interactive-element px-7 py-4 rounded-full bg-accent text-background font-mono font-bold text-[10px] tracking-widest uppercase hover:bg-white transition-all duration-300 shadow-xl cursor-pointer">
              Start Your Project
            </button>
            <button className="interactive-element px-7 py-4 rounded-full border border-accent/15 bg-surface/50 backdrop-blur-md text-accent font-mono font-bold text-[10px] tracking-widest uppercase hover:border-accent hover:bg-surface/80 transition-all duration-300 cursor-pointer">
              Explore Our Work
            </button>
          </div>
        </div>

        {/* Right Column: Tilt-Responsive Glass Telemetry Panel */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            ref={cardRef}
            style={{
              rotateX: smoothRotateX,
              rotateY: smoothRotateY,
              transformStyle: "preserve-3d",
            }}
            className="reveal-card opacity-0 w-full max-w-[340px] p-6 rounded-2xl border border-accent/5 bg-surface/40 backdrop-blur-xl flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-default"
          >
            {/* Holographic schema grid mapping inside card */}
            <div
              className="flex flex-col gap-4 border-b border-accent/5 pb-4"
              style={{ transform: "translateZ(20px)" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-accent font-bold tracking-wider">
                  SYSTEM_DIAGNOSTICS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-accent-muted">
                <div className="flex justify-between">
                  <span>DEPLOYMENT:</span>
                  <span className="text-accent font-bold">VERCEL_EDGE</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL_CERTIFICATE:</span>
                  <span className="text-accent font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>CORE_STABILITY:</span>
                  <span className="text-accent font-bold">99.99%</span>
                </div>
              </div>
            </div>

            {/* Simulated compilation metrics code segment */}
            <div
              className="flex flex-col gap-2 font-mono text-[8px] text-accent-muted bg-background/50 p-4 rounded-lg border border-accent/5"
              style={{ transform: "translateZ(10px)" }}
            >
              <span>$ next build --static</span>
              <span className="text-emerald-400">✓ Compiled successfully in 142ms</span>
              <span className="text-yellow-500">● edge prerendering: complete</span>
              <span>Lighthouse performance audit: 100/100</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Downward scroll indicator */}
      <div className="absolute bottom-8 left-8 md:left-24 flex items-center gap-3 font-mono text-[9px] text-accent-muted animate-bounce">
        <span>SCROLL TO DISSECT</span>
        <span className="w-4 h-px bg-accent-muted/30" />
      </div>
    </section>
  );
}
