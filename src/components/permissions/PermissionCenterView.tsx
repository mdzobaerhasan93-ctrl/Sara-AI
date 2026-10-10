import React from 'react';
import { useSara } from '../../context/SaraContext';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

export const PermissionCenterView: React.FC = () => {
  const { pendingActions, approveAction, rejectAction } = useSara();

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Permission Center</h2>
        <p className="text-xs text-slate-400">
          Strict approval gate: No external consequential action executes without your explicit consent
        </p>
      </div>

      {/* Pending Action Approvals */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Pending Approvals ({pendingActions.filter((a) => a.status === 'PENDING').length})
        </h3>

        {pendingActions.filter((a) => a.status === 'PENDING').length === 0 ? (
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 text-center space-y-1.5">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">All Safe & Clear</h4>
            <p className="text-xs text-slate-400">There are no pending actions waiting for your approval.</p>
          </div>
        ) : (
          pendingActions
            .filter((a) => a.status === 'PENDING')
            .map((proposal) => (
              <div
                key={proposal.id}
                className="p-4 rounded-3xl glass-card-pink border-2 border-pink-500/60 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{proposal.risk.toUpperCase()} RISK ACTION PROPOSAL</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-pink-300 font-mono border border-pink-500/30">
                    {proposal.service}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{proposal.title}</h4>
                  <div className="mt-2 p-2.5 rounded-xl bg-black/50 text-slate-300 font-mono text-xs space-y-1">
                    {Object.entries(proposal.details).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-pink-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => rejectAction(proposal.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => approveAction(proposal.id)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,46,147,0.5)] transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Execute</span>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Historic Action Approvals */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Action History
        </h3>
        <div className="rounded-3xl glass-card border border-pink-500/20 divide-y divide-slate-800 overflow-hidden text-xs">
          {pendingActions.filter((a) => a.status !== 'PENDING').length === 0 ? (
            <p className="p-4 text-center text-slate-500">No action history yet.</p>
          ) : (
            pendingActions
              .filter((a) => a.status !== 'PENDING')
              .map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-200">{p.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.service}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      p.status === 'EXECUTED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
