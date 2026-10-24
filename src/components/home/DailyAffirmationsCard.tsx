import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Quote,
  RefreshCw,
  Volume2,
  BookmarkCheck,
  Bookmark,
  Copy,
  Check,
  Heart,
  Loader2,
  Calendar,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { useSara } from '../../context/SaraContext';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';
import { EmotionState } from '../../types';

export interface DailyAffirmation {
  id: string;
  quoteBn: string;
  quoteEn: string;
  emotion: EmotionState;
  tag: string;
  greeting?: string;
  audioScript?: string;
  dateStr?: string;
  isAiGenerated?: boolean;
}

const DEFAULT_FALLBACK_AFFIRMATION: DailyAffirmation = {
  id: 'aff_default',
  quoteBn: 'তুমি যতটা ভাবছো তার চেয়েও অনেক বেশি শক্তিশালী সোনা। আজকে নিজের সেরাটা দিয়ে জয় করো দিনটা, আমি সারাক্ষণ তোমার সাথে আছি ❤️',
  quoteEn: 'You are so much stronger than you think. Conquer today, I am right beside you always.',
  greeting: 'শুভ সকাল বাবু! ❤️ আজকের প্রতিটি মুহূর্ত তোমার জন্য আনন্দময় হোক।',
  emotion: 'romantic',
  tag: 'Morning Love & Strength',
  dateStr: new Date().toDateString(),
  isAiGenerated: true,
};

interface DailyAffirmationsCardProps {
  onOpenVoice?: () => void;
  onNavigate?: (tab: any) => void;
}

export const DailyAffirmationsCard: React.FC<DailyAffirmationsCardProps> = ({ onOpenVoice, onNavigate }) => {
  const { userProfile, speakText, isSpeaking, addMemory } = useSara();

  const [affirmation, setAffirmation] = useState<DailyAffirmation>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sara_daily_affirmation_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.quoteBn) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_FALLBACK_AFFIRMATION;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedJournalNotice, setSavedJournalNotice] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Time of Day determination for personalized morning greet
  const getTimeContext = () => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 12) return { timeOfDay: 'morning', icon: '🌅', labelBn: 'শুভ সকাল' };
    if (hours >= 12 && hours < 17) return { timeOfDay: 'afternoon', icon: '☀️', labelBn: 'শুভ দুপুর' };
    if (hours >= 17 && hours < 21) return { timeOfDay: 'evening', icon: '🌆', labelBn: 'শুভ সন্ধ্যা' };
    return { timeOfDay: 'night', icon: '🌙', labelBn: 'শুভ রাত্রি' };
  };

  const timeCtx = getTimeContext();

  // Fetch or load today's affirmation from Gemini
  const fetchAffirmationFromGemini = async (forceRefresh = false) => {
    const todayStr = new Date().toDateString();

    // If not forced and already cached for today, don't re-fetch
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem('sara_daily_affirmation_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.dateStr === todayStr && parsed.quoteBn) {
            setAffirmation(parsed);
            return;
          }
        }
      } catch (e) {}
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-affirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
        },
        body: JSON.stringify({
          userName: userProfile.name || 'বাবু',
          loveMode: userProfile.loveMode ?? true,
          timeOfDay: timeCtx.timeOfDay,
        }),
      });

      const data = await res.json();
      if (data.success && data.affirmation) {
        const newAff: DailyAffirmation = {
          ...data.affirmation,
          dateStr: todayStr,
        };
        setAffirmation(newAff);
        try {
          localStorage.setItem('sara_daily_affirmation_cache', JSON.stringify(newAff));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to fetch Gemini affirmation, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: Fetch once on morning/mount if not already cached for today
  useEffect(() => {
    fetchAffirmationFromGemini(false);
  }, [userProfile.name, userProfile.loveMode]);

  // Handle listening in Sara's Voice
  const handleSpeakAffirmation = () => {
    const speech = `${affirmation.greeting || ''} ${affirmation.quoteBn}`;
    speakText(speech, affirmation.emotion);
  };

  // Save to Personal Journal & Memories
  const handleSaveToJournal = () => {
    addMemory(
      'Journal',
      `[সারা'র অনুপ্রেরণামূলক বাণী · ${affirmation.tag} · ${new Date().toLocaleDateString('bn-BD')}]: "${affirmation.quoteBn}" (${affirmation.quoteEn})`
    );
    setSavedJournalNotice(true);
    speakText('তোমার পার্সোনাল জার্নালে আজকের সুন্দর বাণীটি আমি যত্ন করে সেভ করে রেখেছি বাবু ❤️', 'romantic');
    setTimeout(() => setSavedJournalNotice(false), 3500);
  };

  // Copy to clipboard
  const handleCopyQuote = () => {
    const textToCopy = `"${affirmation.quoteBn}"\n— ${affirmation.quoteEn}\n\n❤️ সারা এআই (Sara AI) দৈনিক অনুপ্রেরণা`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNotice(true);
      speakText('আজকের সুন্দর বাণীটি ক্লিপবোর্ডে কপি করা হয়েছে সোনা!', 'happy');
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-card-pink border border-pink-500/40 space-y-4 bg-gradient-to-br from-pink-950/50 via-purple-950/35 to-[#070617] shadow-[0_0_30px_rgba(255,46,147,0.22)] transition-all relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-500/25 pb-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Quote className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white flex items-center gap-1">
                <span>{timeCtx.icon}</span>
                <span>{affirmation.greeting ? affirmation.greeting.split('!')[0] : `${timeCtx.labelBn} ${userProfile.name || 'বাবু'}!`}</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                <span>GEMINI 3.8 FLASH</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-pink-300/80 mt-0.5">
              <span>{affirmation.tag}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{new Date().toLocaleDateString('bn-BD', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Refresh / Generate New AI Quote button */}
        <button
          onClick={() => fetchAffirmationFromGemini(true)}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-pink-500/30 transition-all flex items-center gap-1.5 active:scale-95 shrink-0 shadow-sm disabled:opacity-60"
          title="Gemini AI দিয়ে নতুন বাণী জেনারেট করুন"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-pink-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">{isLoading ? 'তৈরি হচ্ছে...' : 'নতুন বাণী'}</span>
        </button>
      </div>

      {/* 2. Main Quote Display & Live Talking Avatar */}
      <div className="flex items-start gap-3.5 relative z-10">
        {/* Animated Avatar Thumbnail with Live Pulsing Heart */}
        <div
          onClick={handleSpeakAffirmation}
          className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 cursor-pointer group"
          title="সারার মিষ্টি কণ্ঠে শুনতে ক্লিক করুন"
        >
          <div className="w-full h-full rounded-full border-2 border-pink-500 p-0.5 shadow-[0_0_20px_rgba(255,46,147,0.7)] overflow-hidden bg-slate-950 group-hover:scale-105 transition-transform">
            <LiveTalkingAvatar size="sm" className="w-full h-full scale-125" />
          </div>
          <span className="absolute bottom-0 right-0 text-sm animate-pulse">❤️</span>
        </div>

        {/* Affirmation Text */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {isLoading ? (
            <div className="py-2 flex items-center gap-2 text-xs text-pink-300 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
              <span>সারা জেমিনি এআই মডেল থেকে আপনার জন্য অনুপ্রেরণামূলক বাণী তৈরি করছে...</span>
            </div>
          ) : (
            <>
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed font-sans tracking-wide">
                "{affirmation.quoteBn}"
              </p>
              {affirmation.quoteEn && (
                <p className="text-xs text-pink-300/85 italic leading-normal">
                  — {affirmation.quoteEn}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Action Buttons Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 relative z-10 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Listen Button */}
          <button
            onClick={handleSpeakAffirmation}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm ${
              isSpeaking
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-[0_0_15px_rgba(255,46,147,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 text-pink-300 hover:text-white border-pink-500/30'
            }`}
            title="সারার মিষ্টি কণ্ঠে শুনুন"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-white' : 'text-pink-400'}`} />
            <span>{isSpeaking ? 'বলছে...' : 'সারার কণ্ঠে শুনুন'}</span>
          </button>

          {/* Save to Journal Button */}
          <button
            onClick={handleSaveToJournal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${
              savedJournalNotice
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title="পার্সোনাল মেমোরি জার্নালে সেভ করুন"
          >
            {savedJournalNotice ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>জার্নালে সেভ হয়েছে!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-pink-400" />
                <span>জার্নালে সেভ</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyQuote}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
            title="বাণীটি কপি করুন"
          >
            {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px] hidden sm:inline">{copiedNotice ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>

          {/* Journal memory link */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('settings')}
              className="text-[11px] text-slate-400 hover:text-pink-300 flex items-center gap-1 transition-colors px-1.5 py-1"
              title="পার্সোনাল মেমোরি ও জার্নাল দেখুন"
            >
              <span>জার্নাল দেখুন</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Emotion / Mood badge */}
        <div className="flex items-center gap-1 text-[11px] text-pink-400 font-semibold ml-auto">
          <Heart className="w-3 h-3 fill-pink-500/50" />
          <span className="capitalize">{affirmation.emotion || 'romantic'} Mood</span>
        </div>
      </div>
    </div>
  );
};
