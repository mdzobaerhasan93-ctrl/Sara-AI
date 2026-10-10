import React from 'react';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

interface WakeWordIndicatorProps {
  isHandsFreeActive: boolean;
  onToggle: () => void;
  wakeWord: string;
  isSupported?: boolean;
}

export const WakeWordIndicator: React.FC<WakeWordIndicatorProps> = ({
  isHandsFreeActive,
  onToggle,
  wakeWord,
  isSupported = true,
}) => {
  if (!isSupported) return null;

  return (
    <div className="flex items-center justify-between p-2.5 px-3 rounded-2xl glass-card border border-pink-500/20 text-xs">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isHandsFreeActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
        >
          {isHandsFreeActive ? (
            <Mic className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <MicOff className="w-3.5 h-3.5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-200">Hands-Free Wake Word</span>
            {isHandsFreeActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Say <span className="text-cyan-300 font-mono font-semibold">"{wakeWord}"</span> or <span className="text-cyan-300 font-mono font-semibold">"Hey Sara"</span> to activate
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded-xl font-bold text-[11px] tracking-wider transition-all ${
          isHandsFreeActive
            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
        }`}
      >
        {isHandsFreeActive ? 'ACTIVE' : 'MUTED'}
      </button>
    </div>
  );
};
