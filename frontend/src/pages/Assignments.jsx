import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TableSkeleton, Spinner } from '../components/Skeleton';
import { Flame, UserCheck } from 'lucide-react';

export const Assignments = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [asgnBase, setAsgnBase] = useState('');
  const [asgnEquipment, setAsgnEquipment] = useState('');
  const [asgnQuantity, setAsgnQuantity] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [asgnSubmitting, setAsgnSubmitting] = useState(false);

  const [expBase, setExpBase] = useState('');
  const [expEquipment, setExpEquipment] = useState('');
  const [expQuantity, setExpQuantity] = useState('');
  const [expReason, setExpReason] = useState('');
  const [expSubmitting, setExpSubmitting] = useState(false);

  const [asgnMsg, setAsgnMsg] = useState({ type: '', text: '' });
  const [expMsg, setExpMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [asgnRes, expRes, basesRes, eqRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/assignments/expenditures'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setAssignments(asgnRes.data);
      setExpenditures(expRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);

      const defaultBase = user?.baseId ? user.baseId.toString() : basesRes.data[0]?.id.toString();
      const defaultEq = eqRes.data[0]?.id.toString();

      setAsgnBase(defaultBase);
      setExpBase(defaultBase);
      setAsgnEquipment(defaultEq);
      setExpEquipment(defaultEq);
    } catch (error) {
      console.error('Failed to load assignments/expenditures data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setAsgnMsg({ type: '', text: '' });
    setAsgnSubmitting(true);
    try {
      await api.post('/assignments', {
        baseId: parseInt(asgnBase, 10),
        equipmentTypeId: parseInt(asgnEquipment, 10),
        quantity: parseInt(asgnQuantity, 10),
        assignedTo,
      });
      setAsgnMsg({ type: 'success', text: 'Personnel assignment logged successfully.' });
      setAsgnQuantity('');
      setAssignedTo('');
      fetchData();
    } catch (error) {
      setAsgnMsg({ type: 'error', text: error.response?.data?.message || 'Failed to log assignment.' });
    } finally {
      setAsgnSubmitting(false);
    }
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    setExpMsg({ type: '', text: '' });
    setExpSubmitting(true);
    try {
      await api.post('/assignments/expenditures', {
        baseId: parseInt(expBase, 10),
        equipmentTypeId: parseInt(expEquipment, 10),
        quantity: parseInt(expQuantity, 10),
        reason: expReason,
      });
      setExpMsg({ type: 'success', text: 'Expended inventory recorded successfully.' });
      setExpQuantity('');
      setExpReason('');
      fetchData();
    } catch (error) {
      setExpMsg({ type: 'error', text: error.response?.data?.message || 'Failed to log expenditure.' });
    } finally {
      setExpSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Personnel Assignments & Expended Assets</h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track equipment allocated to active personnel & record consumed inventory
        </p>
      </div>

      {/* SECTION 1: PERSONNEL ASSIGNMENTS */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold tracking-wider uppercase text-blue-500 flex items-center space-x-2">
          <UserCheck className="w-4 h-4" />
          <span>Active Personnel Assignments</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Assign Equipment To Personnel</h3>

            {asgnMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                asgnMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {asgnMsg.text}
              </div>
            )}

            <form onSubmit={handleAssignmentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Base</label>
                <select
                  disabled={user?.role === 'BASE_COMMANDER'}
                  value={asgnBase}
                  onChange={(e) => setAsgnBase(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Equipment</label>
                <select
                  value={asgnEquipment}
                  onChange={(e) => setAsgnEquipment(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {equipmentTypes.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={asgnQuantity}
                  onChange={(e) => setAsgnQuantity(e.target.value)}
                  placeholder="Quantity (e.g. 20)"
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Assignee / Battalion Unit</label>
                <input
                  type="text"
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Alpha Recon Battalion"
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={asgnSubmitting}
                className="btn-primary w-full"
              >
                {asgnSubmitting ? <Spinner /> : <span>Log Personnel Assignment</span>}
              </button>
            </form>
          </div>

          {/* Assignments Table */}
          <div className={`lg:col-span-2 rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-4 border-b border-slate-800 font-bold text-xs">Active Assignments Log</div>
            {loading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : (
              <div className="table-responsive max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold tracking-wider ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Base</th>
                      <th className="p-3">Equipment</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3">Assigned To</th>
                      <th className="p-3">Assigned By</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {assignments.map(a => (
                      <tr key={a.id}>
                        <td className="p-3 font-semibold">{a.base_name}</td>
                        <td className="p-3 font-bold">{a.equipment_name}</td>
                        <td className="p-3 text-right font-bold text-amber-400">{a.quantity}</td>
                        <td className="p-3 font-semibold text-blue-400">{a.assigned_to}</td>
                        <td className="p-3">{a.assigned_by_user || 'System'}</td>
                        <td className="p-3 text-[10px] text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: EXPENDED STOCK */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-sm font-bold tracking-wider uppercase text-rose-500 flex items-center space-x-2">
          <Flame className="w-4 h-4" />
          <span>Consumed / Expended Inventory</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenditure Form */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Record Expended Asset</h3>

            {expMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                expMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {expMsg.text}
              </div>
            )}

            <form onSubmit={handleExpenditureSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Base</label>
                <select
                  disabled={user?.role === 'BASE_COMMANDER'}
                  value={expBase}
                  onChange={(e) => setExpBase(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Equipment Type</label>
                <select
                  value={expEquipment}
                  onChange={(e) => setExpEquipment(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {equipmentTypes.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Quantity Expended</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expQuantity}
                  onChange={(e) => setExpQuantity(e.target.value)}
                  placeholder="Quantity (e.g. 50)"
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Expenditure Reason / Operation</label>
                <input
                  type="text"
                  required
                  value={expReason}
                  onChange={(e) => setExpReason(e.target.value)}
                  placeholder="e.g. Live Firing Exercise Practice"
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={expSubmitting}
                className="btn-danger w-full"
              >
                {expSubmitting ? <Spinner /> : <span>Record Expended Inventory</span>}
              </button>
            </form>
          </div>

          {/* Expenditures Table */}
          <div className={`lg:col-span-2 rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-4 border-b border-slate-800 font-bold text-xs">Expended Assets Log History</div>
            {loading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : (
              <div className="table-responsive max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold tracking-wider ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                    <tr>
                      <th className="p-3">Base</th>
                      <th className="p-3">Equipment</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3">Reason / Operation</th>
                      <th className="p-3">Logged By</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {expenditures.map(e => (
                      <tr key={e.id}>
                        <td className="p-3 font-semibold">{e.base_name}</td>
                        <td className="p-3 font-bold">{e.equipment_name}</td>
                        <td className="p-3 text-right font-bold text-rose-500">-{e.quantity}</td>
                        <td className="p-3 text-slate-300">{e.reason}</td>
                        <td className="p-3">{e.logged_by_user || 'System'}</td>
                        <td className="p-3 text-[10px] text-slate-400">{new Date(e.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
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

export default Assignments;
