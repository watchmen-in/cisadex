export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-b1 bg-bg0/70 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-4 h-14 flex items-center justify-between">
        <div className="text-t1 font-semibold tracking-wide">CISAdex</div>
        <nav className="flex items-center gap-6 text-sm text-t2">
          <a href="/" className="hover:text-t1 focus-ring">Map</a>
          <a href="/resource-hub" className="hover:text-t1 focus-ring">Resource Hub</a>
        </nav>
      </div>
    </header>
  );
}
