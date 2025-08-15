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
    <header className="sticky top-0 z-40 w-full border-b border-b1 bg-bg0/70 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-t1 font-semibold tracking-wide focus-ring">CISAdex</a>
        <nav className="hidden lg:flex items-center gap-6 text-sm text-t2">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-t1 focus-ring transition-smooth">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onSearch} className="focus-ring text-t2 hover:text-t1 transition-smooth" aria-label="Search">
            🔍
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="focus-ring text-t2 hover:text-t1 transition-smooth"
            aria-label="Toggle theme"
          >
            🌓
          </button>
          <a href="/status" className="hidden sm:inline focus-ring text-t2 hover:text-t1 transition-smooth">
            Status
          </a>
          <a href="/rss.xml" className="hidden sm:inline focus-ring text-t2 hover:text-t1 transition-smooth">
            RSS
          </a>
          <a
            href="https://github.com/"
            className="ml-2 px-2 py-1 text-sm bg-a1 text-bg0 rounded focus-ring hover:brightness-110 transition-smooth"
          >
            Contribute
          </a>
          <button
            className="lg:hidden focus-ring text-t2 hover:text-t1 transition-smooth"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            ☰
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
