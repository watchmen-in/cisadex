import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import summary from '@/data/summary.json';

export default function EntityPage() {
  const { id } = useParams();
  const [entity, setEntity] = useState<any | null>(null);
  const data = summary as any[];

  useEffect(() => {
    setEntity(data.find((e: any) => e.id === id));
  }, [id]);

  if (!entity) return <div className="p-4">Entity not found.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{entity.office_name}</h1>
      <div>
        <span className="font-medium">Agency:</span> {entity.agency}
      </div>
      <div>
        <span className="font-medium">Location:</span> {entity.city}, {entity.state} ({entity.lat}, {entity.lng})
      </div>
      <div>
        <span className="font-medium">Sectors:</span> {entity.sectors.join(', ')}
      </div>
      <div>
        <span className="font-medium">Functions:</span> {entity.functions.join(', ')}
      </div>
      <div>
        <a
          className="text-blue-600 underline"
          href={entity.contact_public.website}
          target="_blank"
        >
          Website
        </a>
      </div>
      <div className="text-sm text-gray-600">
        Last verified {entity.last_verified}
      </div>
    </div>
  );
}
