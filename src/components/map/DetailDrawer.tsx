import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  entity: any | null;
  onClose: () => void;
}

export default function DetailDrawer({ entity, onClose }: Props) {
  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 z-40 ${
        entity ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {entity && (
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">{entity.office_name}</h2>
          <div className="text-sm text-gray-600">
            {entity.agency} – {entity.city}, {entity.state}
          </div>
          <div className="text-sm">Last verified {entity.last_verified}</div>
          <div>
            <a
              className="text-blue-600 underline"
              href={entity.contact_public?.website}
              target="_blank"
            >
              Website
            </a>
          </div>
          <Link
            to={`/entity/${entity.id}`}
            className="text-blue-600 underline text-sm"
          >
            Open full page
          </Link>
        </div>
      )}
    </div>
  );
}
