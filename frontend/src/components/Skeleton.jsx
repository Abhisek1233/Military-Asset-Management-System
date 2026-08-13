import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const StatCardSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`p-5 rounded-xl border border-l-[3px] border-l-slate-600 shadow-xs animate-pulse ${
        isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`h-3 w-24 rounded skeleton-shimmer ${isDark ? 'bg-slate-700/60' : 'bg-slate-200'}`} />
        <div className={`h-7 w-7 rounded-lg skeleton-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
      </div>

      <div className="mt-4">
        <div className={`h-8 w-28 rounded-md skeleton-shimmer ${isDark ? 'bg-slate-700/80' : 'bg-slate-300'}`} />
      </div>

      <div className={`mt-2.5 h-3 w-36 rounded skeleton-shimmer ${isDark ? 'bg-slate-700/40' : 'bg-slate-200'}`} />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center space-x-4 py-2 border-b border-slate-800/40 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 rounded skeleton-shimmer flex-1 ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <div className={`p-6 rounded-xl border animate-pulse space-y-4 ${
      isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`h-4 w-48 rounded skeleton-shimmer ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
          <div className={`h-3 w-64 rounded skeleton-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
        <div className={`h-8 w-8 rounded-lg skeleton-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>

      <div className="h-64 w-full flex items-end justify-between gap-4 pt-6">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex-1 flex items-end space-x-1 h-full">
            <div
              className={`w-full rounded-t skeleton-shimmer ${isDark ? 'bg-slate-700/60' : 'bg-slate-300'}`}
              style={{ height: `${Math.floor(Math.random() * 60) + 30}%` }}
            />
            <div
              className={`w-full rounded-t skeleton-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
              style={{ height: `${Math.floor(Math.random() * 40) + 20}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const Spinner = ({ size = 'w-4 h-4', className = 'text-white' }) => (
  <svg className={`animate-spin ${size} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default {
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  Spinner,
};
