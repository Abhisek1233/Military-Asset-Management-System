import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { TableSkeleton, Spinner } from '../components/Skeleton';
import { ArrowLeftRight, History } from 'lucide-react';

export const Transfers = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Form State
  const [sourceBase, setSourceBase] = useState('');
  const [destinationBase, setDestinationBase] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setTableLoading(true);
    try {
      const [transfersRes, basesRes, eqRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setTransfers(transfersRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);

      if (user?.baseId) {
        setSourceBase(user.baseId.toString());
        const otherBase = basesRes.data.find(b => b.id !== user.baseId);
        if (otherBase) setDestinationBase(otherBase.id.toString());
      } else if (basesRes.data.length >= 2) {
        setSourceBase(basesRes.data[0].id.toString());
        setDestinationBase(basesRes.data[1].id.toString());
      }

      if (eqRes.data.length > 0) {
        setEquipmentType(eqRes.data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load transfer management data:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (sourceBase === destinationBase) {
      setMessage({ type: 'error', text: 'Source base and destination base cannot be identical.' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/transfers', {
        sourceBaseId: parseInt(sourceBase, 10),
        destinationBaseId: parseInt(destinationBase, 10),
        equipmentTypeId: parseInt(equipmentType, 10),
        quantity: parseInt(quantity, 10),
        status,
      });

      setMessage({ 
        type: 'success', 
        text: `Atomic Cross-Base Transfer executed safely via PostgreSQL BEGIN...COMMIT block.` 
      });
      setQuantity('');
      fetchInitialData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.response?.data?.error || 'Failed to execute transfer transaction.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Cross-Base Asset Transfers (Atomic Operations)</h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Safely move equipment between military bases using ACID-compliant PostgreSQL transaction blocks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form Card */}
        <div className={`p-6 rounded-xl border space-y-5 ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Initiate Base Transfer</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Atomic stock movement
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            {/* Source Base */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Source Base (Origin)
              </label>
              <select
                disabled={user?.role === 'BASE_COMMANDER'}
                value={sourceBase}
                onChange={(e) => setSourceBase(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                ))}
              </select>
            </div>

            {/* Destination Base */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Destination Base (Target)
              </label>
              <select
                value={destinationBase}
                onChange={(e) => setDestinationBase(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.location})</option>
                ))}
              </select>
            </div>

            {/* Equipment Type */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Equipment Item
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                {equipmentTypes.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} [{eq.category}]</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Transfer Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter transfer quantity (e.g. 15)"
                className={`w-full px-4 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Status */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Transfer Dispatch Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                <option value="COMPLETED">COMPLETED (Immediate Settlement)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (In-Flight Movement)</option>
                <option value="PENDING">PENDING (Awaiting Approval)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Executing Transaction...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Execute Atomic Transfer</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transfer History Table */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col justify-between ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold tracking-tight">Cross-Base Transfer History & Audit Trail</h2>
              </div>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Movements: {transfers.length}
              </span>
            </div>

            {tableLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <div className="table-responsive max-h-[460px]">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold tracking-wider sticky top-0 ${
                    isDark ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'
                  }`}>
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Origin Base</th>
                      <th className="p-4">Target Base</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4 text-right">Qty</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Initiated By</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {transfers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-500">No transfers recorded yet.</td>
                      </tr>
                    ) : (
                      transfers.map((t) => (
                        <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                          <td className="p-4 font-mono font-bold text-blue-400">#{t.id}</td>
                          <td className="p-4 font-semibold text-rose-400">{t.source_base_name}</td>
                          <td className="p-4 font-semibold text-emerald-400">{t.destination_base_name}</td>
                          <td className="p-4">
                            <div className="font-bold">{t.equipment_name}</div>
                            <span className="text-[10px] text-slate-400">{t.category}</span>
                          </td>
                          <td className="p-4 text-right font-extrabold text-blue-400">{t.quantity}</td>
                          <td className="p-4 text-center">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="p-4">{t.initiated_by_user || 'System'}</td>
                          <td className="p-4 text-[11px] text-slate-400">
                            {new Date(t.timestamp).toLocaleString()}
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
      </div>
    </div>
  );
};

export default Transfers;
