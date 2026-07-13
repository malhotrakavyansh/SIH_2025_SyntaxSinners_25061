'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '../../../components/admin/StatusBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Monastery = {
  id: string;
  name: string;
  slug: string;
  location: string;
  heroImageUrl: string;
  isPublished: boolean;
  updatedAt: string;
};

export default function MonasteriesPage() {
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonasteries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/monasteries`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch monasteries');
      const data = await res.json();
      setMonasteries(data.monasteries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monasteries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonasteries();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_URL}/api/admin/monasteries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setMonasteries((prev) => prev.filter((m) => m.id !== id));
  };

  const filtered = monasteries.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const statusLabel = m.isPublished ? 'Published' : 'Draft';
    const matchesStatus = statusFilter === 'All' || statusFilter === statusLabel;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-50 mb-2" style={{ fontFamily: 'Poppins' }}>
            Monasteries
          </h1>
          <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
            Manage all monastery listings
          </p>
        </div>
        <Link
          href="/admin/monasteries/new"
          className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-amber-50 font-semibold transition shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          style={{ fontFamily: 'Poppins' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Monastery
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl p-4 bg-red-950/60 border border-red-900/50 text-red-200">Error: {error}</div>
      )}

      <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-amber-950/60 border border-amber-500/30 text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-500/50 transition"
                style={{ fontFamily: 'Poppins' }}
              />
              <svg className="w-5 h-5 text-amber-300/50 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            {(['All', 'Published', 'Draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  statusFilter === s ? 'bg-amber-500 text-amber-900' : 'bg-amber-900/30 text-amber-100 hover:bg-amber-900/50'
                }`}
                style={{ fontFamily: 'Poppins' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-amber-200" style={{ fontFamily: 'Poppins' }}>
          {loading ? 'Loading monasteries...' : `Showing ${filtered.length} of ${monasteries.length} monasteries`}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden backdrop-blur-sm" style={{ background: 'rgba(41, 24, 10, 0.8)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
        <div className="overflow-x-auto">
          {filtered.length === 0 && !loading ? (
            <div className="p-6 text-center text-amber-300" style={{ fontFamily: 'Poppins' }}>No monasteries found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-800/30">
                  <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Poppins' }}>Name</th>
                  <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Poppins' }}>Location</th>
                  <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Poppins' }}>Status</th>
                  <th className="text-left px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Poppins' }}>Last Updated</th>
                  <th className="text-right px-6 py-4 text-white font-semibold" style={{ fontFamily: 'Poppins' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-amber-800/20 hover:bg-amber-900/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-cover bg-center bg-amber-950" style={{ backgroundImage: `url(${m.heroImageUrl})` }} />
                        <div>
                          <p className="text-white font-medium" style={{ fontFamily: 'Poppins' }}>{m.name}</p>
                          <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins' }}>{m.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white" style={{ fontFamily: 'Poppins' }}>{m.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={m.isPublished ? 'Published' : 'Draft'} />
                    </td>
                    <td className="px-6 py-4 text-amber-200" style={{ fontFamily: 'Poppins' }}>
                      {new Date(m.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {m.isPublished && (
                          <Link
                            href={`/all-monasteries/${m.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 transition"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                        <Link
                          href={`/admin/monasteries/${m.id}`}
                          className="p-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 transition"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
