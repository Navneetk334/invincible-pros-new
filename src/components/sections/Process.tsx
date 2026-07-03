"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProcessStep {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  metric: string;
}

export default function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps: ProcessStep[] = [
    {
      num: "01",
      title: "Discover",
      subtitle: "SCOPE_ALIGNMENT",
      desc: "We analyze database structures, compile telemetry requirements, and map system endpoints before laying the first line of code.",
      metric: "ALIGN_OK",
    },
    {
      num: "02",
      title: "Strategy",
      subtitle: "TOPOLOGY_MAP",
      desc: "Plotting cloud load balancers, server clusters, network schemas, and security databases. Absolute blueprint mapping.",
      metric: "BLUEPRINT_INIT",
    },
    {
      num: "03",
      title: "Design",
      subtitle: "KEYLINE_DRAFT",
      desc: "Drafting high-fidelity, high-contrast user interfaces, asset choreographies, and pixel-perfect layouts.",
      metric: "UX_STABLE",
    },
    {
      num: "04",
      title: "Development",
      subtitle: "SYSTEM_BUILD",
      desc: "Engineering clean Next.js frontends, Actix Rust backend APIs, and Postgres databases under strict type safety checkups.",
      metric: "COMPILE_100%",
    },
    {
      num: "05",
      title: "Testing",
      subtitle: "SANITY_AUDIT",
      desc: "Running extensive load tests, unit verification checks, and Lighthouse performance evaluations to ensure zero bottlenecks.",
      metric: "TESTS_PASS",
    },
    {
      num: "06",
      title: "Deployment",
      subtitle: "EDGE_RELEASE",
      desc: "Compiling production binaries directly to Vercel global CDN edge locations for instant access around the world.",
      metric: "LIVE_STABLE",
    },
    {
      num: "07",
      title: "Support",
      subtitle: "TELEMETRY_LOGS",
      desc: "Continuous server log audits, security checks, and database query optimizations to keep latency parameters below limits.",
      metric: "SYS_HEALTH_OK",
    },
  ];

  useEffect(() => {
    // Register ScrollTrigger within client lifecycle
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const scrollContent = scrollRef.current;
    if (!container || !scrollContent) return;

    // Build media query listener to only apply GSAP horizontal scroll on desktops
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Desktop horizontal scroll pin animation
        gsap.to(scrollContent, {
          x: () => -(scrollContent.scrollWidth - window.innerWidth + 200),
          ease: "none",
          scrollTrigger: {
            trigger: container,
            pin: true,
            start: "top top",
            end: () => `+=${scrollContent.scrollWidth}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Stagger fade-in step numbers and details during scroll scrub
        gsap.fromTo(
          ".desktop-card",
          { opacity: 0.3, y: 15 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: () => `+=${scrollContent.scrollWidth}`,
              scrub: 1.5,
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full relative bg-background">
      {/* 1. DESKTOP LAYOUT: Horizontal Scroll (lg viewport) */}
      <div className="hidden lg:block h-screen w-full overflow-hidden relative">
        {/* Animated Background Grids */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div
          ref={scrollRef}
          className="absolute top-0 bottom-0 left-0 flex items-center pl-24 pr-[20vw] gap-12 w-max"
        >
          {/* Header Column inside scroll view */}
          <div className="w-[320px] flex flex-col gap-4 text-left pr-8 select-none">
            <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
              04 // PIPELINE
            </span>
            <h2 className="text-4xl font-bold font-display text-accent tracking-tight uppercase leading-none">
              OUR ENGINEERING <br />
              METHODOLOGY
            </h2>
            <p className="text-xs text-accent-muted leading-relaxed font-sans">
              Scroll down to scrub horizontally through our step-by-step system execution pipeline.
            </p>
          </div>

          {/* Step Cards */}
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="desktop-card w-[340px] p-8 rounded-2xl border border-accent/5 bg-surface/30 backdrop-blur-md flex flex-col justify-between h-[360px] cursor-default select-none transition-all duration-300 hover:bg-surface/50 hover:border-accent/10"
            >
              <div className="flex justify-between items-start">
                <span className="text-6xl font-bold font-display text-accent-muted/15 tracking-tighter leading-none">
                  {step.num}
                </span>
                <span className="font-mono text-[8px] text-accent-muted bg-surface/80 px-2 py-0.5 rounded border border-accent/5">
                  STAGE_0{idx + 1}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-left">
                <h3 className="text-2xl font-bold font-display text-accent uppercase tracking-tight">
                  {step.title}
                </h3>
                <span className="font-mono text-[9px] text-accent-muted tracking-widest">
                  {step.subtitle}
                </span>
                <p className="text-xs text-accent-muted leading-relaxed font-sans mt-2">
                  {step.desc}
                </p>
              </div>
              <div className="flex justify-between border-t border-accent/5 pt-4 font-mono text-[8px] text-accent-muted">
                <span>METRIC_VAL:</span>
                <span className="text-accent font-bold">{step.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MOBILE LAYOUT: Vertical Stack (Mobile viewports) */}
      <div className="block lg:hidden min-h-screen w-full px-8 py-20 relative select-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="flex flex-col gap-12 text-left relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
              04 // PIPELINE
            </span>
            <h2 className="text-3xl font-bold font-display text-accent tracking-tight uppercase">
              METHODOLOGY
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl border border-accent/5 bg-surface/30 backdrop-blur-md flex flex-col justify-between h-[280px]"
              >
                <div className="flex justify-between items-start">
                  <span className="text-4xl font-bold font-display text-accent-muted/20 tracking-tighter leading-none">
                    {step.num}
                  </span>
                  <span className="font-mono text-[8px] text-accent-muted bg-surface/80 px-2 py-0.5 rounded border border-accent/5">
                    STAGE_0{idx + 1}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-4">
                  <h3 className="text-xl font-bold font-display text-accent uppercase">
                    {step.title}
                  </h3>
                  <span className="font-mono text-[8px] text-accent-muted tracking-wider">
                    {step.subtitle}
                  </span>
                  <p className="text-xs text-accent-muted leading-relaxed font-sans mt-2">
                    {step.desc}
                  </p>
                </div>
                <div className="flex justify-between border-t border-accent/5 pt-4 font-mono text-[8px] text-accent-muted mt-4">
                  <span>METRIC:</span>
                  <span className="text-accent font-bold">{step.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
