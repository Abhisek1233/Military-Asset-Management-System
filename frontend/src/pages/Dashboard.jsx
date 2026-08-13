import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import MetricDetailModal from '../components/MetricDetailModals';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/Skeleton';
import { 
  Building2, 
  Package, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  Layers,
  ArrowRightLeft,
  UserCheck,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    closingBalance: 0,
  });
  const [breakdown, setBreakdown] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Filter States
  const [selectedBase, setSelectedBase] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for All Metric Cards
  const [activeModalType, setActiveModalType] = useState(null);

  useEffect(() => {
    fetchBasesAndEquipment();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [selectedBase, selectedEquipment, startDate, endDate]);

  const fetchBasesAndEquipment = async () => {
    try {
      const [basesRes, eqRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (error) {
      console.error('Failed to load bases/equipment filter options:', error);
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBase !== 'all') params.baseId = selectedBase;
      if (selectedEquipment !== 'all') params.equipmentTypeId = selectedEquipment;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/assets/dashboard', { params });
      setMetrics(res.data.metrics);
      setBreakdown(res.data.breakdown || []);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedBase('all');
    setSelectedEquipment('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header Bar & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Real-Time Asset Command Dashboard</h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            End-to-End Stock Calculation & Cross-Base Operational Integrity
          </p>
        </div>

        {/* Interactive Filter Bar */}
        <div className={`p-2.5 rounded-xl border flex flex-wrap items-center gap-2 text-xs ${
          isDark
            ? 'bg-[#1E293B] border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Base Selector (For Admin / Global Ops) */}
          {user?.role !== 'BASE_COMMANDER' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-xs text-inherit cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Military Bases</option>
                {bases.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Equipment Type Selector */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-xs text-inherit cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Equipment Types</option>
              {equipmentTypes.map(eq => (
                <option key={eq.id} value={eq.id} className="bg-slate-900 text-white">{eq.name} ({eq.category})</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] font-semibold text-inherit cursor-pointer"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] font-semibold text-inherit cursor-pointer"
            />
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            title="Reset Filters"
            className="btn-secondary !p-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Key Metric Cards — ALL 5 CARDS CLICKABLE! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Opening Balance"
              value={metrics.openingBalance}
              subtext="Baseline stock record (Click)"
              type="neutral"
              icon={Layers}
              onClick={() => setActiveModalType('opening')}
            />

            <StatCard
              title="Net Movement"
              value={metrics.netMovement}
              subtext="Purchases + In - Out (Click)"
              type={metrics.netMovement >= 0 ? 'positive' : 'negative'}
              icon={ArrowRightLeft}
              onClick={() => setActiveModalType('netMovement')}
            />

            <StatCard
              title="Assigned Personnel"
              value={metrics.assigned}
              subtext="Active duty deployments (Click)"
              type="warning"
              icon={UserCheck}
              onClick={() => setActiveModalType('assigned')}
            />

            <StatCard
              title="Expended Stock"
              value={metrics.expended}
              subtext="Consumed inventory (Click)"
              type="negative"
              icon={Flame}
              onClick={() => setActiveModalType('expended')}
            />

            <StatCard
              title="Closing Balance"
              value={metrics.closingBalance}
              subtext="Real-time available stock (Click)"
              type="positive"
              icon={CheckCircle2}
              onClick={() => setActiveModalType('closing')}
            />
          </>
        )}
      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        ) : (
          <div className={`lg:col-span-2 p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight">Stock Movement & Calculation Comparison</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visualizing Opening, Net Movements, Assigned & Closing per Equipment
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} opacity={0.5} />
                  <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={11} />
                  <YAxis stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="opening" name="Opening" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchased" name="Purchased" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfersIn" name="Transfers In" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfersOut" name="Transfers Out" fill="#E24B4A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="closing" name="Closing" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Audit Summary Card */}
        <div className={`p-6 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <h2 className="text-sm font-bold tracking-tight mb-1">Mathematical Formula Verification</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              Enforced by strict database query constraints
            </p>

            <div className={`p-4 rounded-xl space-y-3 font-mono text-xs border ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="text-[11px] font-bold text-blue-500">NET MOVEMENT:</div>
              <div>Net = {metrics.purchases} (P) + {metrics.transfersIn} (TI) - {metrics.transfersOut} (TO)</div>
              <div className="font-bold text-emerald-500">= {metrics.netMovement}</div>

              <div className="border-t border-slate-700/50 pt-2 text-[11px] font-bold text-blue-500">CLOSING BALANCE:</div>
              <div>Closing = {metrics.openingBalance} (Open) + {metrics.netMovement} (Net) - {metrics.assigned} (Asgn) - {metrics.expended} (Exp)</div>
              <div className="font-bold text-blue-400">= {metrics.closingBalance}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveModalType('closing')}
              className="btn-primary w-full"
            >
              <span>Inspect Master Calculation Audit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Detailed Breakdown Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Granular Equipment Stock Table</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Dynamic breakdown per equipment category
            </p>
          </div>
          <StatusBadge status="COMPLETED" text="ACID Verified" />
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <div className="table-responsive">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase font-bold tracking-wider ${
                isDark ? 'bg-slate-900/60 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-600 border-b border-slate-200'
              }`}>
                <tr>
                  <th className="p-4">Equipment Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Opening</th>
                  <th className="p-4 text-right">Purchased</th>
                  <th className="p-4 text-right">Transfers In</th>
                  <th className="p-4 text-right">Transfers Out</th>
                  <th className="p-4 text-right">Net Move</th>
                  <th className="p-4 text-right">Assigned</th>
                  <th className="p-4 text-right">Expended</th>
                  <th className="p-4 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {breakdown.map((row, idx) => (
                  <tr key={idx} className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}>
                    <td className="p-4 font-bold text-blue-400">{row.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {row.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold">{row.opening}</td>
                    <td className="p-4 text-right font-semibold text-blue-400">+{row.purchased}</td>
                    <td className="p-4 text-right font-semibold text-emerald-400">+{row.transfersIn}</td>
                    <td className="p-4 text-right font-semibold text-rose-400">-{row.transfersOut}</td>
                    <td className={`p-4 text-right font-bold ${row.netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.netMovement >= 0 ? `+${row.netMovement}` : row.netMovement}
                    </td>
                    <td className="p-4 text-right font-semibold text-amber-400">{row.assigned}</td>
                    <td className="p-4 text-right font-semibold text-rose-400">{row.expended}</td>
                    <td className="p-4 text-right font-extrabold text-blue-500">{row.closing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic Detail Modal for All 5 Cards */}
      <MetricDetailModal
        isOpen={Boolean(activeModalType)}
        onClose={() => setActiveModalType(null)}
        modalType={activeModalType}
        metrics={metrics}
        breakdown={breakdown}
      />
    </div>
  );
};

export default Dashboard;
