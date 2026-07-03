"use client";

export default function Footer() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      id="footer-section"
      className="w-full border-t border-accent/5 bg-background py-16 px-8 md:px-24 select-none relative z-10"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Upper Grid: Brand and Important Links */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 w-full">
          {/* Animated Logo (Letters drift apart on hover) */}
          <div className="flex flex-col items-start gap-2 select-none">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-2 cursor-pointer font-display font-black text-sm text-accent uppercase tracking-wider transition-all duration-500 hover:tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:bg-white animate-pulse" />
              <span>INVINCIBLE PROS</span>
            </button>
            <span className="font-mono text-[8px] text-accent-muted tracking-widest uppercase">
              // COMPUTATION_GUILD
            </span>
          </div>

          {/* Important Links Only */}
          <nav className="flex flex-wrap gap-8 font-mono text-[9px] text-accent-muted tracking-widest uppercase">
            <button
              onClick={() => handleScrollTo("services-section")}
              className="hover:text-accent transition-colors duration-300 cursor-pointer"
            >
              /CAPABILITIES
            </button>
            <button
              onClick={() => handleScrollTo("portfolio-section")}
              className="hover:text-accent transition-colors duration-300 cursor-pointer"
            >
              /BLUEPRINTS
            </button>
            <button
              onClick={() => handleScrollTo("architecture-section")}
              className="hover:text-accent transition-colors duration-300 cursor-pointer"
            >
              /ARCH
            </button>
            <button
              onClick={() => handleScrollTo("process-section")}
              className="hover:text-accent transition-colors duration-300 cursor-pointer"
            >
              /PIPELINE
            </button>
            <button
              onClick={() => handleScrollTo("contact-section")}
              className="hover:text-accent transition-colors duration-300 cursor-pointer"
            >
              /TERMINAL
            </button>
          </nav>
        </div>

        {/* Lower Row: Copyright and Social links */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-t border-accent/5 pt-8 w-full font-mono text-[8px] text-accent-muted uppercase tracking-widest">
          {/* Copyright notice */}
          <span>© 2026 INVINCIBLE PROS. ALL RIGHTS RESERVED.</span>

          {/* Social Links */}
          <div className="flex gap-6 items-center">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-300"
            >
              GITHUB
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-300"
            >
              LINKEDIN
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-300"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
