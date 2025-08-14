import { useEffect, useRef } from 'react';

export default function SearchModal({ open, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-bg0/80 flex items-start justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg bg-bg1 border border-b1 rounded shadow-lg">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 bg-transparent text-t1 focus:outline-none"
        />
      </div>
    </div>
  );
}
