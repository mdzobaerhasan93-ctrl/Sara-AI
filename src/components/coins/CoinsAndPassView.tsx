import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  CircleDollarSign,
  Gift,
  Play,
  Zap,
  Check,
  Share2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';

export const CoinsAndPassView: React.FC = () => {
  const {
    coinBalance,
    coinTransactions,
    claimDailyReward,
    isDailyRewardClaimed,
    dailyRewardCountdown,
    dailyStreak,
    resetDailyRewardForTest,
    isPassActive,
    passRemainingSeconds,
    activatePass,
    watchRewardedAd,
    adsWatchedToday,
  } = useSara();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Format remaining seconds into HH:MM:SS
  const formatSeconds = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleGenerateReferral = () => {
    const code = `SARA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReferralCode(code);
    navigator.clipboard.writeText(`Join SARA AI with my code ${code} and get 100 free coins!`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      <div className="text-center py-1">
        <h2 className="text-xl font-bold text-slate-100">Sara Coins</h2>
      </div>

      {/* 1. Main Current Balance Card (matching screenshot #11) */}
      <div className="p-6 rounded-3xl glass-card-pink border border-pink-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_25px_rgba(255,46,147,0.15)]">
        {/* Avatar Thumbnail with Pink Heart Ring */}
        <div className="relative w-16 h-16 mb-2">
          <div className="w-16 h-16 rounded-full border-2 border-pink-500 p-0.5 shadow-[0_0_15px_rgba(255,46,147,0.6)] overflow-hidden bg-slate-900">
            <LiveTalkingAvatar size="sm" className="w-full h-full scale-125" />
          </div>
          <span className="absolute bottom-0 right-0 text-sm">❤️</span>
        </div>

        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          CURRENT BALANCE
        </p>
        <h3 className="text-4xl font-extrabold text-slate-100 font-mono my-1 tracking-tight">
          {coinBalance} Coins
        </h3>
        <p className="text-xs text-slate-400">
          Use Sara Coins to unlock AI features.
        </p>
      </div>

      {/* 2. FREE COINS Header & Refer & Earn */}
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] tracking-wide inline-block shadow-sm">
          FREE COINS
        </span>

        {/* Refer & Earn Card */}
        <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-slate-100">Refer & Earn</h4>
            </div>
            <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-2xl text-amber-400 font-bold font-mono text-xs">
              <span>500</span>
              <span>🪙</span>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            You get 500 coins, your friend gets 100 coins — when they join and chat once.
          </p>

          <button
            onClick={handleGenerateReferral}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(176,38,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedCode ? 'Referral Link Copied! 📋' : 'Generate My Referral Code'}</span>
          </button>
          {referralCode && (
            <p className="text-[11px] text-center font-mono text-cyan-300">
              Code: {referralCode}
            </p>
          )}
        </div>

        {/* Daily Reward Card */}
        <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">Daily Reward</h4>
                <p className="text-xs text-slate-400">Claim your free daily coins & build streak.</p>
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-mono text-sm">
              +{[10, 20, 30, 50, 75, 100, 250][(dailyStreak - 1) % 7]} 🪙
            </span>
          </div>

          {/* 7-Day Streak Pills */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {[10, 20, 30, 50, 75, 100, 250].map((amt, idx) => {
              const dayNum = idx + 1;
              const isCompleted = dayNum < dailyStreak || (dayNum === dailyStreak && isDailyRewardClaimed);
              const isToday = dayNum === dailyStreak && !isDailyRewardClaimed;

              return (
                <div
                  key={dayNum}
                  className={`p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : isToday
                      ? 'bg-gradient-to-b from-pink-900/60 to-purple-900/60 border-pink-500 text-pink-300 ring-2 ring-pink-500/40 shadow-lg scale-105'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-[9px] font-bold">D{dayNum}</span>
                  <span className="text-[11px] font-extrabold font-mono mt-0.5">+{amt}</span>
                  {isCompleted ? (
                    <Check className="w-3 h-3 text-emerald-400 mt-1" />
                  ) : (
                    <span className="text-[9px] text-amber-400 mt-1">🪙</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => claimDailyReward()}
            disabled={isDailyRewardClaimed}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isDailyRewardClaimed
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 cursor-default'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95 animate-pulse'
            }`}
          >
            {isDailyRewardClaimed ? (
              <>
                <Check className="w-4 h-4" />
                <span>Claimed for Today ✓</span>
              </>
            ) : (
              <span>Claim Free +{[10, 20, 30, 50, 75, 100, 250][(dailyStreak - 1) % 7]} Coins</span>
            )}
          </button>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Next reward in {dailyRewardCountdown}</span>
            {isDailyRewardClaimed && (
              <button
                onClick={() => resetDailyRewardForTest()}
                className="text-[10px] text-pink-400/80 hover:text-pink-300 underline"
              >
                Reset for Demo Test
              </button>
            )}
          </div>
        </div>

        {/* Earn More Coins Card (from screenshot #15) */}
        <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Play className="w-3.5 h-3.5 fill-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Earn More Coins</h4>
                <p className="text-xs text-slate-400">Watch a rewarded task to earn coins.</p>
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-mono text-xs">+20 🪙</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Today's Progress</span>
              <span className="font-mono font-bold text-purple-300">
                {adsWatchedToday} / 5 Tasks Done
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                style={{ width: `${(adsWatchedToday / 5) * 100}%` }}
              />
            </div>
          </div>

          {adsWatchedToday < 5 ? (
            <button
              onClick={() => watchRewardedAd()}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Watch Video Task (+20 Coins)
            </button>
          ) : (
            <p className="text-[10px] text-slate-400 text-center">
              Daily limit reached. Come back tomorrow.
            </p>
          )}
        </div>
      </div>

      {/* 3. Unlock Full Access / Sara AI Pass */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Unlock Full Access
        </h4>

        <div className="p-4 rounded-3xl glass-card border border-pink-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Zap className="w-5 h-5 fill-pink-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Sara AI Pass</h4>
                <p className="text-xs text-slate-400">
                  Text Chat • Avatar • Camera • Screen Reading — Everything
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-bold font-mono text-sm">50 🪙</p>
              <p className="text-[10px] text-slate-400">6 Hour</p>
            </div>
          </div>

          {isPassActive ? (
            <div className="w-full py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs tracking-wider flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Active — {formatSeconds(passRemainingSeconds)} left</span>
            </div>
          ) : (
            <button
              onClick={() => activatePass(6)}
              disabled={coinBalance < 50}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95 transition-all disabled:opacity-40"
            >
              Activate Pass for 50 Coins
            </button>
          )}
        </div>
      </div>

      {/* 4. Active Pass Indicator Card (from screenshot #15) */}
      {isPassActive && (
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Active Pass
          </h4>
          <div className="p-4 rounded-3xl glass-card-green border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <Zap className="w-5 h-5 fill-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Sara AI Pass</h4>
                <p className="text-xs text-emerald-400 font-mono">
                  {formatSeconds(passRemainingSeconds)} Remaining
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 border border-emerald-500/40 text-emerald-300">
              Active
            </span>
          </div>
        </div>
      )}

      {/* 5. Coin History List (from screenshot #15) */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Coin History
        </h4>
        <div className="rounded-3xl glass-card border border-pink-500/20 divide-y divide-slate-800 overflow-hidden">
          {coinTransactions.map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-200 font-medium">{tx.title}</span>
              <span
                className={`font-mono font-bold ${
                  tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
