function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring px-3 py-1.5 rounded-full border text-sm ${active ? 'bg-brand text-black border-transparent' : 'border-b1 text-t2 hover:text-t1'}`}
    >
      {label}
    </button>
  );
}

export default function FilterPanel({ agencies = [], roles = [], filters, onChange }) {
  const toggle = (type, value) => {
    const set = new Set(filters[type]);
    if (set.has(value)) set.delete(value); else set.add(value);
    onChange({ ...filters, [type]: Array.from(set) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-b1 pb-4">
        <h3 className="text-xs uppercase tracking-wide text-t2">Agency</h3>
        <div className="flex flex-wrap gap-2">
          {agencies.map((a) => (
            <Chip key={a} label={a} active={filters.agency.includes(a)} onClick={() => toggle('agency', a)} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wide text-t2">Role</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Chip key={r} label={r} active={filters.role_type.includes(r)} onClick={() => toggle('role_type', r)} />
          ))}
        </div>
      </div>
    </div>
  );
}
