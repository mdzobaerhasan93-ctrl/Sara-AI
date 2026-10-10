import React from 'react';
import { useSara } from '../../context/SaraContext';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  AlertTriangle,
  Mic,
  MapPin,
  Bell,
  Radio,
  Database,
  Volume2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PermissionCenterView: React.FC = () => {
  const {
    pendingActions,
    approveAction,
    rejectAction,
    permissions,
    requestMicrophonePermission,
    requestLocationPermission,
    requestNotificationPermission,
    togglePermission,
    grantAllPermissions,
  } = useSara();

  const grantedCount = [
    permissions.microphone === 'granted',
    permissions.location === 'granted',
    permissions.notifications === 'granted',
    permissions.wakeWord,
    permissions.persistentMemory,
    permissions.audioPlayback,
    permissions.floatingOverlay,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>Permission Center</span>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </h2>
        <p className="text-xs text-slate-400">
          ইউজার কনসেন্ট গেটওয়ে: কোনো পারমিশন বা অ্যাকশন আপনার অনুমতি ছাড়া সচল হবে না
        </p>
      </div>

      {/* 1. Device & Companion Access Permissions */}
      <div className="p-4 rounded-3xl glass-card-pink border border-pink-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Access Permissions ({grantedCount}/7 Granted)</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              নিচে থেকে যে কোনো পারমিশন অন বা অফ করুন
            </p>
          </div>
          <button
            onClick={() => grantAllPermissions()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Grant All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Mic */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-pink-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">Microphone</p>
                <p className="text-[10px] text-slate-400">{permissions.microphone === 'granted' ? 'Active ✓' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => togglePermission('microphone')}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                permissions.microphone === 'granted' ? 'bg-pink-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  permissions.microphone === 'granted' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Location */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">Location</p>
                <p className="text-[10px] text-slate-400">{permissions.location === 'granted' ? 'Active ✓' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => togglePermission('location')}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                permissions.location === 'granted' ? 'bg-cyan-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  permissions.location === 'granted' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">Notifications</p>
                <p className="text-[10px] text-slate-400">{permissions.notifications === 'granted' ? 'Active ✓' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => togglePermission('notifications')}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                permissions.notifications === 'granted' ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  permissions.notifications === 'granted' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wake Word */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">Wake Word</p>
                <p className="text-[10px] text-slate-400">{permissions.wakeWord ? 'Listening ✓' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => togglePermission('wakeWord')}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                permissions.wakeWord ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  permissions.wakeWord ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pending Action Approvals Gate */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Pending Consequential Actions ({pendingActions.filter((a) => a.status === 'PENDING').length})
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

      {/* 3. Historic Action Approvals */}
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
