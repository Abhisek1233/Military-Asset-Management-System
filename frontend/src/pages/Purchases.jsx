import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { TableSkeleton, Spinner } from '../components/Skeleton';
import { ShoppingCart, Plus, Building2, Package, History } from 'lucide-react';

export const Purchases = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Form State
  const [targetBase, setTargetBase] = useState('');
  const [targetEquipment, setTargetEquipment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setTableLoading(true);
    try {
      const [purchasesRes, basesRes, eqRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setPurchases(purchasesRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);

      if (user?.baseId) {
        setTargetBase(user.baseId.toString());
      } else if (basesRes.data.length > 0) {
        setTargetBase(basesRes.data[0].id.toString());
      }

      if (eqRes.data.length > 0) {
        setTargetEquipment(eqRes.data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load purchase management data:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await api.post('/purchases', {
        baseId: parseInt(targetBase, 10),
        equipmentTypeId: parseInt(targetEquipment, 10),
        quantity: parseInt(quantity, 10),
      });

      setMessage({ type: 'success', text: `Purchase recorded successfully. Stock updated.` });
      setQuantity('');
      fetchInitialData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to log purchase transaction.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Purchase Procurement & Stock Logging</h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Log newly acquired military equipment & automatically log to central audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className={`p-6 rounded-xl border space-y-5 ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Record Equipment Purchase</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Add new stock directly to base
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

          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            {/* Target Base */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Target Military Base
              </label>
              <div className="relative">
                <Building2 className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  disabled={user?.role === 'BASE_COMMANDER'}
                  value={targetBase}
                  onChange={(e) => setTargetBase(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border outline-none transition-all ${
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
            </div>

            {/* Equipment Type */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Equipment Item Type
              </label>
              <div className="relative">
                <Package className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  value={targetEquipment}
                  onChange={(e) => setTargetEquipment(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border outline-none transition-all ${
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
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Quantity Acquired
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter integer quantity (e.g. 50)"
                className={`w-full px-4 py-2.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Logging Purchase...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Submit Purchase Record</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Historical Logs Table */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col justify-between ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold tracking-tight">Purchase Procurement Logs History</h2>
              </div>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Records: {purchases.length}
              </span>
            </div>

            {tableLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <div className="table-responsive max-h-[420px]">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold tracking-wider sticky top-0 ${
                    isDark ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'
                  }`}>
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Base</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4 text-right">Quantity</th>
                      <th className="p-4">Logged By</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500">No purchases recorded yet.</td>
                      </tr>
                    ) : (
                      purchases.map((p) => (
                        <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                          <td className="p-4 font-mono font-bold text-blue-400">#{p.id}</td>
                          <td className="p-4 font-semibold">{p.base_name}</td>
                          <td className="p-4">
                            <div className="font-bold">{p.equipment_name}</div>
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                          </td>
                          <td className="p-4 text-right font-extrabold text-blue-400">+{p.quantity}</td>
                          <td className="p-4">{p.purchased_by_user || 'System'}</td>
                          <td className="p-4 text-[11px] text-slate-400">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <StatusBadge status="COMPLETED" text="LOGGED" />
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

export default Purchases;
