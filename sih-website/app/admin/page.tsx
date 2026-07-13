'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCard from '../../components/admin/StatsCard';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../components/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface StatsData {
  totalMonasteries: number;
  pendingSubmissions: number;
  publishedMonasteries: number;
  contributors: number;
  totalSubmissions: number;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: 'submission' | 'monastery';
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetch(`${API_URL}/api/admin/dashboard/stats`, { credentials: 'include' });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }

        const activityRes = await fetch(`${API_URL}/api/admin/dashboard/activity`, { credentials: 'include' });
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivity(activityData.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins' }}>
          Welcome back{user ? `, ${user.name}` : ''}
        </h1>
        <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
          Here's your Sangha admin overview.
        </p>
      </div>

      <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/monasteries/new"
            className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-900 font-semibold text-center transition shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Poppins' }}
          >
            + Add New Monastery
          </Link>
          <Link
            href="/admin/submissions"
            className="block w-full px-4 py-3 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 font-semibold text-center transition border border-amber-500/30"
            style={{ fontFamily: 'Poppins' }}
          >
            Review Pending Submissions
          </Link>
          <Link
            href="/admin/monasteries"
            className="block w-full px-4 py-3 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 font-semibold text-center transition border border-amber-500/30"
            style={{ fontFamily: 'Poppins' }}
          >
            View All Monasteries
          </Link>
          <Link
            href="/admin/contributors"
            className="block w-full px-4 py-3 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 font-semibold text-center transition border border-amber-500/30"
            style={{ fontFamily: 'Poppins' }}
          >
            Manage Contributors
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <StatsCard
            title="Total Monasteries"
            value={stats?.totalMonasteries ?? 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatsCard
            title="Pending Submissions"
            value={stats?.pendingSubmissions ?? 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            change="Needs review"
            changeType="neutral"
          />
          <StatsCard
            title="Published Monasteries"
            value={stats?.publishedMonasteries ?? 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            change={stats && stats.totalMonasteries > 0 ? `${Math.round((stats.publishedMonasteries / stats.totalMonasteries) * 100)}% published` : '0% published'}
            changeType="positive"
          />
          <StatsCard
            title="Contributors"
            value={stats?.contributors ?? 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Recent Activity</h2>
              {loading && <span className="text-sm text-amber-300">Loading...</span>}
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-amber-900/20 hover:bg-amber-900/30 transition">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      {(activity.action === 'approved' || activity.action === 'published') && (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {activity.action === 'submitted' && (
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                      {activity.action === 'updated' && (
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium" style={{ fontFamily: 'Poppins' }}>
                        <span className="text-amber-200">{activity.user}</span> {activity.action} <span className="text-amber-200">{activity.target}</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: 'Poppins' }}>
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-amber-300/60 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins' }}>Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-200">Total Submissions</span>
              <span className="text-white font-semibold">{stats?.totalSubmissions ?? 0}</span>
            </div>
            <div className="w-full h-1 bg-amber-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                style={{ width: `${stats && stats.totalSubmissions > 0 ? (stats.pendingSubmissions / stats.totalSubmissions) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Approved: {stats?.totalSubmissions ? stats.totalSubmissions - stats.pendingSubmissions : 0}</span>
              <span className="text-amber-400">Pending: {stats?.pendingSubmissions ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins' }}>Quick Navigation</h2>
          <div className="space-y-2">
            <Link href="/admin/submissions" className="block text-amber-300 hover:text-amber-200 transition">→ View All Submissions</Link>
            <Link href="/admin/monasteries" className="block text-amber-300 hover:text-amber-200 transition">→ Manage Monasteries</Link>
            <Link href="/admin/contributors" className="block text-amber-300 hover:text-amber-200 transition">→ View Contributors</Link>
            <Link href="/admin/settings" className="block text-amber-300 hover:text-amber-200 transition">→ Admin Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
