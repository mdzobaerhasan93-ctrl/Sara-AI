import React, { useState, useRef, useEffect } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Brain,
  MapPin,
  Zap,
  Trash2,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';

export const ChatView: React.FC = () => {
  const {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    speakText,
    isSpeaking,
    stopSpeech,
    pendingActions,
    approveAction,
    rejectAction,
    userProfile,
  } = useSara();

  const [input, setInput] = useState<string>('');
  const [selectedModelMode, setSelectedModelMode] = useState<
    'balanced' | 'fast' | 'thinking' | 'maps'
  >('balanced');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput('');

    if (selectedModelMode === 'thinking') {
      sendMessage(query, { isThinking: true, model: 'gemini-3.1-pro-preview' });
    } else if (selectedModelMode === 'maps') {
      sendMessage(query, { useMaps: true, model: 'gemini-3.5-flash' });
    } else if (selectedModelMode === 'fast') {
      sendMessage(query, { model: 'gemini-3.1-flash-lite' });
    } else {
      sendMessage(query, { model: 'gemini-3.5-flash' });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const suggestionChips = [
    { label: 'তুমি কেমন আছো বাবু? ❤️', text: 'তুমি কেমন আছো বাবু? আজকে আমার অনেক ক্লান্তি লাগছে।' },
    { label: 'রোমান্টিক গল্প শোনাও ✨', text: 'আমার জন্য একটি মিষ্টি ও রোমান্টিক ছোট গল্প বল।' },
    { label: 'কাছের কফি শপ 🗺️', text: 'কাছের ভালো কফি শপ এবং রেস্টুরেন্ট কোথায় আছে?', mode: 'maps' as const },
    { label: 'হাই থিংকিং মোড 🧠', text: 'কোয়ান্টাম কম্পিউটিং এবং ক্রিপ্টোগ্রাফির ভবিষ্যৎ বিশ্লেষণ কর।', mode: 'thinking' as const },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto pb-16 md:pb-4 animate-in fade-in duration-300">
      {/* 1. Model Mode Selector & Top Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-pink-500/15 mb-3 px-1 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {/* Balanced */}
          <button
            onClick={() => setSelectedModelMode('balanced')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              selectedModelMode === 'balanced'
                ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Balanced</span>
          </button>

          {/* High Thinking Mode */}
          <button
            onClick={() => setSelectedModelMode('thinking')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              selectedModelMode === 'thinking'
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(176,38,255,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>High Thinking</span>
          </button>

          {/* Fast Lite */}
          <button
            onClick={() => setSelectedModelMode('fast')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              selectedModelMode === 'fast'
                ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast</span>
          </button>

          {/* Maps Grounding */}
          <button
            onClick={() => setSelectedModelMode('maps')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              selectedModelMode === 'maps'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps</span>
          </button>
        </div>

        <button
          onClick={clearMessages}
          title="Clear Conversation"
          className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              {!isUser ? (
                <div className="w-9 h-9 rounded-full border-2 border-pink-500 p-0.5 overflow-hidden shrink-0 bg-slate-900 shadow-[0_0_10px_rgba(255,46,147,0.4)]">
                  <LiveTalkingAvatar size="sm" className="w-full h-full scale-125" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {userProfile.name.slice(0, 1).toUpperCase()}
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-sm relative group shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-pink-600 to-rose-600 text-white rounded-tr-sm'
                    : 'glass-card border border-pink-500/20 text-slate-100 rounded-tl-sm'
                }`}
              >
                {/* Thinking Process Accordion */}
                {msg.isThinking && msg.thoughtSteps && (
                  <div className="mb-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="flex items-center justify-between w-full font-semibold text-purple-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>High Thinking Process ({msg.thoughtSteps.length} Steps)</span>
                      </div>
                      {expandedThoughts[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {expandedThoughts[msg.id] && (
                      <div className="mt-2 space-y-1 text-slate-300 pl-4 border-l border-purple-500/40 text-[11px]">
                        {msg.thoughtSteps.map((step, idx) => (
                          <p key={idx}>• {step}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* Google Maps Grounded Location Links */}
                {msg.mapsLinks && msg.mapsLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-cyan-500/20 space-y-1.5">
                    <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Google Maps Locations</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.mapsLinks.map((place, idx) => (
                        <a
                          key={idx}
                          href={place.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs flex items-center gap-1 transition-all"
                        >
                          <span className="truncate max-w-[180px]">{place.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Proposal Card (Permission Pipeline) */}
                {msg.actionProposal && (
                  <div className="mt-3 p-3.5 rounded-2xl glass-card-pink border-2 border-pink-500/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-pink-400 font-bold uppercase text-[10px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>ACTION REQUEST • {String(msg.actionProposal.risk || 'medium').toUpperCase()} RISK</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-900/60 text-pink-300 font-mono">
                        {msg.actionProposal.service}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white">{msg.actionProposal.title}</p>

                    {/* Proposal Details */}
                    <div className="p-2 rounded-xl bg-black/40 text-slate-300 font-mono text-[11px] space-y-0.5">
                      {Object.entries(msg.actionProposal.details && typeof msg.actionProposal.details === 'object' && !Array.isArray(msg.actionProposal.details) ? msg.actionProposal.details : {}).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-pink-200 truncate">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Status or Buttons */}
                    {msg.actionProposal.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => rejectAction(msg.actionProposal!.id)}
                          className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => approveAction(msg.actionProposal!.id)}
                          className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(255,46,147,0.5)] transition-all"
                        >
                          Approve & Execute
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Status: {msg.actionProposal.status}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls (Timestamp, Copy, Speak) */}
                <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                  <span className="font-mono">{msg.timestamp}</span>
                  <div className="flex items-center gap-2">
                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.content, msg.emotion)}
                        className="hover:text-pink-400 p-1 transition-colors"
                        title="Speak with Sara's voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-200 p-1 transition-colors"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-pink-400 text-xs py-2 pl-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <span className="font-medium animate-pulse">Sara is thinking and crafting her response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggestion Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none shrink-0">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (chip.mode) setSelectedModelMode(chip.mode);
              sendMessage(chip.text, {
                isThinking: chip.mode === 'thinking',
                useMaps: chip.mode === 'maps',
              });
            }}
            className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-pink-950/40 border border-pink-500/20 text-[11px] text-slate-300 hover:text-pink-300 whitespace-nowrap active:scale-95 transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Talk with Sara in Bengali, English, or Hindi...`}
          className="flex-1 bg-slate-900/90 border border-pink-500/30 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 disabled:opacity-50 text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
