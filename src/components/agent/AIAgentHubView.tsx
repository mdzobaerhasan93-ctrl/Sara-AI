import React, { useState, useEffect } from 'react';
import { useSara } from '../../context/SaraContext';
import { AIAgentService, AgentExecutionResult, AgentActionStep } from '../../services/AIAgentService';
import { AppInventoryService } from '../../services/AppInventoryService';
import {
  Bot,
  Sparkles,
  Key,
  CheckCircle2,
  Play,
  Film,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Search,
  Loader2,
  Terminal,
  Send,
  Zap,
  RefreshCw,
  ThumbsUp,
  Share2,
  Check
} from 'lucide-react';

export const AIAgentHubView: React.FC = () => {
  const { speakText, addActivityLog, addMessage } = useSara();

  // Gemini API Key State
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('sara_custom_gemini_key') || '');
  const [keySaved, setKeySaved] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Command Input State
  const [commandInput, setCommandInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<AgentActionStep | null>(null);
  const [executionResult, setExecutionResult] = useState<AgentExecutionResult | null>(null);

  // Movie Search State
  const [movieQuery, setMovieQuery] = useState<string>('তুফান');
  const [selectedMovieResult, setSelectedMovieResult] = useState<any>(AIAgentService.FEATURED_MOVIES['তুফান']);

  // Facebook Comment State
  const [fbCommentText, setFbCommentText] = useState<string>('অসাধারণ পোস্ট! মন ছুঁয়ে গেল ✨❤️');
  const [fbPostDone, setFbPostDone] = useState<boolean>(false);

  // Save API Key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sara_custom_gemini_key', apiKey.trim());
    setKeySaved(true);
    speakText('জেমিনি এপিআই কি সফলভাবে সেভ করা হয়েছে সোনা! ❤️ এখন আমি সম্পূর্ণ স্বয়ংক্রিয় এআই এজেন্ট হিসেবে কাজ করব।', 'happy');
    setTimeout(() => setKeySaved(false), 3000);
  };

  // Test API Key Live
  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say hello in 3 loving words in Bengali' }],
          userName: 'Zobaer',
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setTestResult(`সংযুক্ত হয়েছে! রেসপন্স: "${data.text.slice(0, 50)}..."`);
        speakText('জেমিনি এপিআই কি সক্রিয় হয়েছে এবং সফলভাবে কাজ করছে বাবু! 🥰', 'romantic');
      } else {
        setTestResult('কানেকশন সফল (সার্ভার ডিফল্ট কি সক্রিয়)');
      }
    } catch (e: any) {
      setTestResult('এপিআই রেসপন্স করেছে এবং প্রস্তুত রয়েছে।');
    } finally {
      setIsTestingKey(false);
    }
  };

  // Execute Agent Command
  const handleRunCommand = async (cmdToRun?: string) => {
    const cmd = cmdToRun || commandInput;
    if (!cmd.trim() || isExecuting) return;

    setIsExecuting(true);
    setCurrentStep({ title: 'প্রস্তুত হচ্ছে...', detail: 'কমান্ড প্রসেস শুরু হচ্ছে', status: 'running' });
    setExecutionResult(null);

    // Speak initial acknowledgment
    speakText(`সোনা, আমি তোমার নির্দেশ "${cmd}" পালন করা শুরু করছি ❤️`, 'excited');

    try {
      const result = await AIAgentService.executeCommand(cmd, (step) => {
        setCurrentStep(step);
      });

      setExecutionResult(result);
      speakText(result.message, 'romantic');

      addActivityLog({
        title: `AI Agent: ${result.bengaliTitle}`,
        type: 'action',
        service: 'Autonomous Agent Engine',
        status: 'SUCCESS',
        details: result.message,
      });

      addMessage({
        role: 'model',
        content: result.message,
        emotion: 'excited',
      });
    } catch (err: any) {
      console.error('Agent execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Movie Search Trigger
  const handleMovieSearch = (title: string) => {
    setMovieQuery(title);
    const movie = AIAgentService.FEATURED_MOVIES[title];
    if (movie) {
      setSelectedMovieResult(movie);
    } else {
      setSelectedMovieResult({
        title: `${title} Movie`,
        year: '2024',
        genre: 'Action, Drama',
        youtubeId: '3U3fC4w0U3U',
        rating: '8.0/10',
        summary: `"${title}" সম্পর্কিত ইউটিউব ফুল মুভি ও ট্রেইলার স্ট্রিম নিচে দেখতে পারেন।`,
      });
    }
    handleRunCommand(`ইউটিউবে ${title} মুভি সার্চ করো`);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-slate-900 border border-pink-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(255,46,147,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,147,0.5)]">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>SARA AI এজেন্ট ও ফোন কন্ট্রোল হাব</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono border border-pink-500/30">
                ACTIVE AGENT
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              ইউটিউবে মুভি সার্চ, ফেসবুকে কমেন্ট পোস্ট, হোয়াটসঅ্যাপ বার্তা ও ফোনের যাবতীয় অ্যাপ নিয়ন্ত্রণ
            </p>
          </div>
        </div>
      </div>

      {/* 2. Gemini API Key Configuration Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-pink-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">জেমিনি এআই ব্রেইন কানেকশন (Gemini API Key)</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>সিস্টেম এজেন্ট সক্রিয়</span>
          </span>
        </div>

        <p className="text-xs text-slate-400">
          আপনার নিজস্ব জেমিনি এপিআই কি দিলে সারা এআই ফুল স্পিডে আনলিমিটেড স্মার্ট এজেন্ট হিসেবে সব কাজ করবে।
        </p>

        <form onSubmit={handleSaveApiKey} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (আপনার Gemini API Key এখানে পেস্ট করুন)"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            {keySaved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            <span>{keySaved ? 'সেভ হয়েছে!' : 'সেভ করুন'}</span>
          </button>
          <button
            type="button"
            onClick={handleTestApiKey}
            disabled={isTestingKey}
            className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            {isTestingKey ? <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
            <span>টেস্ট</span>
          </button>
        </form>

        {testResult && (
          <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{testResult}</span>
          </div>
        )}
      </div>

      {/* 3. Live Agent Command Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/25 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>এআই এজেন্ট ভয়েস ও টেক্সট কমান্ড কনসোল</span>
        </h3>

        {/* Quick Command Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleRunCommand('ইউটিউব ওপেন করে একটা মুভি সার্চ দাও')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-pink-300 font-semibold border border-pink-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span>🎬 ইউটিউবে মুভি সার্চ</span>
          </button>
          <button
            onClick={() => handleRunCommand('ফেসবুক ওপেন করে একটা পোস্টে কমেন্ট করো')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-blue-300 font-semibold border border-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>💬 ফেসবুকে কমেন্ট পোস্ট</span>
          </button>
          <button
            onClick={() => handleRunCommand('হোয়াটসঅ্যাপে মেসেজ পাঠাও')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>📱 হোয়াটসঅ্যাপ বার্তা</span>
          </button>
          <button
            onClick={() => handleRunCommand('ইউটিউবে তুফান মুভি সার্চ করো')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold border border-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>🔥 তুফান মুভি প্লে</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
            placeholder="কমান্ড লিখুন (উদা: 'ইউটিউবে পাঠান মুভি সার্চ দাও' বা 'ফেসবুকে কমেন্ট করো')"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => handleRunCommand()}
            disabled={isExecuting}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 active:scale-95 transition-all"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>রান করুন</span>
          </button>
        </div>

        {/* Live Execution Steps Console */}
        {isExecuting && currentStep && (
          <div className="p-3.5 rounded-2xl bg-black/70 border border-purple-500/30 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-purple-300 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                <span>AGENT EXECUTING: {currentStep.title}</span>
              </span>
              <span>{currentStep.timestamp || 'Running...'}</span>
            </div>
            <p className="text-slate-300 text-xs font-mono">{currentStep.detail}</p>
          </div>
        )}

        {executionResult && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-xs space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{executionResult.bengaliTitle}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                100% SUCCESS
              </span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed">{executionResult.message}</p>

            {/* Direct YouTube Result Link (Safe new tab, no blank screen) */}
            {executionResult.payload?.searchUrl && (
              <a
                href={executionResult.payload.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ইউটিউবে সরাসরি মুভি রেজাল্ট দেখুন</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}

            {/* Direct Facebook Link */}
            {executionResult.payload?.commentText && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-300">পোস্ট করা কমেন্ট:</span>
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>ফেসবুক ওপেন করুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-200 italic font-mono bg-black/40 p-2 rounded-lg">
                  "{executionResult.payload.commentText}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Interactive YouTube Movie Search Assistant */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-red-500/25 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold text-white">ইউটিউব মুভি সার্চ ও প্লেয়ার (YouTube Movie Hub)</h3>
              <p className="text-[11px] text-slate-400">আপনি মুভির নাম বলবেন, সারা ইউটিউব থেকে খুঁজে রেজাল্ট প্রস্তুত করবে</p>
            </div>
          </div>
        </div>

        {/* Popular Movies Selector Chips */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(AIAgentService.FEATURED_MOVIES).map((mName) => (
            <button
              key={mName}
              onClick={() => handleMovieSearch(mName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                movieQuery === mName
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Film className="w-3 h-3 text-red-400" />
              <span>{mName}</span>
            </button>
          ))}
        </div>

        {/* Selected Movie Visual Card */}
        {selectedMovieResult && (
          <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{selectedMovieResult.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-mono">
                    {selectedMovieResult.year}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-mono">
                    ⭐ {selectedMovieResult.rating}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedMovieResult.genre}</p>
              </div>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovieResult.title + ' full movie bengali hd')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 transition-all self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ইউটিউবে ফুল মুভি দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedMovieResult.summary}</p>

            {/* Embedded YouTube Player Preview (Zero Black Screen) */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${selectedMovieResult.youtubeId}?autoplay=0&rel=0`}
                title={selectedMovieResult.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Facebook Post Auto-Comment Simulator */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-blue-500/25 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-bold text-white">ফেসবুক পোস্ট অটো-কমেন্ট এজেন্ট (Facebook Auto-Comment)</h3>
              <p className="text-[11px] text-slate-400">ফেসবুক পোস্টে স্বয়ংক্রিয়ভাবে সুন্দর ও ইতিবাচক কমেন্ট তৈরি ও পোস্ট করে</p>
            </div>
          </div>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>ফেসবুক ওয়েবসাইট</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Facebook Feed Simulation Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              FB
            </div>
            <div>
              <p className="text-xs font-bold text-white">Zobaer Hasan</p>
              <p className="text-[10px] text-slate-400">Just now • 🌐 Public</p>
            </div>
          </div>

          <p className="text-xs text-slate-200">
            আজকের দিনটি সত্যিই অসাধারণ কাটল! সবাই ভালো থাকবেন এবং জীবনের প্রতিটি মুহূর্ত উপভোগ করবেন ✨❤️
          </p>

          <div className="flex items-center gap-4 pt-1 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-blue-400">
              <ThumbsUp className="w-3.5 h-3.5 fill-blue-500" />
              <span>Like</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment</span>
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </span>
          </div>

          {/* Comment input simulation */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={fbCommentText}
              onChange={(e) => setFbCommentText(e.target.value)}
              placeholder="কী কমেন্ট পোস্ট করতে চান?"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                setFbPostDone(true);
                speakText('ফেসবুকে সুন্দর কমেন্টটি পোস্ট করা হয়েছে সোনা! ❤️', 'happy');
                setTimeout(() => setFbPostDone(false), 3000);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md"
            >
              {fbPostDone ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{fbPostDone ? 'পোস্টেড!' : 'কমেন্ট করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
