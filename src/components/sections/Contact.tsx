"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Magnetic button physics simulation
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Pull factor (adjust to change magnetic intensity)
    const pullFactor = 0.35;
    btn.style.transform = `translate(${x * pullFactor}px, ${y * pullFactor}px)`;
  };

  const handleMouseLeave = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    btn.style.transform = "translate(0px, 0px)";
  };

  const handleMouseEnter = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.transition = "none";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate edge server transmission lag
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1800);
  };

  return (
    <section
      id="contact-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-center px-8 md:px-24 py-24 bg-background select-none overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col gap-12 text-center items-center relative z-10">
        {/* Section Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[9px] text-accent-muted tracking-widest uppercase">
            05 // COLLABORATION TERMINAL
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-display text-accent tracking-tighter uppercase leading-[0.9] max-w-xl">
            Let's Engineer <br />
            Something Extraordinary.
          </h2>
        </div>

        {/* Dark Glass Interface */}
        <div className="w-full max-w-lg p-8 rounded-3xl border border-accent/5 bg-surface/30 backdrop-blur-xl shadow-2xl relative min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              /* 1. Interactive Input Form */
              <motion.form
                key="contact-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-8 text-left w-full"
              >
                {/* Name Input */}
                <div className="relative w-full">
                  <input
                    type="text"
                    required
                    id="name"
                    placeholder=" "
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-accent/10 focus:border-accent focus:outline-none py-3 text-xs text-accent transition-colors font-sans peer placeholder-transparent"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 top-3 font-mono text-[9px] text-accent-muted uppercase tracking-wider transition-all duration-300 pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:text-accent-muted/50 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-accent"
                  >
                    COMP_ID / Full Name
                  </label>
                </div>

                {/* Email Input */}
                <div className="relative w-full">
                  <input
                    type="email"
                    required
                    id="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-accent/10 focus:border-accent focus:outline-none py-3 text-xs text-accent transition-colors font-sans peer placeholder-transparent"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-3 font-mono text-[9px] text-accent-muted uppercase tracking-wider transition-all duration-300 pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:text-accent-muted/50 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-accent"
                  >
                    NET_ROUTE / Email Address
                  </label>
                </div>

                {/* Message Input */}
                <div className="relative w-full">
                  <textarea
                    required
                    rows={3}
                    id="message"
                    placeholder=" "
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border-b border-accent/10 focus:border-accent focus:outline-none py-3 text-xs text-accent transition-colors font-sans peer placeholder-transparent resize-none"
                  />
                  <label
                    htmlFor="message"
                    className="absolute left-0 top-3 font-mono text-[9px] text-accent-muted uppercase tracking-wider transition-all duration-300 pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:text-accent-muted/50 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-[8px] peer-focus:text-accent"
                  >
                    TRANSMISSION_DETAILS / Scope Description
                  </label>
                </div>

                {/* Magnetic Submit Button */}
                <div className="flex justify-end mt-4">
                  <button
                    ref={buttonRef}
                    type="submit"
                    disabled={isSubmitting}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`px-8 py-4 rounded-full font-mono text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-3 transition-colors duration-300 ${
                      isSubmitting
                        ? "bg-surface/50 text-accent-muted border border-accent/5 cursor-wait"
                        : "bg-accent text-background hover:bg-white"
                    }`}
                  >
                    <span>{isSubmitting ? "TRANSMITTING..." : "INITIALIZE PROTOCOL"}</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </motion.form>
            ) : (
              /* 2. Verification / Success State Screen */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-6 text-center w-full py-8 select-none"
              >
                <div className="relative flex items-center justify-center">
                  <CheckCircle2 size={42} className="text-accent stroke-[1.2]" />
                  <div className="absolute w-12 h-12 rounded-full border border-dashed border-accent/20 animate-spin" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[8px] text-emerald-400 font-bold tracking-widest">
                    TRANSMISSION SECURED // STABLE_METRIC
                  </span>
                  <h3 className="text-xl font-bold font-display text-accent uppercase">
                    Signal Broadcast Logged
                  </h3>
                  <p className="text-xs text-accent-muted leading-relaxed font-sans max-w-sm">
                    Your development parameters have been uploaded to our secure gateway. An engineer will initiate a net connection within 12 system hours.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-accent-muted hover:text-accent font-mono text-[8px] uppercase tracking-widest border-b border-transparent hover:border-accent/40 pb-0.5 transition-all cursor-pointer"
                >
                  DISPATCH NEW SIGNAL
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
