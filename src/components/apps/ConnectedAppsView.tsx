import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { AppDefinition, InAppAction, AppInventoryService } from '../../services/AppInventoryService';
import {
  Smartphone,
  Plus,
  Trash2,
  Play,
  Zap,
  CheckCircle2,
  ExternalLink,
  Bot,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
  Search,
  Check,
  ArrowRight,
  Layers,
  Settings,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const ConnectedAppsView: React.FC = () => {
  const {
    availableApps,
    registerCustomApp,
    removeCustomApp,
    speakText,
    screenControlEnabled,
    setScreenControlEnabled,
    executeScreenCommand,
    addActivityLog
  } = useSara();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [activeRunningAction, setActiveRunningAction] = useState<{
    appName: string;
    actionName: string;
    stepIndex: number;
    steps: string[];
    isDone: boolean;
  } | null>(null);

  // Command prompt simulator
  const [testCommand, setTestCommand] = useState('');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  // New Custom App Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppBengali, setNewAppBengali] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newLaunchUri, setNewLaunchUri] = useState('');
  const [newWebFallback, setNewWebFallback] = useState('');
  const [newCategory, setNewCategory] = useState<'social' | 'video' | 'chat' | 'camera' | 'productivity' | 'system'>('productivity');
  const [newActionName, setNewActionName] = useState('');
  const [newActionBengali, setNewActionBengali] = useState('');
  const [newActionSteps, setNewActionSteps] = useState('Step 1: Open Application\nStep 2: Navigate to Main Dashboard\nStep 3: Execute Action & Confirm');

  // Pre-configured Quick App Presets for 1-click addition
  const quickPresets = [
    {
      name: 'bKash (বিকাশ)',
      bengaliName: 'বিকাশ',
      packageName: 'com.bKash.customerapp',
      launchUri: 'bkash://app',
      webFallbackUrl: 'https://www.bkash.com',
      category: 'productivity' as const,
      iconColor: '#E2136E',
      accentBg: 'from-pink-600/30 to-rose-600/20',
      actionName: 'Check Balance & Transactions',
      actionBengali: 'ব্যালেন্স ও লেনদেন চেক করো',
      steps: ['Launch bKash app', 'Request accessibility touch on Balance badge', 'Read balance audio feedback']
    },
    {
      name: 'Nagad (নগদ)',
      bengaliName: 'নগদ',
      packageName: 'com.konasl.nagad',
      launchUri: 'nagad://app',
      webFallbackUrl: 'https://nagad.com.bd',
      category: 'productivity' as const,
      iconColor: '#F7941D',
      accentBg: 'from-amber-600/30 to-orange-600/20',
      actionName: 'Open Balance Dashboard',
      actionBengali: 'নগদ ব্যালেন্স ও স্টেটমেন্ট দেখো',
      steps: ['Launch Nagad app', 'Focus pin authentication', 'Read statement preview']
    },
    {
      name: 'Daraz (দারাজ)',
      bengaliName: 'দারাজ',
      packageName: 'com.daraz.android',
      launchUri: 'daraz://home',
      webFallbackUrl: 'https://www.daraz.com.bd',
      category: 'productivity' as const,
      iconColor: '#FF6000',
      accentBg: 'from-orange-600/30 to-amber-600/20',
      actionName: 'Search Trending Deals',
      actionBengali: 'আজকের সেরা অফার ও ডিসকাউন্ট দেখো',
      steps: ['Launch Daraz store', 'Click Search input', 'Type: trending deals', 'Display results']
    },
    {
      name: 'Netflix (নেটফ্লিক্স)',
      bengaliName: 'নেটফ্লিক্স',
      packageName: 'com.netflix.ninja',
      launchUri: 'netflix://home',
      webFallbackUrl: 'https://www.netflix.com',
      category: 'video' as const,
      iconColor: '#E50914',
      accentBg: 'from-red-600/30 to-rose-600/20',
      actionName: 'Continue Watching Movie',
      actionBengali: 'সর্বশেষ সিনেমা বা সিরিজ প্লে করো',
      steps: ['Launch Netflix app', 'Select primary profile', 'Resume watch history list', 'Simulate Play tap']
    },
    {
      name: 'TikTok (টিকটক)',
      bengaliName: 'টিকটক',
      packageName: 'com.zhiliaoapp.musically',
      launchUri: 'tiktok://app',
      webFallbackUrl: 'https://www.tiktok.com',
      category: 'video' as const,
      iconColor: '#25F4EE',
      accentBg: 'from-cyan-600/30 to-pink-600/20',
      actionName: 'Watch Trending Videos',
      actionBengali: 'ট্রেন্ডিং ভিডিও দেখো ও লাইক করো',
      steps: ['Launch TikTok stream', 'Navigate to For You feed', 'Simulate double-tap like on current video']
    },
    {
      name: 'Telegram (টেলিগ্রাম)',
      bengaliName: 'টেলিগ্রাম',
      packageName: 'org.telegram.messenger',
      launchUri: 'tg://openmessage',
      webFallbackUrl: 'https://web.telegram.org',
      category: 'chat' as const,
      iconColor: '#24A1DE',
      accentBg: 'from-sky-600/30 to-blue-600/20',
      actionName: 'Open Saved Messages',
      actionBengali: 'সেভড মেসেজেস ওপেন করো',
      steps: ['Launch Telegram', 'Focus Saved Messages chat', 'Prepare voice note or attachment']
    }
  ];

  const handleApplyPreset = (preset: typeof quickPresets[0]) => {
    setNewAppName(preset.name);
    setNewAppBengali(preset.bengaliName);
    setNewPackageName(preset.packageName);
    setNewLaunchUri(preset.launchUri);
    setNewWebFallback(preset.webFallbackUrl);
    setNewCategory(preset.category);
    setNewActionName(preset.actionName);
    setNewActionBengali(preset.actionBengali);
    setNewActionSteps(preset.steps.join('\n'));
  };

  const handleSaveCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newPackageName.trim()) {
      alert('অ্যাপের নাম ও প্যাকেজ আইডি প্রদান করুন।');
      return;
    }

    const steps = newActionSteps
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newApp: AppDefinition = {
      id: newAppName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36),
      name: newAppName.trim(),
      bengaliName: newAppBengali.trim() || newAppName.trim(),
      packageName: newPackageName.trim(),
      launchUri: newLaunchUri.trim() || `${newAppName.toLowerCase().replace(/\s+/g, '')}://open`,
      webFallbackUrl: newWebFallback.trim() || 'https://google.com/search?q=' + encodeURIComponent(newAppName),
      category: newCategory,
      iconColor: '#FF2E93',
      accentBg: 'from-pink-600/30 to-purple-600/20',
      actions: [
        {
          id: 'custom_action_' + Date.now(),
          name: newActionName.trim() || 'Open and Execute Routine',
          bengaliName: newActionBengali.trim() || 'অ্যাপ ওপেন করে কাজ করো',
          description: `সিস্টেমে সরাসরি যুক্ত হয়ে ${newAppBengali || newAppName} কন্ট্রোল করার রুটিন`,
          requiresInput: false,
          steps: steps.length > 0 ? steps : ['Launch application package', 'Focus active interface', 'Execute command']
        }
      ]
    };

    registerCustomApp(newApp);
    speakText(`সোনা! "${newApp.bengaliName}" অ্যাপটি সফলভাবে সিস্টেমে যুক্ত করা হয়েছে। এখন তুমি ভয়েস দিয়ে বা সরাসরি ঢুকে কন্ট্রোল করতে পারবে! ❤️`, 'caring');
    addActivityLog({
      title: 'Custom App Registered',
      details: `Added "${newApp.name}" (${newApp.packageName}) with automated deep actions`,
      type: 'automation',
      service: 'AppBridge',
      status: 'SUCCESS'
    });

    // Reset Form
    setNewAppName('');
    setNewAppBengali('');
    setNewPackageName('');
    setNewLaunchUri('');
    setNewWebFallback('');
    setNewActionName('');
    setNewActionBengali('');
    setShowAddModal(false);
  };

  const handleEnterApp = (app: AppDefinition) => {
    speakText(`বাবু, ${app.bengaliName} অ্যাপে ঢুকছি এবং কন্ট্রোল হ্যান্ডওভার করছি... ❤️`, 'caring');
    addActivityLog({
      title: `Launched ${app.name}`,
      details: `Dispatched native intent ${app.launchUri} / ${app.packageName}`,
      type: 'action',
      service: 'ScreenControl',
      status: 'SUCCESS'
    });

    try {
      AppInventoryService.launchAppSafely(app);
    } catch {
      if (app.webFallbackUrl) window.open(app.webFallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRunAutomation = (app: AppDefinition, action: InAppAction) => {
    speakText(`বাবু, ${app.bengaliName}-এ "${action.bengaliName}" কাজ শুরু করছি। দেখো আমি ধাপে ধাপে কাজ করছি!`, 'romantic');
    setActiveRunningAction({
      appName: app.bengaliName,
      actionName: action.bengaliName,
      stepIndex: 0,
      steps: action.steps,
      isDone: false
    });

    // Simulate animated step-by-step native accessibility execution
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < action.steps.length) {
        setActiveRunningAction(prev => prev ? { ...prev, stepIndex: currentStep } : null);
      } else {
        clearInterval(interval);
        setActiveRunningAction(prev => prev ? { ...prev, stepIndex: currentStep, isDone: true } : null);
        speakText(`সোনা! ${app.bengaliName}-এর "${action.bengaliName}" কাজ সম্পূর্ণ হয়েছে! ❤️`, 'caring');
        addActivityLog({
          title: `Executed ${action.name}`,
          details: `Completed in-app action on ${app.name} (${action.steps.length} steps simulated)`,
          type: 'automation',
          service: 'AccessibilityAutomation',
          status: 'SUCCESS'
        });
        setTimeout(() => {
          setActiveRunningAction(null);
        }, 3000);
      }
    }, 1200);
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCommand.trim()) return;

    if (!screenControlEnabled) {
      setScreenControlEnabled(true);
    }

    const success = executeScreenCommand(testCommand);
    if (success) {
      setCommandFeedback(`কমান্ড সফলভাবে শনাক্ত ও সম্পাদন করা হয়েছে: "${testCommand}"`);
    } else {
      setCommandFeedback(`কমান্ড প্রক্রিয়া করা হয়েছে। অ্যাপ খুঁজে না পেলে কাস্টম অ্যাপ হিসেবে যোগ করুন।`);
    }
    setTimeout(() => setCommandFeedback(null), 4000);
  };

  const filteredApps = availableApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.bengaliName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="rounded-3xl glass-card-pink border border-pink-500/35 p-5 relative overflow-hidden shadow-[0_0_30px_rgba(255,46,147,0.2)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>ফোনে থাকা সমস্ত অ্যাপ কন্ট্রোল হাব</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    LIVE BRIDGE
                  </span>
                </h2>
                <p className="text-xs text-pink-300 font-medium">Native App Inventory & Deep In-App Automations</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              সারা আপনার ফোনের যেকোনো অ্যাপে সরাসরি ঢুকতে পারে এবং আপনি মুখে যা বলবেন ভেতরে গিয়ে সেই কাজ সম্পন্ন করতে পারে। ফোনে থাকা সমস্ত অ্যাপ কাস্টম অ্যাপ হিসেবে যুক্ত করতে নিচের বাটনে চাপ দিন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,147,0.4)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ কাস্টম অ্যাপ যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Live System Specs Chips */}
        <div className="mt-4 pt-3 border-t border-pink-500/20 flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Accessibility Service: <strong className="text-emerald-400">অনুমোদিত</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>মোট কানেক্টেড অ্যাপস: <strong className="text-pink-400">{availableApps.length} টি</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>ইন-অ্যাপ এআই অটোমেশন: <strong className="text-emerald-400">ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* Voice Command Bar Simulator */}
      <div className="p-4 rounded-3xl glass-card border border-pink-500/20 bg-slate-950/60 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-bold text-slate-200">সরাসরি অ্যাপ কন্ট্রোল ভয়েস কমান্ড টেস্ট</h3>
          </div>
          <span className="text-[10px] text-slate-400">মুখে বলুন বা টাইপ করুন</span>
        </div>

        <form onSubmit={handleExecuteCommand} className="flex gap-2">
          <input
            type="text"
            value={testCommand}
            onChange={(e) => setTestCommand(e.target.value)}
            placeholder="যেমন: ইনস্টাগ্রামে রিলস দেখো ও কমেন্ট করো, ফেসবুকে স্ট্যাটাস দাও, ইউটিউবে গান চালাও..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>কমান্ড চালান</span>
          </button>
        </form>

        {commandFeedback && (
          <div className="p-2.5 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-pink-400" />
            <span>{commandFeedback}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 self-center mr-1">দ্রুত চেষ্টা করুন:</span>
          {[
            'ইনস্টাগ্রাম ওপেন করে রিলসে মিষ্টি কমেন্ট করো',
            'ইউটিউবে রোমান্টিক গান চালাও',
            'ফেসবুকে স্ট্যাটাস পোস্ট করো',
            'হোয়াটসঅ্যাপে সোনাকে মেসেজ পাঠাও',
            'ক্যামেরা খুলে মিষ্টি সেলফি তোলো'
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTestCommand(sample);
                executeScreenCommand(sample);
              }}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-pink-950/60 border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 transition-all"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কানেক্টেড অ্যাপ খুঁজুন (নাম, বাংলা নাম বা প্যাকেজ আইডি)..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-pink-400" />
          <span>কাস্টম অ্যাপ</span>
        </button>
      </div>

      {/* List of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredApps.map((app) => {
          const isCustom = app.id.includes('_') || !['instagram', 'youtube', 'facebook', 'whatsapp', 'phone', 'camera', 'messenger', 'chrome', 'spotify', 'notes'].includes(app.id);

          return (
            <div
              key={app.id}
              className="p-4 rounded-3xl glass-card border border-pink-500/20 hover:border-pink-500/40 bg-gradient-to-br from-slate-950/90 to-[#0e0720]/80 space-y-3 transition-all shadow-md group relative overflow-hidden"
            >
              {/* App Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0"
                    style={{ backgroundColor: app.iconColor || '#FF2E93' }}
                  >
                    {app.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{app.name}</h4>
                      <span className="text-xs text-pink-400 font-medium font-bengali">({app.bengaliName})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">{app.packageName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCustom ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                      কাস্টম অ্যাপ
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                      সিস্টেম অ্যাপ
                    </span>
                  )}
                  {isCustom && (
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${app.name}" অ্যাপটি সিস্টেম থেকে মুছে ফেলতে চান?`)) {
                          removeCustomApp(app.id);
                          speakText(`"${app.bengaliName}" অ্যাপটি সিস্টেম থেকে মুছে ফেলা হয়েছে।`, 'caring');
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* In-App Actions Available */}
              <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>ইন-অ্যাপ অটোমেশন রুটিন ({app.actions.length} টি):</span>
                  <span className="text-cyan-400 text-[10px]">অ্যাক্সেসিবিলিটি কন্ট্রোল</span>
                </div>

                <div className="space-y-1.5">
                  {app.actions.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-pink-500/30 transition-all text-xs"
                    >
                      <div className="truncate">
                        <span className="text-slate-200 font-medium">{act.bengaliName}</span>
                        <p className="text-[10px] text-slate-400 truncate">{act.steps.length} টি ধাপ স্বয়ংক্রিয়ভাবে চলবে</p>
                      </div>

                      <button
                        onClick={() => handleRunAutomation(app, act)}
                        className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        <span>চালান</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct App Launch and Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleEnterApp(app)}
                  className="flex-1 py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all mr-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>সরাসরি অ্যাপে ঢুকুন (Launch)</span>
                </button>

                <button
                  onClick={() => {
                    speakText(`বাবু, ${app.bengaliName} অ্যাপের জন্য ভয়েস কমান্ড সক্রিয় আছে। যেমন: "${app.bengaliName} ওপেন করো" বললে আমি সাথে সাথে ওপেন করব। ❤️`, 'caring');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1"
                  title="ভয়েস টেস্ট"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>ভয়েস টেস্ট</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl glass-card-pink border border-pink-500/40 p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">নতুন কাস্টম ফোন অ্যাপ যুক্ত করুন</h3>
                  <p className="text-[11px] text-pink-300">ফোনে থাকা যেকোনো অ্যাপের ভেতরে ঢুকে কন্ট্রোল করার সিস্টেম</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets Selection */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">দ্রুত নির্বাচন করুন (জনপ্রিয় অ্যাপস):</span>
              <div className="flex flex-wrap gap-2">
                {quickPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-pink-900/40 border border-slate-700 hover:border-pink-500/50 text-slate-200 flex items-center gap-1 transition-all"
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveCustomApp} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold">অ্যাপের নাম (English) *</label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="e.g. bKash, Netflix, TikTok"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold">বাংলা নাম (উচ্চারণ)</label>
                  <input
                    type="text"
                    value={newAppBengali}
                    onChange={(e) => setNewAppBengali(e.target.value)}
                    placeholder="যেমন: বিকাশ, নেটফ্লিক্স, টিকটক"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold">অ্যান্ড্রয়েড প্যাকেজ নেম *</label>
                  <input
                    type="text"
                    required
                    value={newPackageName}
                    onChange={(e) => setNewPackageName(e.target.value)}
                    placeholder="e.g. com.bKash.customerapp"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold">লঞ্চ URI স্কিম / ডিপ লিংক</label>
                  <input
                    type="text"
                    value={newLaunchUri}
                    onChange={(e) => setNewLaunchUri(e.target.value)}
                    placeholder="e.g. bkash://app অথবা netflix://"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold">ক্যাটাগরি</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="productivity">Productivity & Finance (বিকাশ, নগদ, ক্যালকুলেটর)</option>
                  <option value="social">Social Media (ফেসবুক, টুইটার, ইনস্টাগ্রাম)</option>
                  <option value="video">Video & Entertainment (ইউটিউব, নেটফ্লিক্স, টিকটক)</option>
                  <option value="chat">Chat & Messaging (হোয়াটসঅ্যাপ, টেলিগ্রাম, মেসেঞ্জার)</option>
                  <option value="camera">Camera & Photos</option>
                  <option value="system">System Utilities</option>
                </select>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-pink-300 font-bold">ইন-অ্যাপ অটোমেশন অ্যাকশন ও স্টেপস</label>
                  <span className="text-[10px] text-slate-400">অ্যাপের ভেতরে সারা যা করবে</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    placeholder="Action Name (e.g. Check Balance)"
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    value={newActionBengali}
                    onChange={(e) => setNewActionBengali(e.target.value)}
                    placeholder="বাংলা নাম (যেমন: ব্যালেন্স চেক করো)"
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <textarea
                  rows={3}
                  value={newActionSteps}
                  onChange={(e) => setNewActionSteps(e.target.value)}
                  placeholder="ধাপগুলো প্রতি লাইনে লিখুন:&#10;ধাপ ১: ওপেন করো&#10;ধাপ ২: অমুক বাটনে চাপ দাও&#10;ধাপ ৩: কাজ সম্পন্ন করো"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>সিস্টেমে অ্যাপ যুক্ত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Animated Step-by-Step Native Execution Modal */}
      {activeRunningAction && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-card-pink border border-pink-500/50 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                <Bot className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeRunningAction.appName} অ্যাপে কাজ চলছে</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-xs text-pink-300">{activeRunningAction.actionName}</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              {activeRunningAction.steps.map((step, idx) => {
                const isPassed = idx < activeRunningAction.stepIndex;
                const isCurrent = idx === activeRunningAction.stepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-pink-950/80 border border-pink-500/40 text-pink-200 font-bold scale-[1.02]'
                        : isPassed
                        ? 'text-emerald-400 opacity-90'
                        : 'text-slate-500'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-pink-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>

            {activeRunningAction.isDone && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>অ্যাকশন সফলভাবে সম্পন্ন হয়েছে!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
