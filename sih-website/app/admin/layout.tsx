'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import TopBar from '../../components/admin/TopBar';
import RequireAdmin from '../../components/RequireAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RequireAdmin>
      <div className="min-h-screen" style={{ backgroundColor: '#1a0f0a' }}>
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />

          <main
            className="p-6 lg:p-8"
            style={{
              background: 'linear-gradient(to bottom right, #2d1810, #3d1f10, #2d1810)',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </RequireAdmin>
  );
}
