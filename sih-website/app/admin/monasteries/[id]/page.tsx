'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MonasteryForm, { MonasteryFormData } from '../../../../components/admin/MonasteryForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EditMonasteryPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<MonasteryFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/monasteries/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Monastery not found');
        return res.json();
      })
      .then((json) => {
        const m = json.monastery;
        setData({
          name: m.name,
          slug: m.slug,
          location: m.location,
          altitude: m.altitude,
          founded: m.founded,
          shortDescription: m.shortDescription,
          heroImageUrl: m.heroImageUrl,
          gallery: m.gallery.length > 0 ? m.gallery : [''],
          sections: {
            overview: m.sections.overview ?? '',
            history: m.sections.history ?? '',
            architecture: m.sections.architecture ?? '',
            rituals: m.sections.rituals ?? '',
            bestVisitTime: m.sections.bestVisitTime ?? '',
            travelInfo: m.sections.travelInfo ?? '',
          },
          historicalPeriod: m.historicalPeriod,
          sourceReferences: m.sourceReferences,
          isPublished: m.isPublished,
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <div className="text-red-200 p-6">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-amber-100 p-6">Loading…</div>;
  }

  return <MonasteryForm monasteryId={id} initialData={data} />;
}
