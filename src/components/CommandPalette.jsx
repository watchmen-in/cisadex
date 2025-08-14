import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands = [
    { label: 'Home', path: '/' },
    { label: 'Map', path: '/map' },
    { label: 'Catalog', path: '/catalog' },
    { label: 'Advisories', path: '/advisories' },
    { label: 'Research', path: '/research' },
    { label: 'Data Portal', path: '/data' },
    { label: 'About', path: '/about' },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-bg0/80 flex items-start justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg bg-bg1 border border-b1 rounded shadow-lg">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const cmd = commands.find((c) => c.label.toLowerCase() === value.toLowerCase());
              if (cmd) navigate(cmd.path);
              setOpen(false);
              setValue('');
            }
          }}
          placeholder="Type a command..."
          className="w-full px-3 py-2 bg-transparent text-t1 focus:outline-none"
        />
        <ul className="p-2 text-sm max-h-60 overflow-y-auto">
          {commands.map((c) => (
            <li key={c.path} className="py-1 text-t2">{c.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
