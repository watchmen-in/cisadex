export default function FilterPanel({ agencies = [], roles = [], filters, onChange }) {
  const toggle = (type, value) => {
    const set = new Set(filters[type]);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    onChange({ ...filters, [type]: Array.from(set) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold mb-2">Agency</h3>
        {agencies.map((a) => (
          <label key={a} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.agency.includes(a)}
              onChange={() => toggle('agency', a)}
            />
            <span>{a}</span>
          </label>
        ))}
      </div>
      <div>
        <h3 className="font-bold mb-2">Role</h3>
        {roles.map((r) => (
          <label key={r} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.role_type.includes(r)}
              onChange={() => toggle('role_type', r)}
            />
            <span>{r}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
