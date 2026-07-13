import React from 'react';

type StatusType = 'Published' | 'Draft' | 'Pending' | 'Approved' | 'Rejected';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<StatusType, { bg: string; text: string; border: string }> = {
    Published: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
    },
    Draft: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      border: 'border-gray-500/30',
    },
    Pending: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
    },
    Approved: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
    },
    Rejected: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const config = statusConfig[status];

  const defaultConfig = {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
  };

  const activeConfig = config || defaultConfig;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${activeConfig.bg} ${activeConfig.text} ${activeConfig.border} ${sizeClasses[size]}`}
      style={{ fontFamily: 'Poppins' }}
    >
      {status}
    </span>
  );
}
