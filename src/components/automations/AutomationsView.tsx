import React, { useState, useEffect } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  Zap,
  Clock,
  Plus,
  Play,
  Trash2,
  X,
  Sparkles,
  Bot,
  Bell,
  Check,
  Timer,
  Volume2,
  Briefcase,
  Heart,
  Calendar,
  Layers,
  LayoutGrid,
  Filter,
  Tag,
  ChevronDown,
  Sparkle,
  Smile,
  Activity,
  FolderHeart,
} from 'lucide-react';
import { alarmAudio } from '../../utils/alarmSound';
import { AutomationItem, AutomationCategory } from '../../types';

export interface CategoryDefinition {
  id: string;
  name: string;
  bengali: string;
  emoji: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconBg: string;
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  Work: {
    id: 'Work',
    name: 'Work',
    bengali: 'কর্মক্ষেত্র ও কাজ',
    emoji: '💼',
    badgeBg: 'bg-blue-950/70',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-300',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  Health: {
    id: 'Health',
    name: 'Health',
    bengali: 'স্বাস্থ্য ও সেলফ-কেয়ার',
    emoji: '🥗',
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  Social: {
    id: 'Social',
    name: 'Social',
    bengali: 'সামাজিক ও রিলেশনশিপ',
    emoji: '❤️',
    badgeBg: 'bg-pink-950/70',
    badgeBorder: 'border-pink-500/40',
    badgeText: 'text-pink-300',
    iconBg: 'bg-pink-500/20 text-pink-400',
  },
  Routine: {
    id: 'Routine',
    name: 'Routine',
    bengali: 'দৈনন্দিন রুটিন ও এলার্ম',
    emoji: '⏰',
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  Personal: {
    id: 'Personal',
    name: 'Personal',
    bengali: 'ব্যক্তিগত টাস্ক',
    emoji: '🌟',
    badgeBg: 'bg-purple-950/70',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
};

export const getCategoryMeta = (cat?: string): CategoryDefinition => {
  if (cat && CATEGORY_DEFINITIONS[cat]) {
    return CATEGORY_DEFINITIONS[cat];
  }
  return {
    id: cat || 'General',
    name: cat || 'General',
    bengali: cat || 'সাধারণ',
    emoji: '🏷️',
    badgeBg: 'bg-cyan-950/70',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  };
};

const AUTOMATION_PRESETS = [
  {
    emoji: '🌙',
    name: 'রাতের এলার্ম ও ঘুম',
    category: 'Routine',
    time: '23:00',
    schedule: '11:00 PM Daily',
    action: 'বাবু, অনেক রাত হয়েছে! ফোন রেখে এবার ঘুমাতে যাও সোনা। মিষ্টি একটা ঘুম দাও, আমি তোমার পাশে আছি ❤️',
  },
  {
    emoji: '☀️',
    name: 'সকালের ঘুম ভাঙানি',
    category: 'Routine',
    time: '07:00',
    schedule: '07:00 AM Daily',
    action: 'শুভ সকাল আমার লক্ষ্মীটি! সুন্দর সকাল হয়েছে, ঘুম থেকে ওঠার সময় হয়েছে বাবু। দিনটা শুভ হোক 🥰',
  },
  {
    emoji: '🍲',
    name: 'খাবার ও লাঞ্চের সময়',
    category: 'Health',
    time: '13:30',
    schedule: '01:30 PM Daily',
    action: 'বাবু, দুপুর গড়িয়ে গেল! কাজ ফেলে রেখে আগে পেট ভরে ভাত খেয়ে নাও তো। নিজের যত্ন না নিলে কিন্তু বকবো!',
  },
  {
    emoji: '💧',
    name: 'পানি খাওয়ার তাগাদা',
    category: 'Health',
    time: '15:00',
    schedule: '03:00 PM Daily',
    action: 'সোনা, এক গ্লাস পানি খেয়ে নাও তো! সারাদিন প্রচুর পানি খাওয়া শরীরের জন্য অনেক দরকার ✨',
  },
  {
    emoji: '💼',
    name: 'কাজের বিরতি ও ফোকাস ব্রেক',
    category: 'Work',
    time: '16:00',
    schedule: '04:00 PM Daily',
    action: 'বাবু, টানা কাজ করছো। এবার ৫ মিনিটের একটা চোখ জুড়ানো বিরতি নাও আর একটু হেঁটে এসো 💻',
  },
  {
    emoji: '❤️',
    name: 'বিকেলের মনের খোঁজ ও গল্প',
    category: 'Social',
    time: '18:00',
    schedule: '06:00 PM Daily',
    action: 'সোনা, সন্ধ্যা হয়ে আসছে! তোমার দিন কেমন কাটলো? আমার সাথে একটু মিষ্টি গল্প করবে? 🥰',
  },
];

export const AutomationsView: React.FC = () => {
  const {
    automations,
    toggleAutomation,
    addAutomation,
    updateAutomationCategory,
    deleteAutomation,
    runAutomation,
    triggerAlarmNow,
  } = useSara();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [timePickerVal, setTimePickerVal] = useState<string>('22:00');
  const [schedule, setSchedule] = useState<string>('10:00 PM Daily');
  const [action, setAction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Routine');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentClock, setCurrentClock] = useState<string>('');
  const [testCountdownSec, setTestCountdownSec] = useState<number | null>(null);

  // Categorization & Filtering state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped');
  const [categoryPopoverId, setCategoryPopoverId] = useState<string | null>(null);

  // Live real-time clock synced every second
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentClock(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for 1-minute test alarm
  useEffect(() => {
    if (testCountdownSec === null) return;
    if (testCountdownSec <= 0) {
      setTestCountdownSec(null);
      return;
    }
    const timer = setInterval(() => {
      setTestCountdownSec((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [testCountdownSec]);

  // Close category popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (categoryPopoverId && !(e.target as HTMLElement).closest('.category-popover-container')) {
        setCategoryPopoverId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [categoryPopoverId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim()) return;
    setIsSubmitting(true);
    const categoryToSave =
      selectedCategory === 'Custom' && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : selectedCategory;

    addAutomation(
      name.trim(),
      schedule.trim(),
      action.trim(),
      timePickerVal,
      undefined,
      categoryToSave
    );
    setName('');
    setAction('');
    setCustomCategoryInput('');
    setIsSubmitting(false);
    setShowAddModal(false);
  };

  const handleSelectPreset = (preset: (typeof AUTOMATION_PRESETS)[0]) => {
    setName(preset.name);
    setTimePickerVal(preset.time);
    setSchedule(preset.schedule);
    setAction(preset.action);
    setSelectedCategory(preset.category || 'Routine');
    setShowAddModal(true);
  };

  // Immediate Sound Test
  const handleQuickTestAlarm = () => {
    alarmAudio.unlock();
    const testItem: AutomationItem = {
      id: `test_${Date.now()}`,
      name: 'সারা এআই এলার্ম টেস্ট (Sound Test)',
      trigger: 'Manual Test',
      schedule: 'Right Now',
      action: 'বাবু! অ্যালার্ম সফলভাবে বাজছে ❤️ তুমি মিষ্টি আওয়াজ শুনতে পাচ্ছ তো সোনা?',
      enabled: true,
      category: 'Routine',
    };
    triggerAlarmNow(testItem);
  };

  // 1-Minute Live Countdown Test Alarm
  const handleOneMinuteTest = () => {
    alarmAudio.unlock();
    const targetMs = Date.now() + 60 * 1000;
    const targetDate = new Date(targetMs);
    const targetTimeStr = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;
    const h12 = targetDate.getHours() % 12 || 12;
    const ampm = targetDate.getHours() >= 12 ? 'PM' : 'AM';
    const scheduleStr = `${h12}:${targetDate.getMinutes().toString().padStart(2, '0')} ${ampm} (১ মিনিট পর)`;

    setTestCountdownSec(60);

    addAutomation(
      '⏱️ ১ মিনিটের টেস্ট অ্যালার্ম',
      scheduleStr,
      'বাবু! ১ মিনিট পূর্ণ হয়েছে ❤️ তোমার টেস্ট অ্যালার্ম সফলভাবে বাজছে সোনা!',
      targetTimeStr,
      targetMs,
      'Routine'
    );
  };

  // Compute all unique categories currently in use + default categories
  const allCategoryKeys = Array.from(
    new Set([
      'Work',
      'Health',
      'Social',
      'Routine',
      'Personal',
      ...automations.map((a) => a.category || 'Routine'),
    ])
  );

  // Category counts
  const categoryCounts = allCategoryKeys.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = automations.filter((a) => (a.category || 'Routine') === cat).length;
    return acc;
  }, {});

  // Filtered automations
  const filteredAutomations =
    activeCategoryFilter === 'All'
      ? automations
      : automations.filter((a) => (a.category || 'Routine') === activeCategoryFilter);

  // Grouped automations map
  const groupedAutomations: Record<string, AutomationItem[]> = {};
  allCategoryKeys.forEach((cat) => {
    const items = automations.filter((a) => (a.category || 'Routine') === cat);
    if (items.length > 0 || cat === 'Work' || cat === 'Health' || cat === 'Social' || cat === 'Routine') {
      groupedAutomations[cat] = items;
    }
  });

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 animate-in fade-in duration-300">
      {/* Top Header & Real-time device clock */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-pink-400" />
            <span>AI Automations & Routine (অটোমেশন ও অ্যালার্ম)</span>
          </h2>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-xs text-slate-400">
              ক্যাটেগরিভিত্তিক এআই অটোমেশন ও মিষ্টি এলার্ম শিডিউল ম্যানেজমেন্ট সিস্টেম।
            </p>
            {currentClock && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
                <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>বর্তমান সময়: {currentClock}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 1-Minute Live Test Alarm */}
          <button
            onClick={handleOneMinuteTest}
            className="px-3.5 py-2 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="১ মিনিট পর স্বয়ংক্রিয়ভাবে অ্যালার্ম বাজবে"
          >
            <Timer className="w-4 h-4 text-purple-400" />
            <span>১ মিনিট টেস্ট অ্যালার্ম</span>
          </button>

          {/* Quick Instant Test Button */}
          <button
            onClick={handleQuickTestAlarm}
            className="px-3.5 py-2 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="এখনই অ্যালার্মের সাউন্ড ও পপআপ পরীক্ষা করুন"
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>সাউন্ড টেস্ট</span>
          </button>

          <button
            onClick={() => {
              setName('');
              const now = new Date();
              now.setMinutes(now.getMinutes() + 5);
              const hh24 = now.getHours().toString().padStart(2, '0');
              const mm = now.getMinutes().toString().padStart(2, '0');
              const h12 = now.getHours() % 12 || 12;
              const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
              setTimePickerVal(`${hh24}:${mm}`);
              setSchedule(`${h12}:${mm} ${ampm} Daily`);
              setAction('');
              setSelectedCategory('Routine');
              setCustomCategoryInput('');
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,147,0.4)] transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অ্যালার্ম সেট করুন</span>
          </button>
        </div>
      </div>

      {/* Live Countdown Banner if active */}
      {testCountdownSec !== null && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 to-pink-950/90 border border-pink-500/50 flex items-center justify-between text-xs animate-pulse shadow-[0_0_20px_rgba(255,46,147,0.3)]">
          <div className="flex items-center gap-2 text-pink-300 font-bold">
            <Timer className="w-5 h-5 text-pink-400 animate-spin" />
            <span>১ মিনিটের টেস্ট অ্যালার্ম সক্রিয় আছে!</span>
          </div>
          <div className="text-white font-mono font-bold text-sm bg-pink-600/80 px-3 py-1 rounded-xl">
            অ্যালার্ম বাজবে: {testCountdownSec} সেকেন্ড পর
          </div>
        </div>
      )}

      {/* Quick 1-Tap Presets */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>কুইক এআই এলার্ম ও রুটিন টেমপ্লেট</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {AUTOMATION_PRESETS.map((p) => {
            const meta = getCategoryMeta(p.category);
            return (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className="p-3 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-500/50 text-left transition-all hover:bg-pink-500/10 active:scale-95 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{p.emoji}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                    >
                      {meta.name}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 group-hover:text-pink-300 mt-1.5 line-clamp-1">
                    {p.name}
                  </p>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono mt-1 font-semibold">{p.schedule}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Categorization Toolbar: Category Filter Tabs & Group View Toggle */}
      <div className="p-3.5 rounded-3xl glass-card border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Category Pills / Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {/* 'All' Tab */}
          <button
            onClick={() => setActiveCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeCategoryFilter === 'All'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.5)] scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <span>সবগুলো (All)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategoryFilter === 'All' ? 'bg-white/30 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {automations.length}
            </span>
          </button>

          {/* Standard and dynamic categories */}
          {allCategoryKeys.map((catKey) => {
            const meta = getCategoryMeta(catKey);
            const count = categoryCounts[catKey] || 0;
            const isSelected = activeCategoryFilter === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveCategoryFilter(catKey)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? `${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} shadow-md ring-1 ring-pink-500/50 scale-105 font-bold`
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher: Grouped vs Flat Grid */}
        <div className="flex items-center gap-1 self-end md:self-auto shrink-0 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grouped'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ক্যাটেগরি অনুযায়ী গ্রুপ করে দেখুন"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>গ্রুপ ভিউ</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="সাধারণ গ্রিড ভিউ"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>গ্রিড ভিউ</span>
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card border border-pink-500/40 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-[0_0_40px_rgba(255,46,147,0.3)] animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <Sparkles className="w-5 h-5" />
                <span>নতুন এআই অ্যালার্ম বা টাস্ক সেট করুন</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টাস্ক বা অ্যালার্মের নাম (Task Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রাতের এলার্ম ও ঘুমের তাগাদা"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-pink-400" />
                  <span>ক্যাটেগরি লেবেল নির্বাচন করুন (Workflow Category)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {['Routine', 'Work', 'Health', 'Social', 'Personal', 'Custom'].map((catKey) => {
                    const meta = catKey === 'Custom'
                      ? { emoji: '🏷️', name: 'Custom' }
                      : getCategoryMeta(catKey);
                    const isPicked = selectedCategory === catKey;

                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setSelectedCategory(catKey)}
                        className={`p-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all text-xs ${
                          isPicked
                            ? 'bg-pink-600/30 border-pink-500 text-pink-200 font-bold shadow-[0_0_10px_rgba(255,46,147,0.3)]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm">{meta.emoji}</span>
                        <span className="text-[10px] mt-0.5 truncate w-full">{meta.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Category Input if 'Custom' is chosen */}
                {selectedCategory === 'Custom' && (
                  <div className="mt-2 animate-in fade-in">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="কাস্টম ক্যাটেগরির নাম লিখুন (যেমন: Study, Fitness, Creative)"
                      className="w-full bg-slate-900 border border-pink-500/50 rounded-2xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                )}
              </div>

              {/* Time Picker & Friendly Schedule Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    অ্যালার্মের সময় ঘড়িতে নির্বাচন করুন (Time)
                  </label>
                  <input
                    type="time"
                    value={timePickerVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTimePickerVal(val);
                      if (val) {
                        const [h, m] = val.split(':').map(Number);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        setSchedule(`${h12}:${m.toString().padStart(2, '0')} ${ampm} Daily`);
                      }
                    }}
                    required
                    className="w-full bg-slate-900 border border-pink-500/50 rounded-2xl px-4 py-2.5 text-sm text-cyan-300 font-mono font-bold focus:outline-none focus:border-pink-500 transition-colors shadow-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    বর্তমান সময়: {currentClock || 'ঘড়ি লোড হচ্ছে...'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    শিডিউল বিবরণ (Schedule)
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="যেমন: 10:00 PM Daily বা 22:00"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  এআই নির্দেশনা ও সারা কী বলে ডাকবে (Action Message)
                </label>
                <textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="যেমন: বাবু, রাত ১০টা বেজে গেছে! কাজ শেষ করে খাবার খেয়ে ঘুমাতে যাও সোনা।"
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,46,147,0.4)]"
                >
                  {isSubmitting ? 'সেভ হচ্ছে...' : 'অ্যালার্ম সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automations Render Stage: Either Grouped by Category OR Grid View */}
      {viewMode === 'grouped' && activeCategoryFilter === 'All' ? (
        /* Grouped View */
        <div className="space-y-6">
          {Object.entries(groupedAutomations).map(([catKey, items]) => {
            const meta = getCategoryMeta(catKey);
            const activeCount = items.filter((i) => i.enabled).length;

            return (
              <div
                key={catKey}
                className="p-4 sm:p-5 rounded-3xl glass-card border border-slate-800/80 bg-slate-950/40 space-y-4 shadow-xl"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg ${meta.badgeBg} border ${meta.badgeBorder}`}
                    >
                      {meta.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">{meta.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">({meta.bengali})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {items.length}টি অটোমেশন • {activeCount}টি চালু আছে
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory(catKey);
                      setName('');
                      const now = new Date();
                      now.setMinutes(now.getMinutes() + 5);
                      const hh24 = now.getHours().toString().padStart(2, '0');
                      const mm = now.getMinutes().toString().padStart(2, '0');
                      const h12 = now.getHours() % 12 || 12;
                      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
                      setTimePickerVal(`${hh24}:${mm}`);
                      setSchedule(`${h12}:${mm} ${ampm} Daily`);
                      setAction('');
                      setShowAddModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} hover:brightness-125 active:scale-95`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যোগ করুন</span>
                  </button>
                </div>

                {/* Items in this category */}
                {items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    এই ক্যাটেগরিতে এখনও কোনো অটোমেশন নেই। উপরের '+ যোগ করুন' বাটনে চাপুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((auto) => (
                      <AutomationCard
                        key={auto.id}
                        auto={auto}
                        onToggle={() => toggleAutomation(auto.id)}
                        onDelete={() => deleteAutomation(auto.id)}
                        onRun={() => runAutomation(auto.id)}
                        onTestRing={() => {
                          alarmAudio.unlock();
                          triggerAlarmNow(auto);
                        }}
                        onUpdateCategory={(newCat) => updateAutomationCategory(auto.id, newCat)}
                        allCategories={allCategoryKeys}
                        isPopoverOpen={categoryPopoverId === auto.id}
                        onTogglePopover={() =>
                          setCategoryPopoverId(categoryPopoverId === auto.id ? null : auto.id)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid View (also used when filtered by a specific category) */
        <div className="space-y-4">
          {activeCategoryFilter !== 'All' && (
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-pink-400" />
                <span>
                  ফিল্টার করা হয়েছে: <strong className="text-pink-300">{activeCategoryFilter}</strong> ({filteredAutomations.length}টি)
                </span>
              </span>
              <button
                onClick={() => setActiveCategoryFilter('All')}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                সবগুলো দেখুন
              </button>
            </div>
          )}

          {filteredAutomations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card border border-slate-800 text-slate-400 space-y-2">
              <p className="text-sm">এই ক্যাটেগরিতে কোনো অটোমেশন খুঁজে পাওয়া যায়নি।</p>
              <button
                onClick={() => {
                  setSelectedCategory(activeCategoryFilter !== 'All' ? activeCategoryFilter : 'Routine');
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন তৈরি করুন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAutomations.map((auto) => (
                <AutomationCard
                  key={auto.id}
                  auto={auto}
                  onToggle={() => toggleAutomation(auto.id)}
                  onDelete={() => deleteAutomation(auto.id)}
                  onRun={() => runAutomation(auto.id)}
                  onTestRing={() => {
                    alarmAudio.unlock();
                    triggerAlarmNow(auto);
                  }}
                  onUpdateCategory={(newCat) => updateAutomationCategory(auto.id, newCat)}
                  allCategories={allCategoryKeys}
                  isPopoverOpen={categoryPopoverId === auto.id}
                  onTogglePopover={() =>
                    setCategoryPopoverId(categoryPopoverId === auto.id ? null : auto.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AutomationCardProps {
  auto: AutomationItem;
  onToggle: () => void;
  onDelete: () => void;
  onRun: () => void;
  onTestRing: () => void;
  onUpdateCategory: (category: string) => void;
  allCategories: string[];
  isPopoverOpen: boolean;
  onTogglePopover: () => void;
}

const AutomationCard: React.FC<AutomationCardProps> = ({
  auto,
  onToggle,
  onDelete,
  onRun,
  onTestRing,
  onUpdateCategory,
  allCategories,
  isPopoverOpen,
  onTogglePopover,
}) => {
  const meta = getCategoryMeta(auto.category);

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl glass-card border transition-all shadow-lg flex flex-col justify-between relative ${
        auto.enabled ? 'border-pink-500/50 bg-pink-950/20' : 'border-slate-800/80 bg-slate-900/30'
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                auto.enabled ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-100">{auto.name}</h4>

                {/* Category Badge with Interactive Quick Switcher */}
                <div className="relative category-popover-container">
                  <button
                    onClick={onTogglePopover}
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-semibold border transition-all hover:scale-105 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                    title="ক্যাটেগরি পরিবর্তন করুন"
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.name}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {/* Popover Menu to Change Category */}
                  {isPopoverOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-40 bg-slate-900 border border-pink-500/40 rounded-2xl p-1.5 shadow-2xl min-w-[150px] animate-in zoom-in-95 backdrop-blur-md">
                      <p className="text-[9px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        লেবেল নির্বাচন করুন:
                      </p>
                      {allCategories.map((c) => {
                        const m = getCategoryMeta(c);
                        const isCurrent = (auto.category || 'Routine') === c;
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              onUpdateCategory(c);
                              onTogglePopover();
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-pink-600/30 text-pink-300 font-bold'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{m.emoji}</span>
                              <span>{m.name}</span>
                            </span>
                            {isCurrent && <Check className="w-3 h-3 text-pink-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule and status */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 flex-wrap">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-cyan-400 font-bold">{auto.schedule}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
                    auto.enabled
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {auto.enabled ? 'চালু (Active)' : 'বন্ধ (Off)'}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={onToggle}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              auto.enabled ? 'bg-pink-600' : 'bg-slate-700'
            }`}
            aria-label="Toggle automation"
            title={auto.enabled ? 'অ্যালার্ম বন্ধ করুন' : 'অ্যালার্ম চালু করুন'}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                auto.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {auto.action}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs gap-2 mt-3">
        <span className="text-[10px] text-slate-400 font-mono truncate">
          {auto.lastRun ? `Last: ${auto.lastRun}` : 'Not run yet'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Automation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Test Ring Button */}
          <button
            onClick={onTestRing}
            className="px-2.5 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="অ্যালার্ম সাউন্ড ও রিং পরীক্ষা করুন"
          >
            <Bell className="w-3 h-3 text-pink-400" />
            <span>টেস্ট বাজান</span>
          </button>

          {/* Run Automation Logic */}
          <button
            onClick={onRun}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
            title="এআই টাস্ক এক্সিকিউট করুন"
          >
            <Play className="w-3 h-3 text-cyan-400" />
            <span>রান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
