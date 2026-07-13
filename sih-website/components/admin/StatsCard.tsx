import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function StatsCard({ title, value, icon, change, changeType = 'neutral' }: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-amber-300',
  };

  return (
    <div
      className="rounded-2xl p-6 backdrop-blur-sm"
      style={{
        background: 'rgba(217, 119, 6, 0.1)',
        border: '1px solid rgba(217, 119, 6, 0.2)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
            {title}
          </p>
          <p className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins' }}>
            {value}
          </p>
          {change && (
            <p className={`text-sm font-medium ${changeColors[changeType]}`} style={{ fontFamily: 'Poppins' }}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
