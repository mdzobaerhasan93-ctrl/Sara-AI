import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Sparkles, Globe, Shield, Activity, X } from 'lucide-react';

interface FloatingScreenControlOrbProps {
  onOpenVoice: () => void;
}

export const FloatingScreenControlOrb: React.FC<FloatingScreenControlOrbProps> = ({ onOpenVoice }) => {
  const { screenControlEnabled, currentEmotion } = useSara();
  const [showStatusTooltip, setShowStatusTooltip] = useState<boolean>(false);

  if (!screenControlEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Tooltip / Status popup */}
      {showStatusTooltip && (
        <div className="glass-card-pink border border-pink-500/40 p-3 rounded-2xl shadow-[0_0_20px_rgba(255,46,147,0.4)] text-xs text-slate-100 max-w-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-pink-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>SARA Screen Control Active</span>
            </div>
            <button
              onClick={() => setShowStatusTooltip(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            Background neural engine active. Say: "ফেসবুক ওপেন করো", "ইউটিউব ওপেন করো", or "মুভি সার্চ দাও".
          </p>
        </div>
      )}

      {/* Floating Planet / Rotating Orb Button */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-75 blur-sm animate-pulse" />

        <button
          onClick={() => {
            onOpenVoice();
          }}
          onMouseEnter={() => setShowStatusTooltip(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 border-2 border-pink-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(255,46,147,0.6)] hover:scale-105 active:scale-95 transition-all group overflow-hidden"
          title="SARA Screen Control Active (Click to talk)"
        >
          {/* Rotating Planet rings effect */}
          <div className="absolute inset-0 rounded-full border border-pink-400/30 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-1 rounded-full border border-cyan-400/20 animate-[spin_6s_linear_infinite_reverse]" />

          {/* Center Core Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center text-pink-300">
            <Globe className="w-6 h-6 animate-pulse text-pink-400" />
            <span className="absolute -bottom-1 text-[8px] font-bold tracking-tighter bg-pink-600/90 text-white px-1 rounded-full">
              LIVE
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
