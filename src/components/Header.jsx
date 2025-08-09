import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-b1 bg-bg0/70 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-t1 font-semibold tracking-wide focus-ring">CISAdex</a>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-t2">
          <a href="/" className="hover:text-t1 focus-ring">Home</a>
          <a href="/dashboard" className="hover:text-t1 focus-ring">Dashboard</a>
          <a href="/dashboard#resources" className="hover:text-t1 focus-ring">Resource Hub</a>
        </nav>
        <button
          className="sm:hidden focus-ring text-t2 hover:text-t1"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>
      {open && (
        <nav className="sm:hidden px-4 pb-4 flex flex-col gap-2 text-sm text-t2">
          <a href="/" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>Home</a>
          <a href="/dashboard" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>Dashboard</a>
          <a href="/dashboard#resources" className="hover:text-t1 focus-ring" onClick={() => setOpen(false)}>Resource Hub</a>
        </nav>
      )}
    </header>
  );
}
