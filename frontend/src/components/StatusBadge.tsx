import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = status;

  switch (norm) {
    case 'active':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      label = 'Active';
      break;
    case 'sold_out':
      styles = 'bg-slate-100 text-slate-700 border-slate-300';
      label = 'Sold Out';
      break;
    case 'pending':
      styles = 'bg-amber-50 text-amber-800 border-amber-300';
      label = 'Pending Review';
      break;
    case 'accepted':
      styles = 'bg-forest-100 text-forest-800 border-forest-300 font-semibold';
      label = 'Accepted';
      break;
    case 'rejected':
      styles = 'bg-rose-50 text-rose-700 border-rose-300';
      label = 'Declined';
      break;
    case 'confirmed':
      styles = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
      label = 'Confirmed';
      break;
    case 'in_transit':
      styles = 'bg-purple-50 text-purple-800 border-purple-300';
      label = 'In Transit';
      break;
    case 'delivered':
    case 'completed':
      styles = 'bg-forest-50 text-forest-800 border-forest-400 font-semibold';
      label = 'Delivered & Completed';
      break;
    case 'open':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      label = 'Open for Pooling';
      break;
    default:
      styles = 'bg-gray-50 text-gray-700 border-gray-200';
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      {label}
    </span>
  );
};
