"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll progression to toggle sticky glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Programmatic smooth scroll to viewport targets
  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const serviceCategories = [
    {
      title: "Product Engineering",
      items: [
        { name: "Web Applications", desc: "Next.js & WebGL systems compiled for Edge." },
        { name: "Mobile Engineering", desc: "Native client viewports with zero latencies." },
        { name: "Enterprise Systems", desc: "Large-scale distributed systems and databases." },
      ],
    },
    {
      title: "Spatial & Intelligence",
      items: [
        { name: "AI Core Integrations", desc: "Cognitive synapses and contextual tensors." },
        { name: "Creative Media Solutions", desc: "Interactive shaders, WebGL, and custom assets." },
      ],
    },
    {
      title: "Infrastructure & Security",
      items: [
        { name: "Cloud Services & Networking", desc: "Elastic compute clusters and load balancers." },
        { name: "Cybersecurity Citadel", desc: "Zero Trust firewalls and packet filtration gates." },
        { name: "IT Infrastructure Layer", desc: "Fiber-optic networks and server topology configs." },
      ],
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-4 bg-surface/40 backdrop-blur-xl border-b border-accent/5"
            : "py-6 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          {/* 1. Logo Left */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer font-display font-bold text-sm text-accent uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>INVINCIBLE PROS</span>
          </button>

          {/* 2. Menu Right (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-widest text-accent-muted uppercase">
            {/* Services Dropdown Trigger */}
            <div
              className="relative py-2 cursor-pointer"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  megaMenuOpen ? "text-accent" : "hover:text-accent"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  size={10}
                  className={`transition-transform duration-300 ${
                    megaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-full -left-[300px] w-[800px] bg-surface/90 border border-accent/5 backdrop-blur-xl rounded-2xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.6)] mt-2 grid grid-cols-3 gap-6 text-left"
                  >
                    {serviceCategories.map((cat) => (
                      <div key={cat.title} className="flex flex-col gap-4">
                        <span className="text-[9px] text-accent font-bold tracking-wider border-b border-accent/5 pb-1">
                          {cat.title.toUpperCase()}
                        </span>
                        <div className="flex flex-col gap-3 font-sans text-xs">
                          {cat.items.map((item) => (
                            <a
                              key={item.name}
                              href="#services"
                              onClick={(e) => {
                                e.preventDefault();
                                handleScrollTo("services-section");
                              }}
                              className="group flex flex-col gap-0.5 hover:text-accent transition-colors"
                            >
                              <span className="font-mono text-[9px] uppercase tracking-widest font-black text-accent-muted group-hover:text-accent">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-sans leading-snug">
                                {item.desc}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleScrollTo("about-section")}
              className="hover:text-accent transition-colors cursor-pointer py-2"
            >
              About
            </button>
            <button
              onClick={() => handleScrollTo("process-section")}
              className="hover:text-accent transition-colors cursor-pointer py-2"
            >
              Process
            </button>
            <button
              onClick={() => handleScrollTo("portfolio-section")}
              className="hover:text-accent transition-colors cursor-pointer py-2"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleScrollTo("contact-section")}
              className="px-4 py-2.5 rounded-full bg-accent text-background font-bold text-[9px] uppercase tracking-widest hover:bg-white transition-all duration-300 cursor-pointer shadow-lg ml-2"
            >
              Start Project
            </button>
          </nav>

          {/* Hamburger Trigger (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-accent cursor-pointer z-50 p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* 3. Fullscreen mobile navigation overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col justify-center items-start px-12 md:hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              }}
              className="flex flex-col gap-6 text-3xl font-display font-bold uppercase text-accent tracking-tighter"
            >
              {[
                { label: "Services", target: "services-section" },
                { label: "About Us", target: "about-section" },
                { label: "Our Process", target: "process-section" },
                { label: "Case Blueprints", target: "portfolio-section" },
                { label: "Engage Protocol", target: "contact-section" },
              ].map((link, idx) => (
                <motion.div
                  key={link.label}
                  variants={{
                    open: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.4 } },
                    closed: { y: 20, opacity: 0 },
                  }}
                >
                  <button
                    onClick={() => handleScrollTo(link.target)}
                    className="flex items-center gap-4 text-left group hover:text-accent-muted transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-[10px] text-accent-muted font-bold tracking-widest">
                      0{idx + 1}
                    </span>
                    <span>{link.label}</span>
                    <ArrowRight
                      size={18}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
