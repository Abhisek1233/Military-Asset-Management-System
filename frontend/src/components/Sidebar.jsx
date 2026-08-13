import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowLeftRight, 
  UserCheck, 
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Purchases', path: '/purchases', icon: ShoppingCart },
    { label: 'Base Transfers', path: '/transfers', icon: ArrowLeftRight },
    { label: 'Assignments', path: '/assignments', icon: UserCheck },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Top Header branding (Visible inside mobile drawer) */}
      <div className={`p-4 border-b md:hidden flex items-center justify-between ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <Logo size="sm" />
          <span className="font-extrabold text-xs tracking-wider uppercase">COMMAND CENTER</span>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/15 text-blue-400 font-extrabold'
                      : 'bg-blue-50 text-blue-700 font-extrabold shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Clean vertical blue pillar bar indicator for active link */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-blue-600" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span className="tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Base Scope Status Card */}
      {user && (
        <div className="p-3">
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
              <Building2 className="w-3.5 h-3.5" />
              <span>Assigned Clearance Scope</span>
            </div>
            <div className="font-extrabold truncate text-xs">
              {user.baseName ? user.baseName : 'Global Command (All Bases)'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Role: <span className="font-bold text-slate-200">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className={`hidden md:block w-64 border-r transition-colors flex-shrink-0 ${
        isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer Menu */}
          <div className={`relative w-72 max-w-full h-full shadow-2xl transition-transform ${
            isDark ? 'bg-[#0F172A]' : 'bg-white'
          }`}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
