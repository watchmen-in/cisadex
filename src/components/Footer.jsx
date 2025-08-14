export default function Footer() {
  return (
    <footer className="border-t border-b1 bg-bg0 mt-8">
      <div className="mx-auto max-w-[1600px] px-4 py-8 text-sm text-t2 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <a href="/taxonomy" className="hover:text-t1 focus-ring">Taxonomy</a>
          <a href="/rss.xml" className="hover:text-t1 focus-ring">RSS</a>
          <a href="/api" className="hover:text-t1 focus-ring">API</a>
          <a href="/status" className="hover:text-t1 focus-ring">Status</a>
          <a href="/license" className="hover:text-t1 focus-ring">License</a>
        </div>
        <div className="text-t2">© {new Date().getFullYear()} CISAdex</div>
      </div>
    </footer>
  );
}
