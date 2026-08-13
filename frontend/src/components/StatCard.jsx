import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const StatCard = ({ title, value, subtext, type = 'neutral', onClick, icon: Icon }) => {
  const { isDark } = useTheme();

  // Left 3px border accent color
  let borderClass = 'border-l-[3px] border-blue-600';
  let valueColorClass = isDark ? 'text-slate-100' : 'text-slate-900';

  if (type === 'positive' || type === 'success') {
    borderClass = 'border-l-[3px] border-emerald-500';
    valueColorClass = isDark ? 'text-emerald-400' : 'text-emerald-700';
  } else if (type === 'negative' || type === 'danger') {
    borderClass = 'border-l-[3px] border-rose-500';
    valueColorClass = isDark ? 'text-rose-400' : 'text-rose-700';
  } else if (type === 'warning') {
    borderClass = 'border-l-[3px] border-amber-500';
    valueColorClass = isDark ? 'text-amber-400' : 'text-amber-700';
  }

  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-xl shadow-xs transition-all duration-200 ${
        isDark
          ? 'bg-[#1E293B] text-slate-100 hover:bg-[#273449]'
          : 'bg-white text-slate-900 border border-slate-200/80 hover:bg-slate-50'
      } ${borderClass} ${isClickable ? 'cursor-pointer transform hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-blue-600'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${valueColorClass}`}>
          {value !== undefined && value !== null ? value.toLocaleString() : '0'}
        </span>
      </div>

      {subtext && (
        <p className={`mt-1.5 text-[11px] font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
