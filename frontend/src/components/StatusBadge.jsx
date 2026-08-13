import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const StatusBadge = ({ status, text }) => {
  const { isDark } = useTheme();
  const normalized = (status || text || '').toString().toUpperCase();

  let badgeStyle = '';

  if (['COMPLETED', 'POSITIVE', 'SUCCESS', 'PURCHASE', 'TRANSFERS IN'].includes(normalized)) {
    badgeStyle = isDark
      ? 'bg-[#04342C] text-status-success-darkText border border-[#1D9E75]/30'
      : 'bg-[#D1F4E8] text-status-success-lightText border border-[#1D9E75]/40';
  } else if (['EXPENDED', 'DANGER', 'TRANSFERS OUT', 'CANCELLED', 'REJECTED'].includes(normalized)) {
    badgeStyle = isDark
      ? 'bg-[#501313] text-status-danger-darkText border border-[#E24B4A]/30'
      : 'bg-[#FCE4E4] text-status-danger-lightText border border-[#E24B4A]/40';
  } else if (['PENDING', 'IN-TRANSIT', 'IN_TRANSIT', 'WARNING', 'ASSIGNMENT'].includes(normalized)) {
    badgeStyle = isDark
      ? 'bg-[#412402] text-status-warning-darkText border border-[#EF9F27]/30'
      : 'bg-[#FEF3C7] text-status-warning-lightText border border-[#EF9F27]/40';
  } else {
    // Default neutral slate badge
    badgeStyle = isDark
      ? 'bg-slate-800 text-slate-300 border border-slate-700'
      : 'bg-slate-100 text-slate-700 border border-slate-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {text || status}
    </span>
  );
};

export default StatusBadge;
