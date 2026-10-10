import React, { useEffect, useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Bell, Clock, Volume2, Sparkles, X, RotateCcw, Heart, Check } from 'lucide-react';

export const AlarmRingingModal: React.FC = () => {
  const { activeRingingAlarm, dismissAlarm, snoozeAlarm, onOpenVoiceModal } = useSara();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeRingingAlarm) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl glass-card-pink border-2 border-pink-500 p-6 text-center space-y-5 shadow-[0_0_50px_rgba(255,46,147,0.7)] animate-in zoom-in-95">
        {/* Close Button top-right */}
        <button
          onClick={() => dismissAlarm()}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          title="অ্যালার্ম বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ringing Alarm Icon with Glowing Pulsing Waves */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-60" />
          <div className="absolute -inset-3 rounded-full border border-cyan-400 animate-pulse opacity-40" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,46,147,0.8)]">
            <Bell className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Live Digital Clock */}
        <div>
          <p className="text-3xl font-extrabold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-cyan-200 to-white">
            {currentTimeStr}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span>সারা এআই অ্যালার্ম বাজছে! (Ringing)</span>
          </div>
        </div>

        {/* Alarm Details Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-pink-500/30 text-left space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{activeRingingAlarm.name}</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              {activeRingingAlarm.schedule}
            </span>
          </div>
          <p className="text-xs text-pink-200 bg-pink-950/40 p-2.5 rounded-xl border border-pink-500/20">
            {activeRingingAlarm.action}
          </p>
        </div>

        {/* Actions: Dismiss & Snooze */}
        <div className="space-y-2.5 pt-1">
          {/* Main Dismiss Button */}
          <button
            onClick={() => dismissAlarm()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(255,46,147,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>অ্যালার্ম বন্ধ করুন (Dismiss Alarm)</span>
          </button>

          {/* Snooze & Talk to Sara */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => snoozeAlarm(activeRingingAlarm.id, 5)}
              className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>৫ মিনিট পর আবার</span>
            </button>

            <button
              onClick={() => {
                dismissAlarm();
                if (onOpenVoiceModal) {
                  onOpenVoiceModal();
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-pink-500/30"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
              <span>সারার সাথে কথা বলুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
