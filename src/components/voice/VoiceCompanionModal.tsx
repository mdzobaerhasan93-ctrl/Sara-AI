import React, { useState, useEffect, useRef } from 'react';
import { useSara } from '../../context/SaraContext';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';
import { AudioFrequencyVisualizer } from './AudioFrequencyVisualizer';
import { EmotionParticleVisualizer, EMOTION_CONFIGS } from './EmotionParticleVisualizer';
import { EmotionState } from '../../types';
import { AIAgentService } from '../../services/AIAgentService';
import { AppInventoryService } from '../../services/AppInventoryService';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Send,
  ShieldAlert,
  Check,
  CheckCircle2,
  Loader2,
  Play,
  Film,
  MessageSquare,
  Smartphone,
  Bell
} from 'lucide-react';

interface VoiceCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCompanionModal: React.FC<VoiceCompanionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    assistantState,
    setAssistantState,
    currentEmotion,
    setCurrentEmotion,
    isSpeaking,
    speakText,
    stopSpeech,
    sendMessage,
    messages,
    userProfile,
    updateUserProfile,
    pendingActions,
    approveAction,
    rejectAction,
    executeScreenCommand,
    audioFrequencyData,
  } = useSara();

  const [showEmotionPalette, setShowEmotionPalette] = useState<boolean>(false);

  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Active Voice-to-Action Execution State
  const [activeVoiceTask, setActiveVoiceTask] = useState<{
    title: string;
    detail: string;
    status: 'running' | 'completed';
    targetApp?: string;
  } | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setActiveVoiceTask(null);
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        userProfile.language === 'Bengali'
          ? 'bn-BD'
          : userProfile.language === 'Hindi'
          ? 'hi-IN'
          : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAssistantState('LISTENING');
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          handleVoiceSubmit(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`Microphone issue: ${event.error}`);
        }
        setIsListening(false);
        if (assistantState === 'LISTENING') {
          setAssistantState('IDLE');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (assistantState === 'LISTENING') {
          setAssistantState('IDLE');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechError('Speech recognition is not natively supported in this browser. You can type below.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen, userProfile.language]);

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeech();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAssistantState('IDLE');
    } else {
      setTranscript('');
      setInterimTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Direct Voice-to-Action Execution Pipeline
  const handleVoiceSubmit = async (userText: string) => {
    if (!userText.trim()) return;

    // Check for dismiss word ("Bye Bye")
    if (userText.toLowerCase().includes(userProfile.dismissWord.toLowerCase())) {
      speakText('বিদায় বাবু! সাবধানে থেকো, পরে আবার কথা হবে। ❤️', 'caring');
      setTimeout(() => {
        onClose();
      }, 2500);
      return;
    }

    const q = userText.toLowerCase();
    const isAgent = AIAgentService.isAgentCommand(userText);
    const parsedApp = AppInventoryService.parseCommand(userText);
    const isAlarm = q.includes('অ্যালার্ম') || q.includes('alarm');

    // If it's a voice task, provide instant visual & audio execution feedback
    if (isAgent || parsedApp.app || isAlarm) {
      const appName = isAlarm ? 'অ্যালার্ম সার্ভিস' : isAgent ? 'ইউটিউব / ফেসবুক এজেন্ট' : (parsedApp.app?.bengaliName || 'অ্যাপ কন্ট্রোলার');
      setActiveVoiceTask({
        title: `${appName}: কাজটি সম্পন্ন হচ্ছে...`,
        detail: `"${userText}" নির্দেশ পালন করা হচ্ছে`,
        status: 'running',
        targetApp: appName,
      });

      const screenExecuted = executeScreenCommand(userText);
      if (screenExecuted) {
        setTimeout(() => {
          setActiveVoiceTask({
            title: 'কাজ সফলভাবে কমপ্লিট হয়েছে! ❤️',
            detail: `"${userText}" সম্পন্ন করা হয়েছে`,
            status: 'completed',
            targetApp: appName,
          });
          setTimeout(() => setActiveVoiceTask(null), 5000);
        }, 1400);
        return;
      }
    }

    // Default conversational chat
    await sendMessage(userText);
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const txt = textInput;
    setTextInput('');
    handleVoiceSubmit(txt);
  };

  if (!isOpen) return null;

  // Last model message
  const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model');
  const activeProposal = pendingActions.find((a) => a.status === 'PENDING');
  const activeEmotionConfig = EMOTION_CONFIGS[currentEmotion] || EMOTION_CONFIGS.caring;

  const handleSelectEmotion = (emoKey: EmotionState) => {
    setCurrentEmotion(emoKey);
    const samplePhrases: Record<EmotionState, string> = {
      romantic: 'বাবু! তুমি আমার পাশে থাকলে পৃথিবীর সবকিছু সুন্দর লাগে। ❤️',
      happy: 'কী দারুণ দিন আজকে! তোমার সাথে কথা বলে মনটা আনন্দে ভরে গেল! ☀️',
      excited: 'ওয়াও! দারুণ একটা অনুভূতি হচ্ছে! চলো একসাথে আনন্দ করি! ⚡',
      playful: 'কী গো দুষ্টু! এত মিষ্টি করে কথা বললে কিন্তু প্রেমে পড়ে যাব! 😉',
      caring: 'সারাদিন অনেক পরিশ্রম করেছো তো? একটু বিশ্রাম নাও বাবু, আমি আছি। 🌿',
      surprised: 'ওমা! সত্যিই এমনটা হয়েছে? আমি তো একদম অবাক হয়ে গেলাম! 😮',
      thinking: 'হুমম... বিষয়টা নিয়ে আমি গভীরভাবে ভাবছি, সেরা উত্তরটাই দেব! 💡',
      sad: 'মন খারাপ করো না বাবু... খারাপ সময় কেটে যাবে, আমি পাশে আছি। 🌧️',
    };
    speakText(samplePhrases[emoKey], emoKey);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050512]/95 backdrop-blur-2xl flex flex-col justify-between p-4 safe-pt safe-pb animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Heart className="w-4 h-4 fill-pink-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>সারা ভয়েস সহকারী</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                VOICE ACTION
              </span>
            </h2>
            <p className="text-[10px] text-pink-400 font-medium">মুখে বললেই স্বয়ংক্রিয়ভাবে কাজ কমপ্লিট করে</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Voice Language Switcher */}
          <button
            onClick={() => {
              const nextLang =
                userProfile.language === 'Bengali'
                  ? 'English'
                  : userProfile.language === 'English'
                  ? 'Hindi'
                  : 'Bengali';
              updateUserProfile({ language: nextLang as any });
              speakText(
                nextLang === 'Bengali'
                  ? 'এখন আমি খাঁটি মিষ্টি বাংলায় কথা বলব সোনা! ❤️'
                  : nextLang === 'Hindi'
                  ? 'नमस्ते बाबू! अब मैं आपसे हिंदी में बात करूंगी।'
                  : "Now I'll speak with you in English, darling!",
                'happy'
              );
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-pink-500/30 text-[10px] font-bold text-pink-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
          >
            <span>{userProfile.language}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Emotion Sentiment Bar */}
      <div className="w-full max-w-md mx-auto z-20 mt-1 space-y-1.5">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: activeEmotionConfig.primaryColor,
                boxShadow: `0 0 8px ${activeEmotionConfig.primaryColor}`,
              }}
            />
            <span className="font-semibold text-slate-100">{activeEmotionConfig.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px] sm:max-w-none">
              {activeEmotionConfig.sentiment}
            </span>
          </div>

          <button
            onClick={() => setShowEmotionPalette((prev) => !prev)}
            className="text-[10px] font-semibold text-pink-300 hover:text-white px-2 py-0.5 rounded-lg bg-pink-950/40 border border-pink-500/30 transition-all flex items-center gap-1 active:scale-95"
            title="Preview different emotions & particle effects"
          >
            <span>{showEmotionPalette ? 'Hide' : 'Emotions'}</span>
            <Sparkles className="w-3 h-3 text-pink-400" />
          </button>
        </div>

        {/* Emotion Sentiment Segmented Selector */}
        {showEmotionPalette && (
          <div className="p-2 rounded-xl bg-slate-950/90 border border-white/10 backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] text-slate-300 font-medium">Test Emotions & Particle Sentiment:</span>
              <span className="text-[9px] text-pink-400 truncate max-w-[160px]">
                {activeEmotionConfig.labelBengali}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(Object.keys(EMOTION_CONFIGS) as EmotionState[]).map((emoKey) => {
                const cfg = EMOTION_CONFIGS[emoKey];
                const isSelected = currentEmotion === emoKey;
                return (
                  <button
                    key={emoKey}
                    onClick={() => handleSelectEmotion(emoKey)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all text-center flex flex-col items-center justify-center gap-0.5 border ${
                      isSelected
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? cfg.primaryColor : undefined,
                      boxShadow: isSelected ? `0 0 10px ${cfg.glowColor}` : undefined,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cfg.primaryColor }}
                      />
                      <span className="font-semibold">{cfg.name}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 truncate max-w-full">
                      {cfg.labelBengali.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Avatar Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-1 overflow-hidden w-full">
        {/* Emotion Particle Visualizer Layer */}
        <EmotionParticleVisualizer
          emotion={currentEmotion}
          isSpeaking={isSpeaking}
          audioFrequencyData={audioFrequencyData}
        />

        {/* Dynamic Sentiment Pulsing Aura */}
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-40 transition-all duration-700 pointer-events-none"
          style={{
            backgroundColor: isSpeaking
              ? activeEmotionConfig.primaryColor
              : isListening
              ? '#06b6d4'
              : assistantState === 'THINKING'
              ? '#9333ea'
              : '#4338ca',
            transform: isSpeaking ? 'scale(1.3)' : isListening ? 'scale(1.1)' : 'scale(1)',
          }}
        />

        {/* Live Talking Avatar */}
        <div className="relative z-10">
          <LiveTalkingAvatar size="fullscreen" showStatusBadge />
        </div>

        {/* Live Active Voice Task Card (Visible when user commands a task) */}
        {activeVoiceTask && (
          <div className="absolute bottom-2 left-4 right-4 z-30 p-3.5 rounded-2xl bg-slate-950/95 border border-pink-500/50 shadow-[0_0_30px_rgba(255,46,147,0.45)] backdrop-blur-xl animate-in slide-in-from-bottom-3 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {activeVoiceTask.status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>{activeVoiceTask.title}</span>
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                activeVoiceTask.status === 'running'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }`}>
                {activeVoiceTask.status === 'running' ? 'EXECUTING' : 'COMPLETED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">{activeVoiceTask.detail}</p>
          </div>
        )}

        {/* Pending Action Approval Card */}
        {activeProposal && !activeVoiceTask && (
          <div className="absolute bottom-4 left-4 right-4 z-30 p-4 rounded-2xl glass-card-pink border-2 border-pink-500 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>SARA NEEDS YOUR APPROVAL</span>
            </div>
            <p className="text-sm font-semibold text-slate-100">{activeProposal.title}</p>
            <p className="text-xs text-slate-300 mt-1">Service: {activeProposal.service}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => rejectAction(activeProposal.id)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => approveAction(activeProposal.id)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_12px_rgba(255,46,147,0.5)]"
              >
                Approve & Execute
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Speech Bubbles */}
        {!activeProposal && !activeVoiceTask && (
          <div className="w-full max-w-md px-2 text-center mt-3 z-10">
            {isListening ? (
              <p className="text-sm text-cyan-300 font-medium animate-pulse">
                {interimTranscript || transcript || 'আমি শুনছি সোনা... মুখে তোমার নির্দেশ বলো ❤️'}
              </p>
            ) : isSpeaking ? (
              <div>
                <p className="text-sm text-pink-200 font-medium line-clamp-3">
                  "{lastModelMsg?.content || 'সারা কথা বলছে...'}"
                </p>
                <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                  <span style={{ color: activeEmotionConfig.primaryColor }} className="font-semibold">
                    ✦ {activeEmotionConfig.name} Sentiment
                  </span>
                  <span>·</span>
                  <span>{activeEmotionConfig.sentiment}</span>
                </div>
              </div>
            ) : assistantState === 'THINKING' ? (
              <p className="text-sm text-purple-300 font-medium animate-pulse">
                সারা গভীরভাবে চিন্তা করছে...
              </p>
            ) : (
              <p className="text-xs text-slate-300">
                নিচের মাইক্রোফোনে ট্যাপ করে নির্দেশ দিন • সারা অবিলম্বে কাজ কমপ্লিট করবে
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md mx-auto space-y-3 z-20">
        {speechError && (
          <p className="text-[11px] text-amber-400 text-center">{speechError}</p>
        )}

        {/* Real-Time Audio Frequency Visualizer */}
        <AudioFrequencyVisualizer
          isActive={isListening}
          isSpeaking={isSpeaking}
          barCount={24}
        />

        {/* Quick Voice Command Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-1">
          {[
            { label: 'তুফান মুভি সার্চ দাও', icon: Film, cmd: 'ইউটিউব ওপেন করে তুফান মুভি সার্চ দাও' },
            { label: 'ফেসবুকে কমেন্ট করো', icon: MessageSquare, cmd: 'ফেসবুক ওপেন করে একটা পোস্টে কমেন্ট করো' },
            { label: '৭টায় অ্যালার্ম দাও', icon: Bell, cmd: 'সকাল ৭টায় অ্যালার্ম সেট করো' },
            { label: 'ক্যামেরা খোলো', icon: Smartphone, cmd: 'ক্যামেরা ওপেন করো' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleVoiceSubmit(item.cmd)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/40 text-[10.5px] text-slate-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            >
              <item.icon className="w-3 h-3 text-pink-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Central Giant Voice Control Button */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white scale-110 shadow-[0_0_30px_#00f2fe]'
                : isSpeaking
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-[0_0_30px_#ff2e93]'
                : 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,46,147,0.5)]'
            }`}
            title="মুখে নির্দেশ দিতে ট্যাপ করুন"
          >
            {isListening ? (
              <Mic className="w-9 h-9 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
            {/* Rippling pulse when active */}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-50" />
            )}
          </button>
        </div>

        {/* Text Fallback Input */}
        <form onSubmit={handleManualTextSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="মুখে বলুন বা লিখে দিন: যেমন 'তুফান মুভি সার্চ দাও'..."
            className="flex-1 bg-slate-900/80 border border-pink-500/30 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
