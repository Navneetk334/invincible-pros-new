"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Plus, Minus } from "lucide-react";

interface ServiceItem {
  name: string;
  desc: string;
  visual: React.ReactNode;
}

interface Category {
  id: string;
  title: string;
  desc: string;
  items: ServiceItem[];
}

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<string>("digital");
  const panelRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    {
      id: "digital",
      title: "Digital Products",
      desc: "Client-facing software products engineered to run with zero lag.",
      items: [
        {
          name: "Website Development",
          desc: "Stark, high-performance static shells built using App Router topographies.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* Responsive container outlines */}
              <rect x="5" y="5" width="90" height="50" rx="3" />
              <rect x="25" y="12" width="50" height="36" rx="2" strokeDasharray="3 3" />
              <line x1="15" y1="18" x2="20" y2="18" />
              <line x1="15" y1="24" x2="20" y2="24" />
              <line x1="15" y1="30" x2="20" y2="30" />
            </svg>
          ),
        },
        {
          name: "Web Portals",
          desc: "Secure customer hubs built to support high concurrency payloads.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* Keyline vault outlines */}
              <circle cx="50" cy="30" r="16" />
              <rect x="44" y="24" width="12" height="12" rx="1" />
              <line x1="50" y1="14" x2="50" y2="24" />
              <line x1="34" y1="30" x2="44" y2="30" />
              <line x1="56" y1="30" x2="66" y2="30" />
            </svg>
          ),
        },
        {
          name: "E-commerce",
          desc: "Custom checkout systems with secure third-party billing connections.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* Cart vector outlines */}
              <path d="M10,12 H22 L30,42 H76 L84,18 H26" />
              <circle cx="36" cy="48" r="4" />
              <circle cx="70" cy="48" r="4" />
            </svg>
          ),
        },
        {
          name: "Registration Panels",
          desc: "User entry databases managing authorization protocols and logging.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* User credentials container */}
              <rect x="15" y="10" width="70" height="40" rx="3" />
              <line x1="25" y1="20" x2="75" y2="20" />
              <line x1="25" y1="28" x2="55" y2="28" />
              <circle cx="30" cy="38" r="3" />
              <line x1="38" y1="38" x2="75" y2="38" />
            </svg>
          ),
        },
        {
          name: "Investment Platforms",
          desc: "High-frequency dashboard indexes compiling market metrics live.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* Rising nodes chart */}
              <path d="M10,48 L30,36 L50,42 L70,20 L90,14" />
              <circle cx="30" cy="36" r="2.5" className="fill-accent/20" />
              <circle cx="70" cy="20" r="2.5" className="fill-accent/20" />
              <circle cx="90" cy="14" r="2.5" className="fill-accent/20" />
            </svg>
          ),
        },
        {
          name: "Mobile Apps",
          desc: "Native applications constructed for iOS and Android viewports.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              {/* Smartphone layout mapping */}
              <rect x="35" y="5" width="30" height="50" rx="4" />
              <line x1="45" y1="8" x2="55" y2="8" />
              <rect x="40" y="14" width="20" height="10" rx="1" />
              <circle cx="50" cy="50" r="2" />
            </svg>
          ),
        },
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise Systems",
      desc: "Distributed backbones managing critical business transactions.",
      items: [
        {
          name: "Custom ERP Systems",
          desc: "Unified resources management platforms configured for scale.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <rect x="10" y="10" width="35" height="16" rx="2" />
              <rect x="55" y="10" width="35" height="16" rx="2" />
              <rect x="32" y="34" width="35" height="16" rx="2" />
              <path d="M27,26 V30 H48 V34" strokeDasharray="2 2" />
              <path d="M72,26 V30 H52 V34" strokeDasharray="2 2" />
            </svg>
          ),
        },
        {
          name: "CRM Topologies",
          desc: "Relational maps tracking profile activities across sync gates.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <circle cx="20" cy="20" r="6" />
              <circle cx="80" cy="20" r="6" />
              <circle cx="50" cy="45" r="8" />
              <line x1="26" y1="20" x2="42" y2="40" />
              <line x1="74" y1="20" x2="58" y2="40" />
            </svg>
          ),
        },
      ],
    },
    {
      id: "infra",
      title: "Infrastructure",
      desc: "Fiber connections, network configs, and server orchestrations.",
      items: [
        {
          name: "Cloud Servers",
          desc: "Compute nodes deployed on edge platforms with low-latency gates.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <rect x="15" y="8" width="70" height="12" rx="2" />
              <rect x="15" y="24" width="70" height="12" rx="2" />
              <rect x="15" y="40" width="70" height="12" rx="2" />
              <circle cx="25" cy="14" r="2.5" className="fill-accent/40" />
              <circle cx="25" cy="30" r="2.5" className="fill-accent/40" />
              <circle cx="25" cy="46" r="2.5" className="fill-accent/40" />
            </svg>
          ),
        },
        {
          name: "Security Citadel",
          desc: "Zero Trust firewalls monitoring packet loops and filtration.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <path d="M50,8 L80,18 V34 C80,46 50,54 50,54 C50,54 20,46 20,34 V18 L50,8 Z" />
              <path d="M40,26 L48,34 L62,20" />
            </svg>
          ),
        },
      ],
    },
    {
      id: "creative",
      title: "Creative",
      desc: "Interactive visual assets, custom shaders, and spatial layouts.",
      items: [
        {
          name: "Interactive Shaders",
          desc: "Procedural layout systems rendering dynamic graphic assets.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <circle cx="50" cy="30" r="20" strokeDasharray="4 4" />
              <polygon points="50,15 62,38 38,38" />
            </svg>
          ),
        },
        {
          name: "Media Engineering",
          desc: "Handcrafted animations designed to translate actions.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <rect x="10" y="10" width="80" height="40" rx="3" />
              <polygon points="42,20 64,30 42,40" />
            </svg>
          ),
        },
      ],
    },
    {
      id: "business",
      title: "Business Solutions",
      desc: "Custom database nodes reporting analytics metrics.",
      items: [
        {
          name: "Analytics Panels",
          desc: "Interactive platforms compiling data pipelines.",
          visual: (
            <svg viewBox="0 0 100 60" className="w-full h-12 stroke-accent/40 fill-none stroke-[1.2]">
              <rect x="10" y="8" width="80" height="44" rx="2" />
              <line x1="20" y1="40" x2="80" y2="40" />
              <line x1="20" y1="40" x2="20" y2="16" />
              <path d="M20,32 L40,24 L60,28 L80,18" />
            </svg>
          ),
        },
      ],
    },
  ];

  // GSAP timeline animation on active panel toggle
  useEffect(() => {
    if (!panelRef.current) return;

    // Direct DOM lookup for items inside current active module
    const activeCards = panelRef.current.querySelectorAll(
      `.svc-panel-${activeCategory} .svc-card`
    );

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Stagger reveal card systems inside active panels
    tl.fromTo(
      activeCards,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }
    );
  }, [activeCategory]);

  return (
    <section
      id="services-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 py-24 bg-background select-none"
    >
      <div ref={panelRef} className="w-full max-w-6xl flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
            01 // CAPABILITIES
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-accent tracking-tight uppercase">
            DISCIPLINES & SYSTEMS
          </h2>
        </div>

        {/* Modular Expandable List Container */}
        <div className="flex flex-col border-t border-accent/10 w-full mt-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="flex flex-col border-b border-accent/10 w-full overflow-hidden transition-all duration-300"
              >
                {/* Expandable Module Header Button */}
                <button
                  onClick={() => setActiveCategory(isActive ? "" : cat.id)}
                  className="w-full flex items-center justify-between py-8 text-left cursor-pointer group hover:text-accent transition-colors duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
                    <span className="text-xl md:text-3xl font-display font-bold uppercase tracking-tight text-accent">
                      {cat.title}
                    </span>
                    <span className="text-xs text-accent-muted font-sans font-light">
                      {cat.desc}
                    </span>
                  </div>
                  <div className="text-accent-muted group-hover:text-accent transition-colors duration-300">
                    {isActive ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                {/* Animated Inner Module Content Panel */}
                <div
                  className={`svc-panel-${cat.id} transition-all duration-500 ease-in-out ${
                    isActive ? "max-h-[1200px] opacity-100 pb-12" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  {/* Grid system containing visual cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.items.map((item) => (
                      <div
                        key={item.name}
                        className="svc-card p-6 rounded-2xl border border-accent/5 bg-surface/30 backdrop-blur-md flex flex-col justify-between h-[210px] hover:bg-surface/50 hover:border-accent/10 transition-all duration-300 group cursor-default"
                        style={{
                          transform: "translate3d(0,0,0)", // hardware acceleration
                        }}
                      >
                        {/* Visual SVG schematic */}
                        <div className="flex justify-between items-start">
                          <div className="w-full">{item.visual}</div>
                        </div>

                        {/* Text copy */}
                        <div className="flex flex-col gap-1.5 mt-4">
                          <h3 className="font-mono text-[10px] font-black text-accent uppercase tracking-wider">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-accent-muted font-sans leading-relaxed group-hover:text-accent-muted/80 transition-colors duration-300">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
