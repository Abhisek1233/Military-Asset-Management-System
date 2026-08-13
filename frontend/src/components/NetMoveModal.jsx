import React from 'react';
import { X, ArrowUpRight, ArrowDownLeft, ShoppingCart, Calculator } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const NetMoveModal = ({ isOpen, onClose, metrics = {} }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const purchases = metrics.purchases || 0;
  const transfersIn = metrics.transfersIn || 0;
  const transfersOut = metrics.transfersOut || 0;
  const netMovement = metrics.netMovement || (purchases + transfersIn - transfersOut);
  const openingBalance = metrics.openingBalance || 0;
  const assigned = metrics.assigned || 0;
  const expended = metrics.expended || 0;
  const closingBalance = metrics.closingBalance || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transition-all transform ${
          isDark
            ? 'bg-surface-card-dark text-txt-primary-dark border border-slate-700'
            : 'bg-surface-card-light text-txt-primary-light border border-surface-border-light'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-700/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Net Movement Breakdown</h2>
              <p className={`text-xs ${isDark ? 'text-txt-muted-dark' : 'text-txt-muted-light'}`}>
                Real-Time Stock Audit & Formula Decomposition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Formula Callout Box */}
          <div className={`p-3.5 rounded-lg text-xs font-mono border ${isDark ? 'bg-slate-900/70 border-slate-800 text-accent-light' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <span className="font-bold text-accent">FORMULA:</span> Net Movement = Purchases + Transfers In - Transfers Out
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3">
            {/* Purchases */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Purchases</div>
                  <div className={`text-xs ${isDark ? 'text-txt-muted-dark' : 'text-txt-muted-light'}`}>Newly procured equipment</div>
                </div>
              </div>
              <span className="text-sm font-bold text-accent">+ {purchases.toLocaleString()}</span>
            </div>

            {/* Transfers In */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Transfers In</div>
                  <div className={`text-xs ${isDark ? 'text-txt-muted-dark' : 'text-txt-muted-light'}`}>Stock received from other bases</div>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-500">+ {transfersIn.toLocaleString()}</span>
            </div>

            {/* Transfers Out */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-rose-500/10 text-rose-500">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Transfers Out</div>
                  <div className={`text-xs ${isDark ? 'text-txt-muted-dark' : 'text-txt-muted-light'}`}>Stock transferred out to other bases</div>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-500">- {transfersOut.toLocaleString()}</span>
            </div>
          </div>

          <div className={`border-t pt-4 space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Total Net Movement</span>
              <span className={netMovement >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {netMovement >= 0 ? `+${netMovement.toLocaleString()}` : netMovement.toLocaleString()}
              </span>
            </div>

            <div className={`p-3 rounded-lg text-xs space-y-1.5 ${isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <div className="flex justify-between">
                <span>Opening Balance:</span>
                <span className="font-semibold">{openingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Personnel:</span>
                <span className="font-semibold text-amber-500"> - {assigned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Expended Stock:</span>
                <span className="font-semibold text-rose-500"> - {expended.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-bold border-t pt-1.5 ${isDark ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'}`}>
                <span>Calculated Closing Balance:</span>
                <span className="text-accent">{closingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetMoveModal;
