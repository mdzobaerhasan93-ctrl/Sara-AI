import React, { useState } from 'react';
import {
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
  Check,
  Minus,
  Plus,
  Play,
  Activity,
  Rotate3d,
  Camera,
  Zap,
  Clock,
  Loader2,
  RefreshCw,
  Smartphone,
  Bot,
} from 'lucide-react';
import { useSara } from '../../context/SaraContext';
import { AICoreOrb } from '../core/AICoreOrb';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';
import { TabType } from '../navigation/BottomNavigation';
import { MoodHabitTracker } from './MoodHabitTracker';
import { WakeWordIndicator } from '../voice/WakeWordIndicator';
import { GestureRecognitionModal } from '../gesture/GestureRecognitionModal';
import { DirectAppControllerModal } from './DirectAppControllerModal';
import { DailyAffirmationsCard } from './DailyAffirmationsCard';

interface HomeViewProps {
  onNavigate: (tab: any) => void;
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
    automations,
    toggleAutomation,
    runAutomation,
    addMemory,
    coinBalance,
    claimDailyReward,
    isDailyRewardClaimed,
    dailyRewardCountdown,
    dailyStreak,
    watchRewardedAd,
    networkConnected,
    systemOperational,
    rewardedAdsAvailable,
  } = useSara();

  const [coreViewMode, setCoreViewMode] = useState<'3d' | 'orb'>('3d');
  const [showGestureModal, setShowGestureModal] = useState<boolean>(false);
  const [showAppControllerModal, setShowAppControllerModal] = useState<boolean>(false);
  const [runningAutoId, setRunningAutoId] = useState<string | null>(null);

  const handleRunAuto = async (id: string) => {
    try {
      setRunningAutoId(id);
      await runAutomation(id);
    } finally {
      setRunningAutoId(null);
    }
  };

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
      {/* 1. Top Core Section (Responsive: Stacks on mobile, Side-by-side on desktop) */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3.5 items-stretch">
        {/* System Connect Modules (Responsive Grid: 2 cols on mobile, 3 on tablet, 1 on desktop) */}
        <div className="order-last lg:order-first lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
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

          {/* Module 3: Data (Automations Section) */}
          <button
            onClick={() => onNavigate('automations' as any)}
            className="p-2 rounded-2xl glass-card border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between transition-all group active:scale-95 text-left bg-gradient-to-r from-cyan-950/60 via-purple-950/30 to-[#070617] shadow-[0_0_15px_rgba(6,182,212,0.18)]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/25 flex items-center justify-center text-cyan-300 group-hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Zap className="w-4 h-4 fill-cyan-400/30" />
              </div>
              <div>
                <p className="text-xs font-bold text-cyan-100 flex items-center gap-1">
                  <span>Data</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">AI</span>
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] text-cyan-300 font-bold">অটোমেশন</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Module 3.2: AI Agent Hub */}
          <button
            onClick={() => onNavigate('agent')}
            className="p-2 rounded-2xl glass-card border border-purple-500/40 hover:border-purple-400 flex items-center justify-between transition-all group active:scale-95 text-left bg-gradient-to-r from-purple-950/70 via-pink-950/40 to-[#070617] shadow-[0_0_15px_rgba(168,85,247,0.25)]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/25 flex items-center justify-center text-purple-300 group-hover:scale-105 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-100 flex items-center gap-1">
                  <span>Agent</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">AI</span>
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-[10px] text-purple-300 font-bold">মুভি ও কমেন্ট</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Module 3.5: Direct In-App Controller */}
          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2 rounded-2xl glass-card border border-pink-500/40 hover:border-pink-400 flex items-center justify-between transition-all group active:scale-95 text-left bg-gradient-to-r from-pink-950/70 via-purple-950/40 to-[#070617] shadow-[0_0_15px_rgba(255,46,147,0.2)]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/25 flex items-center justify-center text-pink-300 group-hover:scale-105 shadow-[0_0_10px_rgba(255,46,147,0.4)]">
                <Smartphone className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-pink-100 flex items-center gap-1">
                  <span>Apps</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">LIVE</span>
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] text-pink-300 font-bold">অ্যাপস কন্ট্রোল</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
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

          {/* Module 5: Gestures AI Camera */}
          <button
            onClick={() => setShowGestureModal(true)}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left bg-gradient-to-r from-pink-950/40 to-purple-950/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Gestures</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                  <span className="text-[10px] text-pink-300">MediaPipe AI</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          </button>

          {/* Module 6: Activity Logs */}
          <button
            onClick={() => onNavigate('activity' as any)}
            className="p-2.5 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/40 flex items-center justify-between transition-all group active:scale-95 text-left bg-gradient-to-r from-purple-950/40 to-pink-950/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Activity</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] text-amber-300">Live Logs</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* 3D REAL HUMAN AVATAR & AI CORE Card (Prominent on top on mobile, side-by-side on desktop) */}
        <div className="order-first lg:order-last lg:col-span-7 rounded-3xl glass-card-pink border border-pink-500/30 p-3 sm:p-4 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[0_0_25px_rgba(255,46,147,0.2)]">
          {/* Subtle cosmic background glow */}
          <div className="absolute inset-0 bg-radial from-pink-900/30 via-purple-950/20 to-transparent pointer-events-none" />

          {/* Header Controls: Mode Switcher (3D Avatar vs Orb) */}
          <div className="relative z-10 w-full flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
              <p className="text-[10px] font-bold tracking-wider text-pink-300 uppercase">
                {coreViewMode === '3d' ? '3D HUMAN' : 'AI ORB'}
              </p>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-pink-500/30">
              <button
                onClick={() => setCoreViewMode('3d')}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 ${
                  coreViewMode === '3d'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-2.5 h-2.5" />
                <span>3D</span>
              </button>
              <button
                onClick={() => setCoreViewMode('orb')}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                  coreViewMode === 'orb'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Orb</span>
              </button>
            </div>
          </div>

          {/* Central 3D Real Human Animated Avatar or Holographic Orb */}
          <div className="relative z-10 my-0.5 w-full flex items-center justify-center">
            {coreViewMode === '3d' ? (
              <div
                onClick={onOpenVoice}
                className="w-full flex justify-center cursor-pointer group"
                title="Click to talk with Sara in 3D"
              >
                <LiveTalkingAvatar
                  size="compact"
                  showStatusBadge={true}
                  className="w-full transition-transform group-hover:scale-102"
                />
              </div>
            ) : (
              <div className="my-1">
                <AICoreOrb size={170} onClick={onOpenVoice} />
              </div>
            )}
          </div>

          {/* Dynamic Voice Reaction & Status */}
          <div className="relative z-10 flex items-center gap-1 text-[10px] font-bold text-pink-400 tracking-wider">
            <span>♥</span>
            <span className="uppercase text-[9px]">
              {isSpeaking ? 'SPEAKING & REACTING' : 'VOICE-REACTIVE 3D'}
            </span>
            <span>♥</span>
          </div>

          {/* Start Sara / Talk Button */}
          <button
            onClick={onOpenVoice}
            className="relative z-10 w-full mt-2 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95 transition-all"
          >
            <span>START SARA</span>
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1.5 DAILY REWARD & POINTS SYSTEM CARD */}
      <div className="rounded-3xl glass-card-pink border border-pink-500/40 p-4 relative overflow-hidden shadow-[0_0_20px_rgba(255,46,147,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
            🪙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ডেইলি রিওয়ার্ড ও কয়েন পয়েন্ট</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                🔥 {dailyStreak} দিন Streak
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ব্যালেন্স: <strong className="text-amber-300 font-mono text-sm">{coinBalance} Coins</strong> • প্রতিদিন রিওয়ার্ড ক্লেইম করুন!
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              const claimed = claimDailyReward();
              if (!claimed) {
                speakText('আজকের ডেইলি রিওয়ার্ড ইতিমধ্যে ক্লেইম করা হয়েছে বাবু! আগামীকালের জন্য অপেক্ষা করো ❤️', 'caring');
              }
            }}
            disabled={isDailyRewardClaimed}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
              isDailyRewardClaimed
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95'
            }`}
          >
            {isDailyRewardClaimed ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>আজ ক্লেইমড ({dailyRewardCountdown})</span>
              </>
            ) : (
              <>
                <span>🎁 রিওয়ার্ড নিন (+১০ কয়েন)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const rewarded = watchRewardedAd();
              if (rewarded) {
                speakText('Verified rewarded ad completion পাওয়া গেছে, তাই bonus record করা হয়েছে।', 'excited');
              } else {
                speakText('বাবু, এখনো কোনো rewarded ad provider বা server verification সংযুক্ত নেই। তাই কোনো bonus coin দেওয়া হয়নি।', 'caring');
              }
            }}
            disabled={!rewardedAdsAvailable}
            aria-describedby="rewarded-ad-status"
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${rewardedAdsAvailable
              ? 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-purple-500/40 active:scale-95'
              : 'bg-slate-900 text-slate-500 border-slate-700 cursor-not-allowed opacity-75'}`}
          >
            <span>📺 {rewardedAdsAvailable ? 'অ্যাড দেখে কয়েন' : 'অ্যাড সার্ভিস সংযুক্ত নয়'}</span>
          </button>
          <p id="rewarded-ad-status" className="w-full text-[10px] text-slate-500 mt-1">
            {rewardedAdsAvailable
              ? 'বোনাস কেবল verified ad completion-এর পর দেওয়া হবে।'
              : 'Ad provider ও server-side verification না থাকায় bonus coins আপাতত বন্ধ।'}
          </p>
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

        {/* 3 Metric Cards (Responsive: single-column on tiny mobile screens, 3-columns on normal screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {/* Metric 1: System Status */}
          <div className="p-2.5 rounded-2xl glass-card border border-amber-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">System Status</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Activity className={`w-3 h-3 ${systemOperational === null ? 'text-amber-400' : systemOperational ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={`text-[11px] font-bold font-mono ${systemOperational === null ? 'text-amber-400' : systemOperational ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {systemOperational === null ? 'NOT MEASURED' : systemOperational ? 'OPERATIONAL' : 'ATTENTION NEEDED'}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {systemOperational === null
                ? 'Native system-health telemetry is not connected.'
                : 'Reported by the connected telemetry source.'}
            </p>
          </div>

          {/* Metric 2: CPU telemetry */}
          <div className="p-2.5 rounded-2xl glass-card border border-cyan-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">CPU Usage</p>
              <p className={`text-base font-extrabold font-mono mt-0.5 ${cpuPower === null ? 'text-slate-400' : 'text-cyan-400'}`}>
                {cpuPower === null ? 'UNAVAILABLE' : `${cpuPower}%`}
              </p>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              {cpuPower !== null && (
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full shadow-[0_0_8px_#00f2fe]"
                  style={{ width: `${cpuPower}%` }}
                />
              )}
            </div>
            {cpuPower === null && <p className="mt-1 text-[10px] text-slate-500">Browser mode cannot read host CPU usage.</p>}
          </div>

          {/* Metric 3: Network status */}
          <div className="p-2.5 rounded-2xl glass-card border border-amber-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Network</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${networkConnected === null ? 'bg-amber-400' : networkConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className={`text-[11px] font-bold font-mono ${networkConnected === null ? 'text-amber-400' : networkConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {networkConnected === null ? 'NOT CHECKED' : networkConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {networkConnected === null
                ? 'Reachability has not been tested by the app.'
                : 'Reported by the connected network-status source.'}
            </p>
          </div>
        </div>
      </div>

      {/* DIRECT IN-APP CONTROLLER SECTION (ফোনে থাকা সমস্ত অ্যাপ কন্ট্রোল) */}
      <div className="p-3.5 sm:p-4 rounded-3xl glass-card border border-pink-500/35 space-y-3 bg-gradient-to-br from-[#120824]/95 via-[#0e071f]/90 to-[#070b1e]/95 shadow-[0_0_25px_rgba(255,46,147,0.18)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-pink-500/25 flex items-center justify-center text-pink-400 shrink-0 shadow-[0_0_12px_rgba(255,46,147,0.4)]">
              <Smartphone className="w-4 h-4 text-pink-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-100 tracking-wider uppercase flex items-center gap-1.5 flex-wrap">
                <span>IN-APP CONTROLLER</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACCESSIBILITY DIRECT
                </span>
              </h3>
              <p className="text-[10px] text-pink-300/90 truncate">
                ইউজারের ফোনের অ্যাপসে সরাসরি ঢুকে অ্যাকশন ও কমেন্ট সম্পাদন
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAppControllerModal(true)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-pink-300 hover:text-white bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 transition-all flex items-center gap-1 shrink-0"
          >
            <span>কন্ট্রোল প্যানেল</span>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          </button>
        </div>

        {/* Quick 1-click in-app action pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-pink-500/20 hover:border-pink-500/40 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400 font-bold text-xs shrink-0">
              IG
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-pink-300">ইনস্টাগ্রাম রিলস</p>
              <p className="text-[9px] text-slate-400 truncate">রিলস দেখা ও কমেন্ট</p>
            </div>
          </button>

          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-blue-500/20 hover:border-blue-500/40 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              FB
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-300">ফেসবুক পোস্ট</p>
              <p className="text-[9px] text-slate-400 truncate">স্ট্যাটাস ও নোটিফিকেশন</p>
            </div>
          </button>

          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-red-500/20 hover:border-red-500/40 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-red-600/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
              YT
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-red-300">ইউটিউব প্লে</p>
              <p className="text-[9px] text-slate-400 truncate">ভিডিও ও শর্টস প্লে</p>
            </div>
          </button>

          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              WA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">হোয়াটসঅ্যাপ</p>
              <p className="text-[9px] text-slate-400 truncate">সরাসরি বার্তা প্রেরণ</p>
            </div>
          </button>

          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              CALC
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">ক্যালকুলেটর</p>
              <p className="text-[9px] text-slate-400 truncate">গণিত সমাধান ও হিসাব</p>
            </div>
          </button>

          <button
            onClick={() => setShowAppControllerModal(true)}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-slate-900 border border-pink-500/30 hover:border-pink-400 flex items-center gap-2 group active:scale-98 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs shrink-0">
              +
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-pink-300 truncate">সমস্ত অ্যাপস...</p>
              <p className="text-[9px] text-slate-400 truncate">কাস্টম অ্যাপ যোগ ও কন্ট্রোল</p>
            </div>
          </button>
        </div>
      </div>

      {/* DATA & AI AUTOMATION SECTION (অটোমেশন ও স্মার্ট এলার্ম) */}
      <div className="p-3.5 sm:p-4 rounded-3xl glass-card border border-cyan-500/30 space-y-3 bg-gradient-to-br from-[#080d1e]/90 via-[#0e0720]/85 to-[#120524]/90 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Zap className="w-4 h-4 fill-cyan-400/30" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-100 tracking-wider uppercase flex items-center gap-1.5 flex-wrap">
                <span>DATA · AI AUTOMATIONS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {automations.filter((a) => a.enabled).length} ACTIVE
                </span>
              </h3>
              <p className="text-[10px] text-cyan-300/80 truncate">স্মার্ট এলার্ম, শিডিউল ও ব্যাকগ্রাউন্ড রুটিন</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('automations' as any)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all flex items-center gap-1 shrink-0"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Automations List */}
        <div className="space-y-2">
          {automations.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                item.enabled
                  ? 'bg-slate-900/80 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.enabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-100 truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30 shrink-0">
                      {item.schedule}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate flex-1 min-w-0">
                      {item.action}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Run Now + Toggle */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => handleRunAuto(item.id)}
                  disabled={runningAutoId === item.id}
                  title="এখনই রান করুন"
                  className="w-8 h-8 rounded-xl bg-pink-500/15 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 shrink-0"
                >
                  {runningAutoId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-pink-400" />
                  )}
                </button>

                <button
                  onClick={() => toggleAutomation(item.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    item.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle automation"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      item.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New / Manage CTA Button */}
        <button
          onClick={() => onNavigate('automations' as any)}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-purple-950/40 to-pink-950/50 border border-cyan-500/30 hover:border-cyan-500/60 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:text-white active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>নতুন এআই এলার্ম বা অটোমেশন সেট করুন</span>
        </button>
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


      {/* 5. DAILY AFFIRMATIONS (Gemini 3.8 Flash Powered) */}
      <DailyAffirmationsCard onOpenVoice={onOpenVoice} onNavigate={onNavigate} />

      {/* Gesture Recognition Modal */}
      <GestureRecognitionModal
        isOpen={showGestureModal}
        onClose={() => setShowGestureModal(false)}
      />

      {/* Direct In-App Controller Modal */}
      <DirectAppControllerModal
        isOpen={showAppControllerModal}
        onClose={() => setShowAppControllerModal(false)}
        onOpenVoice={onOpenVoice}
      />
    </div>
  );
};

