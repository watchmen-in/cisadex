export function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border ${
        active ? 'bg-brand text-black border-transparent' : 'border-b1 text-t2 hover:text-t1'
      }`}
    >
      {label}
    </button>
  );
}
