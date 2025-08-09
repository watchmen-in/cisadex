import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/map/SearchBox';

export default function Home() {
  const navigate = useNavigate();
  const applyFilter = (type: string, value: string) => {
    const f = encodeURIComponent(JSON.stringify({ [type]: [value] }));
    navigate(`/browse?f=${f}`);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center space-y-6">
      <SearchBox onSelect={(id) => navigate(`/entity/${id}`)} />
      <button
        className="px-4 py-2 bg-blue-600 rounded"
        onClick={() => navigate('/browse')}
      >
        Browse map
      </button>
      <div className="flex gap-4 flex-wrap justify-center max-w-xl">
        {['FBI', 'FEMA'].map((a) => (
          <button
            key={a}
            onClick={() => applyFilter('agencies', a)}
            className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm"
          >
            {a}
          </button>
        ))}
        {['Water', 'Law Enforcement'].map((s) => (
          <button
            key={s}
            onClick={() => applyFilter('sectors', s)}
            className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
