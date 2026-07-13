'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthProvider';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'AU';

  return (
    <header className="h-16 bg-gradient-to-r from-amber-950 to-orange-950 border-b border-amber-800/30 flex items-center justify-between px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-amber-100 hover:bg-amber-900/30 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-amber-100" style={{ fontFamily: 'Poppins' }}>
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-amber-100" style={{ fontFamily: 'Poppins' }}>
              {user?.name ?? 'Admin'}
            </p>
            <p className="text-xs text-amber-300/70" style={{ fontFamily: 'Poppins' }}>
              {user?.email ?? ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-900 font-bold">
            {initials}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 font-medium transition flex items-center gap-2"
          style={{ fontFamily: 'Poppins' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
