import React from 'react';
import {
  SECTORS,
  FUNCTIONS,
  AGENCIES,
  STATES,
  Filters,
} from '../../constants/taxonomy';

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
}

function toggle(arr: string[] = [], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

const ChipGroup = ({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected?: string[];
  onToggle: (val: string) => void;
}) => (
  <div className="mb-4">
    <div className="font-semibold mb-1">{label}</div>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          className={`px-2 py-1 rounded-full border text-sm ${
            selected?.includes(opt)
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800'
          }`}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default function FilterChips({ value, onChange }: Props) {
  return (
    <div className="p-4 overflow-y-auto">
      <ChipGroup
        label="Sectors"
        options={SECTORS}
        selected={value.sectors}
        onToggle={(val) => onChange({ ...value, sectors: toggle(value.sectors, val) })}
      />
      <ChipGroup
        label="Functions"
        options={FUNCTIONS}
        selected={value.functions}
        onToggle={(val) =>
          onChange({ ...value, functions: toggle(value.functions, val) })
        }
      />
      <ChipGroup
        label="Agencies"
        options={AGENCIES}
        selected={value.agencies}
        onToggle={(val) =>
          onChange({ ...value, agencies: toggle(value.agencies, val) })
        }
      />
      <ChipGroup
        label="States"
        options={STATES}
        selected={value.states}
        onToggle={(val) =>
          onChange({ ...value, states: toggle(value.states, val) })
        }
      />
    </div>
  );
}
