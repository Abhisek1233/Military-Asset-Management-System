import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { Sun, Moon, LogOut, User, Menu } from 'lucide-react';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors shadow-xs ${
      isDark
        ? 'bg-[#0F172A] border-slate-800/80 text-slate-100'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Hamburger & Branding */}
        <div className="flex items-center space-x-3">
          {/* Mobile Drawer Button */}
          <button
            onClick={onOpenMobileMenu}
            className={`p-2 rounded-lg md:hidden transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <div>
              <span className="font-extrabold tracking-wider text-xs sm:text-sm uppercase block leading-none">
                MILITARY ASSET COMMAND
              </span>
              <span className={`text-[10px] font-semibold tracking-widest uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                POSTGRESQL ACID AUDIT SYSTEM
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Theme Toggle, User Clearance & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Badge Info */}
          {user && (
            <div className={`hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-xs ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
            }`}>
              <div className="p-1 rounded bg-blue-600/20 text-blue-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold leading-tight">{user.username}</span>
                <span className="text-[10px] font-semibold text-blue-500 uppercase">
                  {user.role} {user.baseName ? `(${user.baseName})` : ''}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          {user && (
            <button
              onClick={logout}
              className="btn-secondary !px-3 !py-1.5 text-xs text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
