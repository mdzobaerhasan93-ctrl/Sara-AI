import React from 'react';
import {
  Lock,
  Cpu,
  Wifi,
  Sparkles,
  Heart,
  Mic,
  Volume2,
  ChevronRight,
  Database,
  Star,
  Send,
  BarChart2,
  Dices,
  Minus,
  Plus,
  Play,
  Activity,
} from 'lucide-react';
import { useSara } from '../../context/SaraContext';
import { AICoreOrb } from '../core/AICoreOrb';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';
import { TabType } from '../navigation/BottomNavigation';
import { MoodHabitTracker } from './MoodHabitTracker';
import { WakeWordIndicator } from '../voice/WakeWordIndicator';

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenVoice: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenVoice }) => {
  const {
    userProfile,
    updateUserProfile,
    assistantState,
    cpuPower,
    speakText,
    isSpeaking,
    activeAvatarId,
  } = useSara();

  const handleTimeoutChange = (delta: number) => {
    const current = userProfile.autoTimeoutSeconds || 10;
    const next = Math.max(5, Math.min(30, current + delta));
    updateUserProfile({ autoTimeoutSeconds: next });
  };

  const handleGreetingSpeak = () => {
    speakText('হ্যালো বাবু! ❤️ আমি সারা, তোমার সাথেই আছি। বল, কিভাবে তোমার দিনটা সুন্দর করে দিতে পারি?', 'romantic');
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* 1. Top Core Section (Left Modules + Right AI Core Unit) */}
      <div className="grid grid-cols-12 gap-3 items-stretch">
        {/* Left Side: 4 System Connect Modules */}
        <div className="col-span-5 flex flex-col justify-between space-y-2">
          {/* Module 1: Mem */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-400 group-hover:scale-105">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Mem</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Connected</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Module 2: Soul */}
          <button
            onClick={() => onNavigate('avatar')}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-105">
                <Star className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Soul</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Connected</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Module 3: Data */}
          <button
            onClick={() => onNavigate('science')}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 group-hover:scale-105">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Data</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Connected</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Module 4: Stats */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Stats</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Connected</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Right Side: AI CORE UNIT Card */}
        <div className="col-span-7 rounded-3xl glass-card-pink border border-pink-500/30 p-3.5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[0_0_25px_rgba(255,46,147,0.15)]">
          {/* Subtle cosmic background glow */}
          <div className="absolute inset-0 bg-radial from-pink-900/20 via-transparent to-transparent pointer-events-none" />

          {/* Header Tag */}
          <p className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">
            • AI CORE UNIT •
          </p>

          {/* Central Holographic Particle Sphere */}
          <div className="my-1">
            <AICoreOrb size={170} onClick={onOpenVoice} />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-400 tracking-wider">
            <span>♥</span>
            <span className="uppercase text-[10px]">ACTIVE & LEARNING</span>
            <span>♥</span>
          </div>

          {/* Start Sara Button */}
          <button
            onClick={onOpenVoice}
            className="w-full mt-2.5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-pink-500 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95 transition-all"
          >
            <span>START SARA</span>
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SYSTEM OVERVIEW + LOVE MODE TOGGLE */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            • SYSTEM OVERVIEW •
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-400 tracking-wide">Love Mode</span>
            {/* Custom iOS style pink toggle */}
            <button
              onClick={() => updateUserProfile({ loveMode: !userProfile.loveMode })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                userProfile.loveMode ? 'bg-pink-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  userProfile.loveMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards matching screenshot */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Metric 1: System Status */}
          <div className="p-2.5 rounded-2xl glass-card border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">System Status</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 font-mono">OPERATIONAL</span>
              </div>
            </div>
            {/* Green Heartbeat line */}
            <div className="mt-2 h-4 w-full flex items-center">
              <svg viewBox="0 0 100 24" className="w-full h-full text-emerald-400">
                <path
                  d="M 0 12 L 30 12 L 40 4 L 50 20 L 60 2 L 70 18 L 80 12 L 100 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Metric 2: CPU Power */}
          <div className="p-2.5 rounded-2xl glass-card border border-cyan-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">CPU Power</p>
              <p className="text-base font-extrabold text-cyan-400 font-mono mt-0.5">
                {cpuPower}%
              </p>
            </div>
            {/* Blue glowing bar */}
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full shadow-[0_0_8px_#00f2fe]"
                style={{ width: `${cpuPower}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Network */}
          <div className="p-2.5 rounded-2xl glass-card border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Network</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400 font-mono">CONNECTED</span>
              </div>
            </div>
            {/* Green Waveform */}
            <div className="mt-2 h-4 w-full flex items-center">
              <svg viewBox="0 0 100 24" className="w-full h-full text-emerald-400">
                <path
                  d="M 0 12 Q 15 2 30 12 T 60 12 T 90 12 L 100 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY MOOD CHECK-IN & HABIT TRACKER (RECHARTS VISUALIZATION) */}
      <MoodHabitTracker />

      {/* 3. VOICE COMMANDS SECTION from screenshot #9 */}
      <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            VOICE COMMANDS
          </h3>
        </div>

        {/* Wake Word row */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Wake Word</p>
              <p className="text-sm font-bold text-cyan-400 font-mono">{userProfile.wakeWord}</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            ACTIVE
          </span>
        </div>

        {/* Dismiss Word row */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Dismiss Word</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">{userProfile.dismissWord}</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            ACTIVE
          </span>
        </div>

        {/* Auto Timeout row */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-pink-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Auto Timeout</p>
              <p className="text-sm font-bold text-pink-400 font-mono">
                {userProfile.autoTimeoutSeconds} <span className="text-xs font-normal text-slate-400">sec</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTimeoutChange(-5)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleTimeoutChange(5)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400/90 flex items-center gap-1.5 pt-1">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold">i</span>
          Say wake word to activate · Bye Bye to dismiss
        </p>
      </div>

      {/* 4. GAMES SECTION from screenshot #9 */}
      <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
          GAMES
        </h3>

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-purple-950/40 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Play Ludo</h4>
              <p className="text-xs text-slate-400">Single Player vs Sara Bot</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ludo')}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
          >
            PLAY
          </button>
        </div>
      </div>

      {/* 5. SARA'S CARING VOICE QUOTE CARD from screenshot #9 */}
      <div
        onClick={handleGreetingSpeak}
        className="p-4 rounded-3xl glass-card-pink border border-pink-500/30 flex items-center justify-between cursor-pointer hover:border-pink-500/50 active:scale-98 transition-all group shadow-[0_0_20px_rgba(255,46,147,0.15)]"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar Thumbnail with Pink Neon Ring */}
          <div className="relative w-13 h-13 shrink-0">
            <div className="w-13 h-13 rounded-full border-2 border-pink-500 p-0.5 shadow-[0_0_15px_rgba(255,46,147,0.6)] overflow-hidden bg-slate-900">
              <LiveTalkingAvatar size="sm" className="w-full h-full scale-125" />
            </div>
            <span className="absolute bottom-0 right-0 text-xs">❤️</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>I'm here for you, always</span>
              <span className="text-pink-400">♥</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              How can I make your day better today?
            </p>
          </div>
        </div>

        {/* Sound wave icon */}
        <div className="w-12 h-6 text-emerald-400 flex items-center shrink-0">
          <svg viewBox="0 0 60 20" className="w-full h-full">
            <path
              d="M 0 10 L 10 10 L 15 2 L 25 18 L 35 4 L 45 16 L 50 10 L 60 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
