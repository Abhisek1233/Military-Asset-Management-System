import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Layers, 
  ArrowRightLeft, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowDownLeft, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const MetricDetailModal = ({ isOpen, onClose, modalType, metrics, breakdown = [] }) => {
  const { isDark } = useTheme();

  if (!isOpen || !modalType) return null;

  const renderContent = () => {
    switch (modalType) {
      case 'opening':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Total Opening Baseline</span>
                <div className="text-2xl font-extrabold">{metrics.openingBalance?.toLocaleString()} Units</div>
              </div>
              <Layers className="w-8 h-8 text-blue-500/80" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline Equipment Breakdown</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {breakdown.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400 text-sm">{item.opening} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'netMovement':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border text-xs font-mono ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="font-bold text-blue-400 mb-1">FORMULA:</div>
              <div>Net Movement = Purchases + Transfers In - Transfers Out</div>
              <div className="mt-2 text-emerald-400 font-bold text-sm">
                +{metrics.netMovement} = +{metrics.purchases} + {metrics.transfersIn} - {metrics.transfersOut}
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Purchases Procured</div>
                    <div className="text-[10px] text-slate-400">Newly acquired stock</div>
                  </div>
                </div>
                <span className="font-extrabold text-blue-400 text-sm">+{metrics.purchases}</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Transfers In</div>
                    <div className="text-[10px] text-slate-400">Stock received from other bases</div>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-400 text-sm">+{metrics.transfersIn}</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded bg-rose-500/10 text-rose-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Transfers Out</div>
                    <div className="text-[10px] text-slate-400">Stock transferred out to other bases</div>
                  </div>
                </div>
                <span className="font-extrabold text-rose-400 text-sm">-{metrics.transfersOut}</span>
              </div>
            </div>
          </div>
        );

      case 'assigned':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Active Personnel Allocations</span>
                <div className="text-2xl font-extrabold">{metrics.assigned?.toLocaleString()} Units</div>
              </div>
              <UserCheck className="w-8 h-8 text-amber-500/80" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Allocated Equipment Summary</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {breakdown.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">{item.assigned} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'expended':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Total Expended Inventory</span>
                <div className="text-2xl font-extrabold">{metrics.expended?.toLocaleString()} Units</div>
              </div>
              <Flame className="w-8 h-8 text-rose-500/80" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consumed Equipment Breakdown</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {breakdown.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400 text-sm">{item.expended} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Real-Time Closing Stock</span>
                <div className="text-2xl font-extrabold text-emerald-400">{metrics.closingBalance?.toLocaleString()} Units</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
            </div>

            <div className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="font-bold text-blue-400 uppercase text-[10px]">Master Inventory Formula:</div>
              <div>Closing = Opening + Net Movement - Assigned - Expended</div>

              <div className="pt-2 border-t border-slate-700/60 space-y-1">
                <div className="flex justify-between">
                  <span>Opening Balance:</span>
                  <span className="font-bold">{metrics.openingBalance}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>+ Net Movement:</span>
                  <span className="font-bold">+{metrics.netMovement}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>- Assigned Personnel:</span>
                  <span className="font-bold">-{metrics.assigned}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>- Expended Stock:</span>
                  <span className="font-bold">-{metrics.expended}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 font-extrabold text-sm text-emerald-400">
                  <span>= Calculated Closing:</span>
                  <span>{metrics.closingBalance}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'opening': return { title: 'Opening Balance Audit', icon: Layers, color: 'text-blue-500' };
      case 'netMovement': return { title: 'Net Movement Breakdown', icon: ArrowRightLeft, color: 'text-blue-400' };
      case 'assigned': return { title: 'Assigned Personnel Audit', icon: UserCheck, color: 'text-amber-500' };
      case 'expended': return { title: 'Expended Inventory Audit', icon: Flame, color: 'text-rose-500' };
      case 'closing': return { title: 'Closing Balance Calculation', icon: ShieldCheck, color: 'text-emerald-500' };
      default: return { title: 'Metric Details', icon: ShieldCheck, color: 'text-blue-500' };
    }
  };

  const { title, icon: IconHeader, color } = getModalTitle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden transition-all ${
        isDark ? 'bg-[#1E293B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl bg-slate-800/60 ${color}`}>
              <IconHeader className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">{title}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-Time Stock Audit & Database Decomposition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex justify-end ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className="btn-secondary !px-5"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;
