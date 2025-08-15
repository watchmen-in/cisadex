export function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border transition-smooth ${
        active ? 'bg-brand text-black border-transparent' : 'border-b1 text-t2 hover:text-t1'
      }`}
    >
      {label}
    </button>
  );
}

export default function FeedChips({ filters, onFilterChange }) {
  const sourceTypes = [
    { id: '', label: 'All Sources' },
    { id: 'gov', label: 'Government' },
    { id: 'vendor', label: 'Vendors' },
    { id: 'research', label: 'Research' },
    { id: 'news', label: 'News' },
  ];

  const severityFilters = [
    { id: '', label: 'All Severity' },
    { id: '1', label: 'Exploited' },
    { id: '0', label: 'Not Exploited' },
  ];

  const cveFilters = [
    { id: '', label: 'All Items' },
    { id: '1', label: 'Has CVE' },
    { id: '0', label: 'No CVE' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-t2 mb-2">Source Type</h3>
        <div className="flex flex-wrap gap-2">
          {sourceTypes.map((type) => (
            <Chip
              key={type.id}
              active={filters.source_type === type.id}
              label={type.label}
              onClick={() => onFilterChange('source_type', type.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-t2 mb-2">Exploitation Status</h3>
        <div className="flex flex-wrap gap-2">
          {severityFilters.map((filter) => (
            <Chip
              key={filter.id}
              active={filters.exploited === filter.id}
              label={filter.label}
              onClick={() => onFilterChange('exploited', filter.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-t2 mb-2">CVE Information</h3>
        <div className="flex flex-wrap gap-2">
          {cveFilters.map((filter) => (
            <Chip
              key={filter.id}
              active={filters.has_cve === filter.id}
              label={filter.label}
              onClick={() => onFilterChange('has_cve', filter.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
