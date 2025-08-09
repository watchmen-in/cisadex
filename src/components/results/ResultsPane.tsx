import React, { useEffect, useRef } from 'react';

interface Props {
  entities: any[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ResultsPane({ entities, selectedId, onSelect }: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!entities.length) return;
      const idx = entities.findIndex((e) => e.id === selectedId);
      if (e.key === 'ArrowDown') {
        const next = entities[(idx + 1) % entities.length];
        onSelect(next.id);
      } else if (e.key === 'ArrowUp') {
        const prev = entities[(idx - 1 + entities.length) % entities.length];
        onSelect(prev.id);
      } else if (e.key === 'Enter' && selectedId) {
        document.dispatchEvent(
          new CustomEvent('results:open', { detail: selectedId })
        );
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [entities, selectedId, onSelect]);

  return (
    <ul ref={listRef} className="overflow-y-auto divide-y h-full">
      {entities.map((e) => (
        <li
          key={e.id}
          className={`p-2 cursor-pointer ${
            selectedId === e.id ? 'bg-blue-100' : 'bg-white'
          }`}
          onClick={() => onSelect(e.id)}
        >
          <div className="font-semibold">{e.office_name}</div>
          <div className="text-sm text-gray-600">
            {e.agency} – {e.city}, {e.state}
          </div>
        </li>
      ))}
    </ul>
  );
}
