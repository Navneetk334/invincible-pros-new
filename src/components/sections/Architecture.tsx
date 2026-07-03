"use client";

import { useState } from "react";

interface TechNode {
  id: string;
  name: string;
  title: string;
  engine: string;
  desc: string;
  status: string;
  yPos: number;
}

export default function Architecture() {
  const [activeNode, setActiveNode] = useState<string>("frontend");

  const nodes: TechNode[] = [
    {
      id: "frontend",
      name: "Frontend",
      title: "FRONTEND COMPILATION LAYER",
      engine: "Next.js 15 // React 19 // Tailwind",
      desc: "Pure, high-performance client layouts compiling React server components, R3F shaders, and smooth animation viewport choreographies.",
      status: "100/100 LIGHTHOUSE",
      yPos: 30,
    },
    {
      id: "backend",
      name: "Backend",
      title: "BACKEND COMPRESSION CORE",
      engine: "Rust Actix // Node.js Core",
      desc: "Multi-threaded async server nodes managing high concurrency API payloads, route authentications, and pipeline tasks.",
      status: "LATENCY < 1.2ms",
      yPos: 110,
    },
    {
      id: "database",
      name: "Database",
      title: "DATABASE SYSTEM REGISTRY",
      engine: "PostgreSQL // Vector DB",
      desc: "Relational database structures storing project logs, telemetry coordinates, and semantic vector coordinates with multi-zone redundancy.",
      status: "REDUNDANCY: MULTI_ZONE",
      yPos: 190,
    },
    {
      id: "cloud",
      name: "Cloud Edge",
      title: "CLOUD EDGE DISTRIBUTION",
      engine: "Vercel Edge // AWS CDNs",
      desc: "Edge cloud deployment distributing asset payloads globally to physical points of presence for zero-latency load gates.",
      status: "DEPLOYED_STABLE",
      yPos: 270,
    },
    {
      id: "analytics",
      name: "Analytics",
      title: "TELEMETRY & LOGGING PIPELINE",
      engine: "ClickHouse telemetry logs",
      desc: "Live collection systems gathering user interaction analytics, scroll speeds, and click logs to map real-time performance indicators.",
      status: "FREQ: REAL_TIME",
      yPos: 350,
    },
    {
      id: "monitoring",
      name: "Monitoring",
      title: "SECURITY MONITORING CITADEL",
      engine: "Zero Trust Threat Detection",
      desc: "Active protection routines executing packet integrity checks, routing firewalls, and rejecting malicious port stream triggers.",
      status: "SECURITY: SECURE_OK",
      yPos: 430,
    },
  ];

  const currentNode = nodes.find((n) => n.id === activeNode) || nodes[0];

  return (
    <section
      id="architecture-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 py-24 bg-background select-none"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Tech Node Details Panel */}
        <div className="lg:col-span-5 flex flex-col gap-8 text-left">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
              03 // TECHNOLOGY ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-accent tracking-tight uppercase">
              SYSTEM LIFECYCLE
            </h2>
          </div>

          <p className="text-sm text-accent-muted font-sans leading-relaxed">
            Click on any pipeline node in the architecture diagram to inspect its performance metrics, stack registries, and data flow structures.
          </p>

          {/* Interactive Console details */}
          <div className="p-6 rounded-2xl border border-accent/5 bg-surface/30 backdrop-blur-md flex flex-col gap-4 font-mono text-[9px] text-accent-muted min-h-[220px]">
            <div className="flex justify-between items-center border-b border-accent/5 pb-2">
              <span className="text-accent font-bold tracking-wider">{currentNode.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5 font-sans text-xs">
              <span className="font-mono text-[9px] text-accent uppercase tracking-widest font-black">
                {currentNode.engine}
              </span>
              <p className="text-[11px] text-accent-muted leading-relaxed mt-1">
                {currentNode.desc}
              </p>
            </div>
            <div className="flex justify-between border-t border-accent/5 pt-3 mt-auto font-mono text-[9px]">
              <span>NODE_STATUS:</span>
              <span className="text-accent font-bold">{currentNode.status}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Architecture SVG Diagram */}
        <div className="lg:col-span-7 flex justify-center items-center w-full">
          <svg
            viewBox="0 0 400 500"
            className="w-full max-w-[340px] md:max-w-[420px] stroke-[1.2] fill-none"
          >
            {/* 1. Connecting Data Pipeline Lines */}
            {/* Base static vector path */}
            <path
              d="M200 30 V 430"
              className="stroke-accent/10"
              strokeWidth="2"
            />
            {/* Animated data packet streams */}
            <path
              d="M200 30 V 430"
              className="stroke-accent/60 stroke-dash-move"
              strokeWidth="2"
              strokeDasharray="15 45"
            />

            {/* 2. Pipeline Stage Nodes */}
            {nodes.map((node) => {
              const isActive = activeNode === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer glow target */}
                  <rect
                    x="90"
                    y={node.yPos - 20}
                    width="220"
                    height="40"
                    rx="6"
                    className={`transition-all duration-300 ${
                      isActive
                        ? "fill-surface/80 stroke-accent"
                        : "fill-surface/40 stroke-accent/5 group-hover:stroke-accent/30 group-hover:fill-surface/60"
                    }`}
                  />

                  {/* Indicator Dot */}
                  <circle
                    cx="115"
                    cy={node.yPos}
                    r="3.5"
                    className={`transition-all duration-300 ${
                      isActive
                        ? "fill-accent animate-pulse"
                        : "fill-accent-muted/40 group-hover:fill-accent-muted"
                    }`}
                  />

                  {/* Node Label Text */}
                  <text
                    x="135"
                    y={node.yPos + 3.5}
                    className={`font-mono text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${
                      isActive
                        ? "fill-accent"
                        : "fill-accent-muted group-hover:fill-accent"
                    }`}
                  >
                    {node.name}
                  </text>

                  {/* Mini Coordinate Info */}
                  <text
                    x="295"
                    y={node.yPos + 3.5}
                    textAnchor="end"
                    className="font-mono text-[7px] fill-accent-muted/30 group-hover:fill-accent-muted/50 transition-colors"
                  >
                    0{nodes.indexOf(node) + 1}_NODE
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
