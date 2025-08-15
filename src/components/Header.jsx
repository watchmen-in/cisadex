import { useState, useEffect } from "react";

export default function Header({ onSearch }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Map", href: "/map" },
    { label: "Threat Intelligence", href: "/feeds" },
    { label: "Intelligence", href: "/dashboard#intelligence" },
    { label: "Resources", href: "/dashboard#resources" },
    { label: "Report Incident", href: "/report-incident" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neon-cyan bg-matrix-deep/90 backdrop-blur-md scan-lines">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 matrix-rain pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-[1600px] px-4 h-16 flex items-center justify-between">
        {/* Logo with Neon Effect */}
        <a href="/" className="neon-text-cyan font-bold text-xl tracking-wider focus-ring animate-neon-glow">
          ◈ CISAdx ◈
        </a>
        
        {/* Navigation with Cyberpunk Styling */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {navItems.map((n, index) => (
            <a 
              key={n.href} 
              href={n.href} 
              className="relative text-neon-green hover:text-neon-cyan focus-ring transition-all duration-300 
                         hover:drop-shadow-[0_0_10px_currentColor] uppercase tracking-wide font-medium
                         animate-cyber-float"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="relative z-10">{n.label}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent 
                              opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </a>
          ))}
        </nav>
        
        {/* Action Buttons with Neon Styling */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onSearch} 
            className="btn-neon px-4 py-2 text-xs hover:animate-neon-pulse" 
            aria-label="Search"
          >
            <span className="neon-text-cyan">◉ SEARCH</span>
          </button>
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full border-2 border-neon-magenta bg-matrix-dark 
                       hover:bg-neon-magenta/20 hover:animate-neon-pulse transition-all duration-300
                       flex items-center justify-center neon-text-magenta"
            aria-label="Toggle theme"
          >
            ◈
          </button>
          <a href="/status" className="hidden sm:inline-flex items-center px-3 py-1 
                                         border border-neon-green bg-matrix-dark/50 rounded
                                         text-neon-green hover:text-neon-cyan hover:border-neon-cyan
                                         hover:bg-neon-green/10 transition-all duration-300
                                         text-xs uppercase tracking-wide font-medium focus-ring
                                         hover:drop-shadow-[0_0_8px_currentColor]">
            ◎ STATUS
          </a>
          <a href="/rss.xml" className="hidden sm:inline-flex items-center px-3 py-1 
                                        border border-neon-orange bg-matrix-dark/50 rounded
                                        text-neon-orange hover:text-neon-yellow hover:border-neon-yellow
                                        hover:bg-neon-orange/10 transition-all duration-300
                                        text-xs uppercase tracking-wide font-medium focus-ring
                                        hover:drop-shadow-[0_0_8px_currentColor]">
            ◉ RSS
          </a>
          <a
            href="https://github.com/"
            className="ml-2 px-4 py-2 border-2 border-neon-purple bg-matrix-dark
                       text-neon-purple hover:text-neon-pink hover:border-neon-pink
                       hover:bg-neon-purple/10 rounded transition-all duration-300
                       text-xs uppercase tracking-wide font-bold focus-ring
                       hover:drop-shadow-[0_0_12px_currentColor] hover:animate-neon-pulse"
          >
            ◈ GITHUB ◈
          </a>
          <button
            className="lg:hidden w-10 h-10 border-2 border-neon-cyan bg-matrix-dark rounded
                       text-neon-cyan hover:text-neon-magenta hover:border-neon-magenta
                       hover:bg-neon-cyan/10 transition-all duration-300 flex items-center justify-center
                       focus-ring hover:animate-neon-pulse"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            ◈
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden px-4 pb-4 flex flex-col gap-2 text-sm text-t2">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="hover:text-t1 focus-ring"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <a href="/status" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>
            Status
          </a>
          <a href="/rss.xml" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>
            RSS
          </a>
          <a href="https://github.com/" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>
            Contribute
          </a>
        </nav>
      )}
    </header>
  );
}
