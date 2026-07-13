'use client';

import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Contributor = {
  id: string;
  name: string;
  email: string;
  submissions: number;
  approved: number;
  pendingReview: number;
  lastSubmission: string;
};

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/dashboard/contributors`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setContributors(json.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSubmissions = contributors.reduce((sum, c) => sum + c.submissions, 0);
  const totalApproved = contributors.reduce((sum, c) => sum + c.approved, 0);
  const approvalRate = totalSubmissions > 0 ? Math.round((totalApproved / totalSubmissions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-50 mb-2" style={{ fontFamily: 'Poppins' }}>
          Contributors
        </h1>
        <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
          Manage contributors and track their submissions
        </p>
      </div>

      <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
            style={{ fontFamily: 'Poppins' }}
          />
          <svg className="w-5 h-5 text-amber-300/50 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-amber-300">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-amber-300">No contributors found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-800/50 bg-amber-900/60">
                  <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Name</th>
                  <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Email</th>
                  <th className="text-center px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Total Submissions</th>
                  <th className="text-center px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Approved</th>
                  <th className="text-left px-6 py-4 text-amber-50 font-semibold" style={{ fontFamily: 'Poppins' }}>Last Submission</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-amber-800/30 hover:bg-amber-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-900 font-bold text-sm">
                          {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <p className="text-amber-50 font-medium" style={{ fontFamily: 'Poppins' }}>{c.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-amber-200" style={{ fontFamily: 'Poppins' }}>{c.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/60 text-amber-100 font-semibold">
                        {c.submissions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-900/60 text-green-300 font-semibold">
                        {c.approved}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-amber-200" style={{ fontFamily: 'Poppins' }}>
                      {new Date(c.lastSubmission).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <p className="text-sm text-amber-200 mb-2" style={{ fontFamily: 'Poppins' }}>Total Contributors</p>
          <p className="text-4xl font-bold text-amber-50" style={{ fontFamily: 'Poppins' }}>{contributors.length}</p>
        </div>
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <p className="text-sm text-amber-200 mb-2" style={{ fontFamily: 'Poppins' }}>Total Submissions</p>
          <p className="text-4xl font-bold text-amber-50" style={{ fontFamily: 'Poppins' }}>{totalSubmissions}</p>
        </div>
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <p className="text-sm text-amber-200 mb-2" style={{ fontFamily: 'Poppins' }}>Approval Rate</p>
          <p className="text-4xl font-bold text-green-300" style={{ fontFamily: 'Poppins' }}>{approvalRate}%</p>
        </div>
      </div>
    </div>
  );
}
