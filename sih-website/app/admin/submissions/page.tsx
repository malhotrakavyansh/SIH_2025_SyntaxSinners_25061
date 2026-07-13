'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '../../../components/admin/StatusBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Submission = {
  id: string;
  contributorName: string;
  title: string;
  monastery: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const getStatusCapitalized = (status: string): 'Pending' | 'Approved' | 'Rejected' =>
  (status.charAt(0).toUpperCase() + status.slice(1)) as 'Pending' | 'Approved' | 'Rejected';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/submissions`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(
    (s) => statusFilter === 'All' || getStatusCapitalized(s.status) === statusFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-50 mb-2" style={{ fontFamily: 'Poppins' }}>
          Submissions
        </h1>
        <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
          Review and manage artifact submissions from contributors
        </p>
      </div>

      {error && (
        <div className="rounded-2xl p-4 bg-red-950/60 border border-red-900/50 text-red-200" style={{ fontFamily: 'Poppins' }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
            <p className="text-amber-100" style={{ fontFamily: 'Poppins' }}>Loading submissions...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <div className="flex flex-wrap gap-2">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === status
                    ? 'bg-amber-600 text-amber-50'
                    : 'bg-amber-800/50 text-amber-200 hover:bg-amber-800/70'
                }`}
                style={{ fontFamily: 'Poppins' }}
              >
                {status} ({submissions.filter((s) => status === 'All' || getStatusCapitalized(s.status) === status).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div className="rounded-2xl overflow-hidden backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <div className="overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-amber-300" style={{ fontFamily: 'Poppins' }}>
                  No submissions found
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-800/50 bg-amber-900/60">
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Title</th>
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Monastery</th>
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Contributor</th>
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Type</th>
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Status</th>
                    <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Submitted On</th>
                    <th className="text-right px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-amber-800/30 hover:bg-amber-800/30 transition">
                      <td className="px-6 py-4">
                        <p className="text-amber-50 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-amber-50 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.monastery}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-amber-50 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.contributorName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-800/60 text-amber-100">
                          {submission.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={getStatusCapitalized(submission.status)} />
                      </td>
                      <td className="px-6 py-4 text-amber-200" style={{ fontFamily: 'Poppins' }}>
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/submissions/${submission.id}`}
                            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-amber-50 font-medium transition"
                            style={{ fontFamily: 'Poppins' }}
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
