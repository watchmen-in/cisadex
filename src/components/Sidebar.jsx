export default function Sidebar({ children, open, onClose }) {
  return (
    <>
      <div className={`fixed md:static inset-y-0 left-0 w-[86%] max-w-80 md:max-w-72 bg-bg1 border-r border-b1 shadow-e1 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} z-30`}>
        <div className="h-14 md:hidden flex items-center justify-between px-4 border-b border-b1">
          <div className="text-sm text-t2">Filters</div>
          <button onClick={onClose} className="text-t2 hover:text-t1 focus-ring">✕</button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-56px)] md:h-full">
          {children}
        </div>
      </div>
      {/* Scrim for mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />}
    </>
  );
}
