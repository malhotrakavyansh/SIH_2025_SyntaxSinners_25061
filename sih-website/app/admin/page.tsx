'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCard from '../../components/admin/StatsCard';
import { useAuth } from '../../components/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Submission = { status: 'pending' | 'approved' | 'rejected' };

const clipboardIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const checkIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const xIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{ pending: number; approved: number; rejected: number } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/submissions`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => {
        const submissions: Submission[] = data.submissions ?? [];
        setCounts({
          pending: submissions.filter((s) => s.status === 'pending').length,
          approved: submissions.filter((s) => s.status === 'approved').length,
          rejected: submissions.filter((s) => s.status === 'rejected').length,
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins' }}>
          Welcome back{user ? `, ${user.name}` : ''}
        </h1>
        <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
          Here's what's waiting for review.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard title="Pending review" value={counts?.pending ?? '…'} icon={clipboardIcon} />
        <StatsCard title="Approved" value={counts?.approved ?? '…'} icon={checkIcon} changeType="positive" />
        <StatsCard title="Rejected" value={counts?.rejected ?? '…'} icon={xIcon} changeType="negative" />
      </div>

      <Link
        href="/admin/submissions"
        className="inline-block px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-amber-50 font-medium transition"
        style={{ fontFamily: 'Poppins' }}
      >
        Go to Submissions →
      </Link>
    </div>
  );
}
