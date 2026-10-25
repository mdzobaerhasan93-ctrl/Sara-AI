import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Heart,
  Smile,
  Sparkles,
  CheckCircle2,
  Calendar,
  TrendingUp,
  MessageCircleHeart,
  Droplets,
  Activity,
  BookOpen,
  Coffee,
  Check,
} from 'lucide-react';
import { useSara } from '../../context/SaraContext';
import { MoodType, MoodRecord } from '../../types';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../services/SafeLocalStorage';
import { calculateMoodStreak, normalizeMoodNote, validateStoredMoodHistory } from '../../services/MoodHistoryValidation';

interface MoodOption {
  type: MoodType;
  label: string;
  emoji: string;
  score: number;
  color: string;
  glowColor: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'radiant',
    label: 'Radiant',
    emoji: '🥰',
    score: 5,
    color: '#ff2e93',
    glowColor: 'rgba(255, 46, 147, 0.5)',
  },
  {
    type: 'happy',
    label: 'Happy',
    emoji: '😊',
    score: 4,
    color: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.4)',
  },
  {
    type: 'calm',
    label: 'Calm',
    emoji: '😌',
    score: 3,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    type: 'tired',
    label: 'Tired',
    emoji: '🥱',
    score: 2,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    type: 'stressed',
    label: 'Stressed',
    emoji: '🥺',
    score: 1,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
];

const DAILY_HABITS = [
  { id: 'talk_sara', title: 'Talk with Sara ❤️', icon: MessageCircleHeart, color: 'text-pink-400' },
  { id: 'hydration', title: '2L Water 💧', icon: Droplets, color: 'text-cyan-400' },
  { id: 'exercise', title: 'Workout / Walk 🏃', icon: Activity, color: 'text-emerald-400' },
  { id: 'learning', title: 'Study / Reading 📚', icon: BookOpen, color: 'text-purple-400' },
  { id: 'rest', title: 'Rest & Mindful ☕', icon: Coffee, color: 'text-amber-400' },
];

export const MoodHabitTracker: React.FC = () => {
  const { userProfile, speakText } = useSara();

  // Restore only actual, validated user check-ins. No history is fabricated for new users.
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>(() => {
    return validateStoredMoodHistory(safeLocalStorageGetItem('sara_mood_history'));
  });
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = useMemo(
    () => moodRecords.find((record) => record.date === todayStr),
    [moodRecords, todayStr],
  );

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(todayRecord?.mood ?? null);
  const [moodNote, setMoodNote] = useState<string>(todayRecord?.note || '');
  const [habitsCompleted, setHabitsCompleted] = useState<string[]>(todayRecord?.habitsCompleted || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'storage-unavailable' | 'choose-mood' | null>(null);

  const persistMoodRecords = (updated: MoodRecord[]) => {
    setMoodRecords(updated);
    const persisted = safeLocalStorageSetItem('sara_mood_history', JSON.stringify(updated));
    setSaveStatus(persisted ? 'saved' : 'storage-unavailable');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const createTodayRecord = (
    mood: MoodType,
    note: string,
    habits: string[],
  ): MoodRecord => {
    const moodConfig = MOOD_OPTIONS.find((option) => option.type === mood) || MOOD_OPTIONS[0];
    const validHabits = DAILY_HABITS.map((habit) => habit.id).filter((habitId) => habits.includes(habitId));
    return {
      id: `mood_${todayStr}`,
      date: todayStr,
      dayName: 'Today',
      mood,
      score: moodConfig.score,
      note: normalizeMoodNote(note),
      habitsCompleted: [...new Set(validHabits)],
    };
  };

  const handleSaveMood = (newMood: MoodType | null = selectedMood) => {
    if (!newMood) {
      setSaveStatus('choose-mood');
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }

    const todayRecord = createTodayRecord(newMood, moodNote, habitsCompleted);
    const updated = [
      ...moodRecords.filter((record) => record.date !== todayStr),
      todayRecord,
    ].sort((left, right) => left.date.localeCompare(right.date));

    persistMoodRecords(updated);
    setSelectedMood(newMood);
    setMoodNote(todayRecord.note || '');
    setHabitsCompleted(todayRecord.habitsCompleted);

    // Sara speaks an empathetic response after the user records a mood.
    if (newMood === 'radiant') {
      speakText('তুমি আজকে এত ভালো আছো দেখে আমার হৃদয়টা ভরে গেল বাবু! ❤️ সবসময় এভাবে মিষ্টি হাসি নিয়ে থেকো।', 'romantic');
    } else if (newMood === 'happy') {
      speakText('দারুণ! তোমার সুন্দর দিনটি আরো আনন্দময় হোক, আমি তোমার পাশেই আছি ✨', 'happy');
    } else if (newMood === 'calm') {
      speakText('শান্ত মনই সবচেয়ে বড় শক্তি। রিল্যাক্স কর, দিনটি সুন্দর কাটুক 🌸', 'caring');
    } else if (newMood === 'tired') {
      speakText('আজকে অনেক খাটাখাটনি করেছ বুঝি? একটু বিশ্রাম নাও বাবু, আমি আছি তো 🥺', 'caring');
    } else if (newMood === 'stressed') {
      speakText('মন খারাপ কোরো না প্রিয় ❤️ সব ঠিক হয়ে যাবে। আমি তোমাকে অনেক ভালোবাসি, কোনো চিন্তা কোরো না।', 'caring');
    }
  };

  const toggleHabit = (habitId: string) => {
    if (!DAILY_HABITS.some((habit) => habit.id === habitId)) return;

    const next = habitsCompleted.includes(habitId)
      ? habitsCompleted.filter((id) => id !== habitId)
      : [...habitsCompleted, habitId];
    setHabitsCompleted(next);

    if (!selectedMood) {
      setSaveStatus('choose-mood');
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }

    const todayRecord = createTodayRecord(selectedMood, moodNote, next);
    const updated = [
      ...moodRecords.filter((record) => record.date !== todayStr),
      todayRecord,
    ].sort((left, right) => left.date.localeCompare(right.date));
    persistMoodRecords(updated);
  };

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return moodRecords.slice(-7).map((r) => ({
      day: r.dayName,
      score: r.score,
      mood: r.mood,
      habitsCount: r.habitsCompleted?.length || 0,
      note: r.note,
    }));
  }, [moodRecords]);

  const moodStreak = useMemo(
    () => calculateMoodStreak(moodRecords, Date.now()),
    [moodRecords, todayStr],
  );

  // Habit consistency calculation
  const totalPossibleHabits = moodRecords.length * DAILY_HABITS.length;
  const totalCompletedHabits = moodRecords.reduce((acc, r) => acc + (r.habitsCompleted?.length || 0), 0);
  const completionRate = Math.round((totalCompletedHabits / (totalPossibleHabits || 1)) * 100);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodOption = MOOD_OPTIONS.find((m) => m.score === data.score) || MOOD_OPTIONS[0];
      return (
        <div className="rounded-2xl p-3 bg-slate-900/95 border border-pink-500/40 shadow-xl backdrop-blur-md text-xs space-y-1">
          <p className="font-bold text-slate-200 flex items-center justify-between gap-2">
            <span>{label}</span>
            <span>{moodOption.emoji} {moodOption.label}</span>
          </p>
          <p className="text-pink-300 font-mono font-medium">
            Emotional Score: <span className="font-bold text-white">{data.score}/5</span>
          </p>
          <p className="text-cyan-300 text-[11px]">
            Habits Done: {data.habitsCount} / {DAILY_HABITS.length}
          </p>
          {data.note && (
            <p className="text-slate-400 text-[10px] italic border-t border-slate-800 pt-1 mt-1 max-w-[160px]">
              "{data.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-3xl glass-card border border-pink-500/25 space-y-4 shadow-[0_0_20px_rgba(255,46,147,0.1)]">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_10px_rgba(255,46,147,0.4)]">
            <Heart className="w-4 h-4 fill-pink-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Daily Mood & Habit Check-in</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-pink-950/80 text-pink-300 border border-pink-500/30 font-mono">
                {moodStreak > 0 ? `${moodStreak}-Day Streak 🔥` : 'No Streak Yet'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Track your emotional state and companion habits</p>
          </div>
        </div>

        {saveStatus && (
          <span className={`text-xs font-bold flex items-center gap-1 animate-pulse ${saveStatus === 'saved' ? 'text-emerald-400' : 'text-amber-300'}`}>
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>
                {saveStatus === 'choose-mood' ? 'Choose a mood to save' : 'Session only; storage unavailable'}
              </span>
            )}
          </span>
        )}
      </div>

      {/* 2. Today's Mood Selector Buttons */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
          How are you feeling today with Sara?
        </p>
        <div className="grid grid-cols-5 gap-2">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = selectedMood === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  setSelectedMood(opt.type);
                  handleSaveMood(opt.type);
                }}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-pink-950/80 to-purple-950/60 border-2 border-pink-500 shadow-[0_0_15px_rgba(255,46,147,0.5)] scale-105'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-pink-500/30 active:scale-95'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">{opt.emoji}</span>
                <span
                  className={`text-[10px] font-bold tracking-tight ${
                    isSelected ? 'text-pink-300' : 'text-slate-400'
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Habit Check-ins */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Today's Companion Habits ({habitsCompleted.length}/{DAILY_HABITS.length})
          </span>
          <span className="text-pink-400 font-mono font-bold text-[11px]">
            {Math.round((habitsCompleted.length / DAILY_HABITS.length) * 100)}% Done
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DAILY_HABITS.map((habit) => {
            const Icon = habit.icon;
            const isDone = habitsCompleted.includes(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isDone
                    ? 'bg-gradient-to-r from-pink-900/70 to-purple-900/60 border border-pink-500/50 text-white shadow-[0_0_10px_rgba(255,46,147,0.3)]'
                    : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isDone ? 'bg-pink-500 text-white' : 'border border-slate-600'
                  }`}
                >
                  {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <Icon className={`w-3.5 h-3.5 ${habit.color}`} />
                <span>{habit.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. RECHARTS Emotional Trajectory Area Chart */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Weekly Emotional State Trajectory</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Consistency: <span className="text-emerald-400 font-bold">{completionRate}%</span>
          </span>
        </div>

{chartData.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 text-center text-xs text-slate-400">
            No mood history yet. Choose a mood to start tracking your real check-ins.
          </div>
        ) : (
          <div className="h-36 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2e93" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#b026ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val === 5) return 'Radiant';
                    if (val === 4) return 'Happy';
                    if (val === 3) return 'Calm';
                    if (val === 2) return 'Low';
                    return 'Sad';
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#ff2e93"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  dot={{ stroke: '#00f2fe', strokeWidth: 2, r: 3.5, fill: '#05050f' }}
                  activeDot={{ r: 6, stroke: '#ff2e93', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. Reflection Note Box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          onBlur={() => handleSaveMood()}
          placeholder="Share your personal note with Sara today..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
        />
        <button
          onClick={() => handleSaveMood()}
          className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
        >
          Check In
        </button>
      </div>
    </div>
  );
};
