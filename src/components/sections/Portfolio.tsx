"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  timeline: string;
  tech: string[];
  desc: string;
  mockupType: "macbook" | "phone";
  visualContent: React.ReactNode;
}

export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = [
    {
      id: "project-1",
      title: "Ecosystem Orchestrator",
      client: "Synapse Global",
      category: "Distributed Cloud Platform",
      timeline: "Q1-Q2 2026",
      tech: ["Kubernetes", "Next.js 15", "Rust", "WebAssembly"],
      desc: "An enterprise orchestrator compiling client applications and routing database nodes globally via edge CDN topographies.",
      mockupType: "macbook",
      visualContent: (
        /* MacBook screen contents - Animated dashboard */
        <div className="w-full h-full bg-[#08080c] p-3 font-mono flex flex-col gap-2 overflow-hidden text-[7px] text-accent-muted">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center border-b border-accent/5 pb-1">
            <span className="text-[8px] text-accent font-bold tracking-wider">SYNAPSE_CORE // V1.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {/* Charts grid */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="border border-accent/5 bg-surface/40 p-1.5 rounded flex flex-col gap-0.5">
              <span>LATENCY:</span>
              <span className="text-accent font-bold">&lt; 0.8ms</span>
            </div>
            <div className="border border-accent/5 bg-surface/40 p-1.5 rounded flex flex-col gap-0.5">
              <span>COMPRESSION:</span>
              <span className="text-accent font-bold">BR_99.4%</span>
            </div>
            <div className="border border-accent/5 bg-surface/40 p-1.5 rounded flex flex-col gap-0.5">
              <span>STABILITY:</span>
              <span className="text-emerald-400 font-bold">STABLE</span>
            </div>
          </div>
          {/* Floating node simulation */}
          <div className="flex-1 border border-accent/5 bg-surface/30 rounded p-2 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Spinning vector schema */}
            <div className="w-12 h-12 rounded-full border border-dashed border-accent/15 animate-spin flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border border-dashed border-accent/30 animate-ping" />
            </div>
            <span className="text-[6px] tracking-widest text-accent-muted uppercase absolute bottom-1.5">
              ROUTING_DATABASE_NODES...
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "project-2",
      title: "Cognitive Synapse",
      client: "Neural Systems Inc.",
      category: "Mobile Intelligence App",
      timeline: "Q2-Q3 2026",
      tech: ["React Native", "PyTorch", "Redis", "Vector DB"],
      desc: "A client application integrating synaptic cognitive libraries and biometric pipelines locally inside handheld viewports.",
      mockupType: "phone",
      visualContent: (
        /* Phone screen contents - Biometric stream */
        <div className="w-full h-full bg-[#050508] p-4 font-mono flex flex-col justify-between items-center overflow-hidden text-[8px] text-accent-muted">
          {/* Network indicator */}
          <div className="w-full flex justify-between items-center text-[6px]">
            <span>COGNITIVE.IO</span>
            <div className="flex gap-0.5 items-center">
              <div className="w-1 h-2 bg-accent/40 rounded-sm" />
              <div className="w-1 h-3 bg-accent/40 rounded-sm" />
              <div className="w-1 h-4 bg-accent rounded-sm" />
            </div>
          </div>
          {/* Scanning biometric grid */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Dynamic radar ring */}
            <div className="absolute inset-0 rounded-full border border-accent/25 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-accent/40 animate-pulse" />
            {/* Intersecting scanning line */}
            <div className="absolute w-20 h-[1px] bg-accent/30 top-1/2 -translate-y-1/2 animate-bounce" />
            <span className="text-[7px] text-accent tracking-widest font-black">SCAN_ON</span>
          </div>
          {/* Sync logs */}
          <div className="w-full border border-accent/5 bg-surface/50 p-2 rounded flex flex-col gap-0.5 text-[6px] text-left">
            <span className="text-accent font-bold">BIOMETRIC_STREAM: ON</span>
            <span>- Synaptic weight: 1.42</span>
            <span>- Frame loop latency: 1.1ms</span>
          </div>
        </div>
      ),
    },
    {
      id: "project-3",
      title: "Secure Client Portal",
      client: "Citadel Security",
      category: "Zero Trust Web Console",
      timeline: "Q3-Q4 2026",
      tech: ["Next.js 15", "PostgreSQL", "Laravel", "OAuth"],
      desc: "A Zero Trust client portal executing packet filtration routines, metadata sanitizations, and secure profile authentications.",
      mockupType: "macbook",
      visualContent: (
        /* MacBook screen contents - Security console */
        <div className="w-full h-full bg-[#050506] p-3 font-mono flex flex-col gap-2 overflow-hidden text-[7px] text-accent-muted">
          {/* Console Header */}
          <div className="flex justify-between items-center border-b border-accent/5 pb-1">
            <span className="text-[8px] text-accent font-bold tracking-wider">CITADEL_FIREWALL_LOGS</span>
            <span className="text-yellow-500">ENFORCED</span>
          </div>
          {/* Packet logs */}
          <div className="flex-1 flex flex-col gap-1 text-[6px] text-left bg-black/45 p-2 rounded border border-accent/5">
            <span>$ iptables -A INPUT -p tcp --dport 443 -j ACCEPT</span>
            <span className="text-emerald-400">✓ [PACKET_SANITY_CHECK] PASS: SSL_STABLE</span>
            <span>$ tail -f /var/log/citadel-audit.log</span>
            <span>- 192.168.1.1 payload size: 242 bytes // verified</span>
            <span className="text-yellow-500 animate-pulse">- Warning: Port scan loop rejected from edge node</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      ref={containerRef}
      id="portfolio-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 py-24 bg-background select-none"
    >
      <div className="w-full max-w-6xl flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
            02 // CASE BLUEPRINTS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-accent tracking-tight uppercase">
            SELECTED BLUEPRINTS
          </h2>
        </div>

        {/* Project List (Large Project Cards) */}
        <div className="flex flex-col gap-20 w-full mt-6">
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              className={`flex flex-col lg:flex-row items-center gap-12 w-full group border-b border-accent/5 pb-16 ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Left/Right Text Column (Reveals detailed info on card hover) */}
              <div className="flex-1 flex flex-col items-start gap-4 text-left">
                <span className="font-mono text-[9px] text-accent-muted tracking-wider uppercase">
                  PROJECT_0{idx + 1} // {proj.category.toUpperCase()}
                </span>
                <h3 className="text-3xl md:text-5xl font-bold font-display text-accent uppercase tracking-tighter transition-colors group-hover:text-white duration-300">
                  {proj.title}
                </h3>
                <p className="text-sm text-accent-muted leading-relaxed font-sans max-w-md">
                  {proj.desc}
                </p>

                {/* Staggered project information panel (Revealed smoothly on hover) */}
                <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[150px] group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col gap-3 pt-2 font-mono text-[9px] text-accent-muted border-t border-accent/5 w-full max-w-md">
                  <div className="flex justify-between">
                    <span>CLIENT_ID:</span>
                    <span className="text-accent font-bold">{proj.client.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIMELINE:</span>
                    <span className="text-accent font-bold">{proj.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TECH_STACK:</span>
                    <span className="text-accent font-bold">{proj.tech.join(" // ")}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Column */}
              <div className="flex-1 flex justify-center items-center w-full">
                {proj.mockupType === "macbook" ? (
                  /* 1. MacBook Mockup Structure */
                  <div className="relative w-full max-w-[460px] aspect-[16/10] bg-transparent flex flex-col items-center">
                    {/* Bezel / Screen */}
                    <div className="w-[88%] aspect-[16/10] bg-[#121214] rounded-t-xl border-[6px] border-[#0a0a0c] shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
                      {/* Top Camera Dot */}
                      <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black flex items-center justify-center">
                        <div className="w-[2px] h-[2px] rounded-full bg-blue-500/50" />
                      </div>
                      {/* Screen content */}
                      <div className="flex-1 w-full bg-background overflow-hidden relative">
                        {proj.visualContent}
                      </div>
                    </div>
                    {/* Keyboard base lip */}
                    <div className="w-full h-[6px] bg-[#0c0c0e] rounded-t-sm relative border-b border-[#050505]" />
                    <div className="w-[18%] h-[3px] bg-[#060608] rounded-b-md mx-auto" />
                  </div>
                ) : (
                  /* 2. Phone Mockup Structure */
                  <div className="relative w-full max-w-[210px] aspect-[9/19.5] bg-[#0c0c0e] rounded-[36px] border-[5px] border-[#050505] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
                    {/* Top Speaker/Notch (Dynamic Island style) */}
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-[#050505] flex items-center justify-center z-20" />
                    {/* Screen content */}
                    <div className="flex-1 w-full h-full rounded-[28px] overflow-hidden bg-background relative border border-accent/5">
                      {proj.visualContent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
