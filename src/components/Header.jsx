import { useState, useEffect } from "react";

export default function Header({ onSearch }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const navItems = [
    { label: "Command Center", href: "/dashboard" },
    { label: "Threat Intelligence", href: "/dashboard#overview" },
    { label: "Infrastructure Map", href: "/dashboard#map" },
    { label: "Data Feeds", href: "/dashboard#intelligence" },
    { label: "Emergency Response", href: "/dashboard#emergency" },
    { label: "Resources", href: "/dashboard#resources" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-dark/95 backdrop-blur-md">
      {/* Professional Grid Background */}
      <div className="absolute inset-0 command-grid opacity-30 pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-[1600px] px-4 h-16 flex items-center justify-between">
        {/* Professional Logo */}
        <a href="/" className="command-text-blue font-bold text-xl tracking-wide focus-ring">
          CISAdx Command
        </a>
        
        {/* Professional Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {navItems.map((n) => (
            <a 
              key={n.href} 
              href={n.href} 
              className="relative text-text-secondary hover:text-text-primary focus-ring transition-all duration-200 
                         font-medium px-3 py-2 rounded-md hover:bg-surface-panel/50"
            >
              {n.label}
            </a>
          ))}
        </nav>
        
        {/* Professional Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onSearch} 
            className="px-3 py-2 text-xs font-medium border border-command-blue 
                       bg-command-blue/10 text-command-blue hover:bg-command-blue/20 
                       rounded transition-all duration-200 focus-ring" 
            aria-label="Search"
          >
            Search
          </button>
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded border border-surface-border bg-surface-panel 
                       hover:bg-surface-accent transition-all duration-200
                       flex items-center justify-center text-text-secondary hover:text-text-primary focus-ring"
            aria-label="Toggle theme"
          >
            🌙
          </button>
          
          <a href="/status" className="hidden sm:inline-flex items-center px-3 py-1 
                                         border border-command-green bg-command-green/10 rounded
                                         text-command-green hover:bg-command-green/20
                                         transition-all duration-200
                                         text-xs font-medium focus-ring">
            Status
          </a>
          
          <a href="/rss.xml" className="hidden sm:inline-flex items-center px-3 py-1 
                                        border border-command-amber bg-command-amber/10 rounded
                                        text-command-amber hover:bg-command-amber/20
                                        transition-all duration-200
                                        text-xs font-medium focus-ring">
            RSS
          </a>
          
          <a
            href="https://github.com/"
            className="ml-2 px-3 py-2 border border-surface-border bg-surface-panel
                       text-text-secondary hover:text-text-primary hover:bg-surface-accent
                       rounded transition-all duration-200
                       text-xs font-medium focus-ring"
          >
            GitHub
          </a>
          
          <button
            className="lg:hidden w-9 h-9 border border-surface-border bg-surface-panel rounded
                       text-text-secondary hover:text-text-primary hover:bg-surface-accent
                       transition-all duration-200 flex items-center justify-center focus-ring"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden px-4 pb-4 flex flex-col gap-2 text-sm bg-surface-panel border-t border-surface-border">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-text-secondary hover:text-text-primary focus-ring py-2 px-3 rounded hover:bg-surface-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <a href="/status" className="text-text-secondary hover:text-text-primary focus-ring py-2 px-3 rounded hover:bg-surface-accent transition-colors" onClick={() => setOpen(false)}>
            Status
          </a>
          <a href="/rss.xml" className="text-text-secondary hover:text-text-primary focus-ring py-2 px-3 rounded hover:bg-surface-accent transition-colors" onClick={() => setOpen(false)}>
            RSS
          </a>
          <a href="https://github.com/" className="text-text-secondary hover:text-text-primary focus-ring py-2 px-3 rounded hover:bg-surface-accent transition-colors" onClick={() => setOpen(false)}>
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}
