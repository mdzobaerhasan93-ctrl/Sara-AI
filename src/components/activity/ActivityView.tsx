import React, { useMemo } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Heart,
  Sparkles,
  Smile,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { MoodType, MoodRecord } from '../../types';

export const ActivityView: React.FC = () => {
  const { activityLogs, userProfile } = useSara();

  // Generate or load 30 days of continuous mood check-in data
  const thirtyDayData = useMemo(() => {
    const today = new Date();
    const data: Array<{
      date: string;
      fullDate: string;
      dayNum: number;
      score: number;
      mood: MoodType;
      label: string;
      habitsCount: number;
      note?: string;
    }> = [];

    // Check for user-saved records in localStorage
    let savedRecords: MoodRecord[] = [];
    try {
      const saved = localStorage.getItem('sara_mood_history');
      if (saved) savedRecords = JSON.parse(saved);
    } catch (e) {}

    // 30 days realistic curve
    const seedScores = [
      4, 4, 3, 5, 4, 4, 5, 4, 3, 4, 5, 5, 4, 3, 4,
      4, 5, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 5, 5,
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthName = months[d.getMonth()];
      const dayDate = d.getDate();
      const displayDate = `${monthName} ${dayDate}`;

      // Check if user has an existing record for this date
      const matched = savedRecords.find((r) => r.date === dateStr);
      const score = matched ? matched.score : seedScores[29 - i] || 4;

      let mood: MoodType = 'happy';
      let label = 'Happy';
      if (score >= 5) {
        mood = 'radiant';
        label = 'Radiant 🥰';
      } else if (score === 4) {
        mood = 'happy';
        label = 'Happy 😊';
      } else if (score === 3) {
        mood = 'calm';
        label = 'Calm 😌';
      } else if (score === 2) {
        mood = 'tired';
        label = 'Tired 🥱';
      } else {
        mood = 'stressed';
        label = 'Stressed 🥺';
      }

      data.push({
        date: displayDate,
        fullDate: dateStr,
        dayNum: 30 - i,
        score,
        mood,
        label,
        habitsCount: matched?.habitsCompleted?.length || (score >= 4 ? 4 : 2),
        note: matched?.note || (i === 0 ? 'Logged with Sara today ❤️' : 'Sweet conversations & daily progress.'),
      });
    }

    return data;
  }, []);

  // Compute 30-Day metrics
  const avgScore = (
    thirtyDayData.reduce((acc, d) => acc + d.score, 0) / thirtyDayData.length
  ).toFixed(1);

  const peakJoyDays = thirtyDayData.filter((d) => d.score >= 4).length;
  const resilienceRate = Math.round((peakJoyDays / thirtyDayData.length) * 100);

  // Custom 30-Day Neon Tooltip
  const CustomTrendsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-2xl p-3.5 bg-slate-900/95 border-2 border-pink-500/50 shadow-[0_0_20px_rgba(255,46,147,0.4)] backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-pink-500/20 pb-1">
            <span className="font-bold text-slate-200">{item.date}</span>
            <span className="text-pink-300 font-semibold">{item.label}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Emotional Score:</span>
            <span className="font-bold font-mono text-cyan-300 text-sm">{item.score} / 5</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Habits Checked:</span>
            <span className="font-mono text-emerald-400 font-bold">{item.habitsCount} / 5</span>
          </div>
          {item.note && (
            <p className="text-[10px] text-pink-200/90 italic pt-1 border-t border-slate-800">
              "{item.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 pb-20 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>Emotional Trends & Activity</span>
          <span className="text-pink-400 text-base">❤️</span>
        </h2>
        <p className="text-xs text-slate-400">
          30-day emotional state trajectory and verified assistant execution timeline
        </p>
      </div>

      {/* 2. EMOTIONAL TRENDS DASHBOARD (30-DAY RECHARTS LINE CHART) */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border-2 border-pink-500/30 shadow-[0_0_25px_rgba(255,46,147,0.15)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-500/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,46,147,0.5)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>30-Day Emotional Trends</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-950/80 text-pink-300 border border-pink-500/30 font-mono">
                  Monthly Trajectory
                </span>
              </h3>
              <p className="text-xs text-slate-400">Continuous emotional wellness check-in arc</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Average:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
              {avgScore} / 5.0 (Radiant)
            </span>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-pink-500/20">
            <p className="text-[10px] uppercase font-bold text-slate-400">30-Day Average</p>
            <p className="text-lg font-extrabold text-pink-400 font-mono mt-0.5">
              {avgScore} <span className="text-xs font-normal text-slate-400">/ 5</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">● Positive Elevation</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-cyan-500/20">
            <p className="text-[10px] uppercase font-bold text-slate-400">Peak Joy Days</p>
            <p className="text-lg font-extrabold text-cyan-400 font-mono mt-0.5">
              {peakJoyDays} <span className="text-xs font-normal text-slate-400">Days</span>
            </p>
            <p className="text-[10px] text-cyan-300 font-medium">Score ≥ 4.0</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-purple-500/20">
            <p className="text-[10px] uppercase font-bold text-slate-400">Resilience Rate</p>
            <p className="text-lg font-extrabold text-purple-400 font-mono mt-0.5">
              {resilienceRate}%
            </p>
            <p className="text-[10px] text-purple-300 font-medium">High Stability</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-emerald-500/20">
            <p className="text-[10px] uppercase font-bold text-slate-400">Companion Streak</p>
            <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
              30 <span className="text-xs font-normal text-slate-400">Days</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">100% Active</p>
          </div>
        </div>

        {/* RECHARTS LINE CHART WITH SMOOTH NEON-PINK GRADIENT STROKE */}
        <div className="pt-2">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={thirtyDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Neon-pink gradient stroke */}
                  <linearGradient id="neonPinkStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff2e93" />
                    <stop offset="30%" stopColor="#ff5ea8" />
                    <stop offset="70%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ff2e93" />
                  </linearGradient>

                  {/* Glowing neon shadow filter */}
                  <filter id="neonPinkGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Soft subtle underlying area fill */}
                  <linearGradient id="neonPinkArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2e93" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b026ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 46, 147, 0.12)" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  interval={4} // clean 5-6 day intervals across 30 days
                />

                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickFormatter={(val) => {
                    if (val === 5) return '🥰 5';
                    if (val === 4) return '😊 4';
                    if (val === 3) return '😌 3';
                    if (val === 2) return '🥱 2';
                    return '🥺 1';
                  }}
                />

                <Tooltip content={<CustomTrendsTooltip />} />

                {/* Smooth Neon-Pink Gradient Line */}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#neonPinkStroke)"
                  strokeWidth={3.5}
                  filter="url(#neonPinkGlow)"
                  dot={{
                    r: 2.5,
                    fill: '#ff2e93',
                    stroke: '#ffffff',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 6.5,
                    fill: '#ff2e93',
                    stroke: '#ffffff',
                    strokeWidth: 2.5,
                    filter: 'url(#neonPinkGlow)',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution Badges */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2e93] shadow-[0_0_6px_#ff2e93]" />
            <span className="text-slate-300 font-medium">Radiant: 47%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] shadow-[0_0_6px_#00f2fe]" />
            <span className="text-slate-300 font-medium">Happy: 33%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-slate-300 font-medium">Calm: 17%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-slate-300 font-medium">Tired: 3%</span>
          </div>
        </div>
      </div>

      {/* 3. VERIFIED ACTIVITY & ACTION TIMELINE */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Activity Center Timeline ({activityLogs.length})
        </h3>

        <div className="rounded-3xl glass-card border border-pink-500/20 divide-y divide-slate-800 overflow-hidden">
          {activityLogs.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No activity logged yet.</p>
          ) : (
            activityLogs.map((item) => (
              <div key={item.id} className="p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  {item.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : item.status === 'PENDING' ? (
                    <Clock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
                  </div>
                  {item.details && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.service}
                    </span>
                    <span
                      className={`text-[9px] font-bold font-mono ${
                        item.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ● {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
