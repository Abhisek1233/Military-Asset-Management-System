import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { TableSkeleton, Spinner } from '../components/Skeleton';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AuditLogs = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch central audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Central System Audit Trail</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Immutable mutation log intercepting purchases, transfers, assignments & expenditures
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="btn-primary !py-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-tight">Security Mutation Logs</h2>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Log Entries: {logs.length}
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <div className="table-responsive">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase font-bold tracking-wider ${
                isDark ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'
              }`}>
                <tr>
                  <th className="p-4">Log ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Base Scope</th>
                  <th className="p-4 text-center">Action</th>
                  <th className="p-4">Log Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No audit logs recorded yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 font-mono font-bold text-blue-400">#{log.id}</td>
                      <td className="p-4 font-bold">{log.username || `User #${log.user_id}`}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {log.role || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="p-4">{log.base_name || 'Global'}</td>
                      <td className="p-4 text-center">
                        <StatusBadge status={log.action} />
                      </td>
                      <td className="p-4 font-medium text-slate-200">{log.details}</td>
                      <td className="p-4 text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
