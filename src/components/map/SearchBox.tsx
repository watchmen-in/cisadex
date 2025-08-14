import React, { useEffect, useRef, useState } from 'react';
import summary from '@/data/summary.json';

interface Props {
  onSelect: (id: string) => void;
}

export default function SearchBox({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const data = summary as any[];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      } else if (e.key === 'ArrowDown') {
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter' && results[active]) {
        onSelect(results[active].id);
        setResults([]);
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, active, onSelect]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      data.filter(
        (e) =>
          e.office_name.toLowerCase().includes(q) ||
          e.agency.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
      )
    );
    setActive(0);
  }, [query, data]);

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded border"
        placeholder="Search…"
        aria-label="Global search"
      />
      {results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white shadow z-10 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={r.id}
              className={`p-2 cursor-pointer ${
                i === active ? 'bg-blue-100' : 'bg-white'
              }`}
              onMouseDown={() => onSelect(r.id)}
            >
              {r.office_name} – {r.city}, {r.state}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
