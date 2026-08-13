import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spinner } from '../components/Skeleton';
import Logo from '../components/Logo';
import { Shield, Lock, User, ArrowRight, Sun, Moon, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid military credentials provided.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetUsername, presetPassword) => {
    setUsername(presetUsername);
    setPassword(presetPassword);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Absolute Theme Switcher */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-lg border transition-all ${
            isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex mb-2">
            <Logo size="xl" className="shadow-2xl ring-4 ring-blue-500/20" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Military Asset Command</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign in to access base inventory & cross-base movement audit
          </p>
        </div>

        {/* Login Card */}
        <div className={`p-8 rounded-xl shadow-xl border ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Username
              </label>
              <div className="relative">
                <User className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter military username"
                  className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3 top-2.5 p-0.5 rounded transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className={`mt-6 pt-5 border-t space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className={`block text-[10px] font-bold uppercase tracking-widest text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Fast Demo Test Credentials (Click To Fill)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreset('admin_user', 'AdminPass123!')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                  isDark ? 'bg-slate-800/80 border-slate-700 hover:border-purple-500 text-purple-300' : 'bg-slate-100 border-slate-300 hover:border-purple-500 text-purple-800'
                }`}
              >
                <div>Admin</div>
                <div className="text-[9px] opacity-75 font-normal">All Bases</div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('commander_alpha', 'CommandPass123!')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                  isDark ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500 text-blue-300' : 'bg-slate-100 border-slate-300 hover:border-blue-500 text-blue-800'
                }`}
              >
                <div>Commander</div>
                <div className="text-[9px] opacity-75 font-normal">Fort Alpha</div>
              </button>

              <button
                type="button"
                onClick={() => setPreset('logistics_officer', 'LogisticsPass123!')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                  isDark ? 'bg-slate-800/80 border-slate-700 hover:border-emerald-500 text-emerald-300' : 'bg-slate-100 border-slate-300 hover:border-emerald-500 text-emerald-800'
                }`}
              >
                <div>Logistics</div>
                <div className="text-[9px] opacity-75 font-normal">Global Ops</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
