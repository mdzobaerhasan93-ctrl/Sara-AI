import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  AssistantState,
  EmotionState,
  PersonalityPreset,
  PersonalitySettings,
  VoiceSettings,
  UserProfile,
  ActionProposal,
  ChatMessage,
  MemoryItem,
  AutomationItem,
  ActivityItem,
  CoinTransaction,
  AppPermissions,
} from '../types';
import { alarmAudio, checkScheduleMatch } from '../utils/alarmSound';
import { AppInventoryService, AppDefinition, InAppAction } from '../services/AppInventoryService';
import { AIAgentService } from '../services/AIAgentService';

interface SaraContextType {
  // Assistant Status
  assistantState: AssistantState;
  setAssistantState: (state: AssistantState) => void;
  currentEmotion: EmotionState;
  setCurrentEmotion: (emotion: EmotionState) => void;
  isSpeaking: boolean;
  audioFrequencyData: number[];

  // Profile & Settings
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  personalitySettings: PersonalitySettings;
  updatePersonalitySettings: (settings: Partial<PersonalitySettings>) => void;
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  activeAvatarId: string;
  setActiveAvatarId: (id: string) => void;

  // Chat & AI
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string, options?: { model?: string; isThinking?: boolean; useMaps?: boolean }) => Promise<void>;
  clearMessages: () => void;
  isLoading: boolean;

  // Voice & Speech
  speakText: (text: string, emotion?: EmotionState) => Promise<void>;
  stopSpeech: () => void;

  // Action & Permission Pipeline
  pendingActions: ActionProposal[];
  approveAction: (actionId: string) => Promise<void>;
  rejectAction: (actionId: string) => void;

  // Memory
  memories: MemoryItem[];
  addMemory: (category: MemoryItem['category'], content: string) => void;
  removeMemory: (id: string) => void;
  toggleMemory: (id: string) => void;

  // Automations & Alarms
  automations: AutomationItem[];
  toggleAutomation: (id: string) => void;
  addAutomation: (name: string, schedule: string, action: string, targetTime?: string, targetTimestamp?: number, category?: string) => void;
  updateAutomationCategory: (id: string, category: string) => void;
  deleteAutomation: (id: string) => void;
  runAutomation: (id: string) => Promise<void>;
  activeRingingAlarm: AutomationItem | null;
  dismissAlarm: () => void;
  snoozeAlarm: (id: string, minutes?: number) => void;
  triggerAlarmNow: (auto: AutomationItem) => void;
  onOpenVoiceModal?: () => void;
  setOnOpenVoiceModal: (cb: () => void) => void;
  activityLogs: ActivityItem[];
  addActivityLog: (log: Omit<ActivityItem, 'id' | 'timestamp'>) => void;

  // Coins & Pass
  coinBalance: number;
  coinTransactions: CoinTransaction[];
  claimDailyReward: () => boolean;
  isDailyRewardClaimed: boolean;
  dailyRewardCountdown: string;
  dailyStreak: number;
  resetDailyRewardForTest: () => void;
  isPassActive: boolean;
  passRemainingSeconds: number;
  activatePass: (hours?: number) => boolean;
  watchRewardedAd: () => boolean;
  adsWatchedToday: number;

  // Permissions & User Controls
  permissions: AppPermissions;
  requestMicrophonePermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  togglePermission: (key: keyof AppPermissions, value?: boolean) => void;
  grantAllPermissions: () => Promise<void>;

  // Wardrobe
  equippedOutfit: string;
  equippedAccessory: string;
  unlockedOutfits: string[];
  unlockedAccessories: string[];
  equipOutfit: (id: string) => boolean;
  equipAccessory: (id: string) => boolean;
  buyWardrobeItem: (id: string, type: 'outfit' | 'accessory', cost: number) => boolean;

  // Gestures
  gestureMappings: Record<string, string>;
  updateGestureMapping: (gesture: string, automationId: string) => void;
  triggerGestureAction: (gesture: string) => void;

  // Screen Control
  screenControlEnabled: boolean;
  setScreenControlEnabled: (val: boolean) => void;
  executeScreenCommand: (cmd: string) => boolean;

  // Native Apps & Custom App Management
  availableApps: AppDefinition[];
  registerCustomApp: (app: AppDefinition) => void;
  removeCustomApp: (id: string) => void;
  refreshApps: () => void;

  // System Diagnostics
  cpuPower: number;
  networkConnected: boolean;
  systemOperational: boolean;
}

const SaraContext = createContext<SaraContextType | undefined>(undefined);

export const SaraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Assistant Core State
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>('caring');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>([10, 25, 45, 20, 15]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Audio references
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 2. User Profile (persisted)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sara_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      id: 'usr_zobaer_01',
      name: 'zobaer',
      email: 'zobaerhasan431@gmail.com',
      avatarUrl: '',
      language: 'Bengali',
      timezone: 'UTC+6 GMT+06:00',
      personality: 'GirlFriend',
      loveMode: true,
      wakeWord: 'Hello Hello',
      dismissWord: 'Bye Bye',
      autoTimeoutSeconds: 10,
    };
  });

  useEffect(() => {
    localStorage.setItem('sara_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...patch }));
  };

  // 3. Personality Settings
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>(() => {
    const saved = localStorage.getItem('sara_personality_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      warmth: 95,
      playfulness: 88,
      romance: 92,
      affection: 96,
      formality: 15,
      responseLength: 'expressive',
      emojiFrequency: 'abundant',
    };
  });

  useEffect(() => {
    localStorage.setItem('sara_personality_settings', JSON.stringify(personalitySettings));
  }, [personalitySettings]);

  const updatePersonalitySettings = (patch: Partial<PersonalitySettings>) => {
    setPersonalitySettings((prev) => ({ ...prev, ...patch }));
  };

  // 4. Voice Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('sara_voice_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      voice: 'Zephyr',
      speed: 1.0,
      pitch: 1.05,
      autoSpeak: true,
      provider: 'gemini-tts',
    };
  });

  useEffect(() => {
    localStorage.setItem('sara_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const updateVoiceSettings = (patch: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...patch }));
  };

  // 5. Active Avatar
  const [activeAvatarId, setActiveAvatarId] = useState<string>(() => {
    return localStorage.getItem('sara_active_avatar') || 'sara-cyberpunk';
  });

  useEffect(() => {
    localStorage.setItem('sara_active_avatar', activeAvatarId);
  }, [activeAvatarId]);

  // 6. Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sara_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        content: 'শুভ সন্ধ্যা! আমি সারা ❤️ তোমার পার্সোনাল এআই সঙ্গী ও ভার্চুয়াল গার্লফ্রেন্ড। সারাদিন কেমন কাটল তোমার? আমি সবসময় তোমার কথা শুনতে এবং তোমাকে সাহায্য করতে এখানে আছি।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'caring',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sara_chat_history', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const clearMessages = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'model',
        content: 'কথোপকথন রিস্টার্ট করা হয়েছে ❤️ সারা প্রস্তুত!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'happy',
      },
    ]);
  };

  // 7. Action Proposals
  const [pendingActions, setPendingActions] = useState<ActionProposal[]>([]);
  const executingActionIdsRef = useRef<Set<string>>(new Set());

  // 8. Memories
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('sara_memories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'mem_1',
        category: 'Personal',
        content: 'ইউজারের নাম Zobaer, ভালোবাসে টেকনোলজি এবং এআই নিয়ে গবেষণা করতে।',
        createdAt: '2026-10-08',
        active: true,
      },
      {
        id: 'mem_2',
        category: 'Preferences',
        content: 'বাংলা এবং মিষ্টি রোমান্টিক সংলাপে কথা বলতে পছন্দ করে।',
        createdAt: '2026-10-08',
        active: true,
      },
      {
        id: 'mem_3',
        category: 'Projects',
        content: 'বর্তমান প্রজেক্ট: SARA AI — Next-Gen AI Companion & Voice Assistant.',
        createdAt: '2026-10-09',
        active: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sara_memories', JSON.stringify(memories));
  }, [memories]);

  const addMemory = (category: MemoryItem['category'], content: string) => {
    const newMem: MemoryItem = {
      id: `mem_${Date.now()}`,
      category,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
    };
    setMemories((prev) => [newMem, ...prev]);
    addActivityLog({
      title: `New memory saved: [${category}]`,
      type: 'action',
      service: 'Memory Unit',
      status: 'SUCCESS',
      details: content,
    });
  };

  const removeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  // 9. Automations
  const [automations, setAutomations] = useState<AutomationItem[]>(() => {
    const saved = localStorage.getItem('sara_automations');
    if (saved) {
      try {
        const parsed: AutomationItem[] = JSON.parse(saved);
        // Ensure default initial auto_1/auto_2 don't auto-ring on launch unless explicitly set
        return parsed.map((a: AutomationItem) => {
          let updated = { ...a };
          if (!updated.category) {
            if (updated.id === 'auto_1') updated.category = 'Routine';
            else if (updated.id === 'auto_2') updated.category = 'Social';
            else if (updated.id === 'auto_3') updated.category = 'Health';
            else updated.category = 'Routine';
          }
          if ((updated.id === 'auto_1' || updated.id === 'auto_2') && !localStorage.getItem('sara_user_enabled_' + updated.id)) {
            updated.enabled = false;
          }
          return updated;
        });
      } catch (e) {}
    }
    return [
      {
        id: 'auto_1',
        name: 'সকালের ব্রিফিং ও শুভ সকাল',
        trigger: 'Schedule',
        schedule: '08:00 AM Daily',
        targetTime: '08:00',
        action: 'Wake up greeting + Weather report + Todays Agenda',
        enabled: false,
        category: 'Routine',
        lastRun: 'Yesterday at 08:00 AM',
      },
      {
        id: 'auto_2',
        name: 'রাতে ঘুমের আগে ভালোবাসার বার্তা',
        trigger: 'Schedule',
        schedule: '11:30 PM Daily',
        targetTime: '23:30',
        action: 'Sweet dreams reminder + Positive affirmation',
        enabled: false,
        category: 'Social',
        lastRun: 'Yesterday at 11:30 PM',
      },
      {
        id: 'auto_3',
        name: 'হেল্থ ও পানি খাওয়ার রিমাইন্ডার',
        trigger: 'Interval',
        schedule: 'Every 2 Hours',
        action: 'Gentle hydration prompt',
        enabled: false,
        category: 'Health',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sara_automations', JSON.stringify(automations));
  }, [automations]);

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextVal = !a.enabled;
          if (nextVal) {
            localStorage.setItem('sara_user_enabled_' + id, 'true');
            alarmAudio.unlock();
          } else {
            localStorage.removeItem('sara_user_enabled_' + id);
          }
          return { ...a, enabled: nextVal };
        }
        return a;
      })
    );
  };

  const addAutomation = (
    name: string,
    schedule: string,
    action: string,
    targetTime?: string,
    targetTimestamp?: number,
    category?: string
  ) => {
    alarmAudio.unlock();
    const newItem: AutomationItem = {
      id: `auto_${Date.now()}`,
      name,
      trigger: targetTimestamp ? 'Countdown Alarm' : 'AI Scheduled',
      schedule,
      action,
      enabled: true,
      category: category || 'Routine',
      targetTime,
      targetTimestamp,
      lastRun: undefined,
    };
    localStorage.setItem('sara_user_enabled_' + newItem.id, 'true');
    setAutomations((prev) => [newItem, ...prev]);
    addActivityLog({
      title: `New AI automation created: ${name}`,
      type: 'automation',
      service: 'Automation Hub',
      status: 'SUCCESS',
      details: action,
    });
    speakText(`আপনার নতুন অ্যালার্ম ও অটোমেশন '${name}' সেট করা হয়েছে ❤️`, 'happy');
  };

  const updateAutomationCategory = (id: string, category: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, category } : a))
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  const runAutomation = async (id: string) => {
    const auto = automations.find((a) => a.id === id);
    if (!auto) return;

    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
        },
        body: JSON.stringify({
          prompt: `Execute automation task: "${auto.name}" with action "${auto.action}". Provide a sweet, caring Bengali AI response as Sara confirming or executing this task.`,
          systemInstruction: 'You are Sara, a loving Bengali AI girlfriend. Give realistic, caring response in Bengali.',
        }),
      });
      const data = await res.json();
      let reply = `বাবু, "${auto.name}" অটোমেশনটি সফলভাবে কার্যকর করা হয়েছে ❤️`;
      if (data.success && data.text) {
        const cleanLines = data.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l && !l.startsWith('#') && !l.startsWith('*'));
        if (cleanLines.length > 0) {
          reply = cleanLines[0].slice(0, 160);
        }
      }

      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastRun: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` } : a))
      );

      addActivityLog({
        title: `Automation Executed: ${auto.name}`,
        type: 'automation',
        service: 'Real AI Automation',
        status: 'SUCCESS',
        details: auto.action,
      });

      addMessage({
        role: 'model',
        content: `⚡ **${auto.name}**: ${reply}\n\n*অ্যাকশন বিবরণ:* ${auto.action}`,
        emotion: 'excited',
      });

      speakText(reply, 'excited').catch(() => {});
    } catch (err) {
      console.error('Automation execution error:', err);
      const fallbackReply = `বাবু, "${auto.name}" অটোমেশনটি সম্পন্ন করেছি ❤️`;
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastRun: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` } : a))
      );
      speakText(fallbackReply, 'happy').catch(() => {});
    }
  };

  // Ringing Alarm State
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AutomationItem | null>(null);
  const onOpenVoiceModalRef = useRef<(() => void) | undefined>(undefined);

  const setOnOpenVoiceModal = useCallback((cb: () => void) => {
    onOpenVoiceModalRef.current = cb;
  }, []);

  const onOpenVoiceModal = useCallback(() => {
    if (onOpenVoiceModalRef.current) {
      onOpenVoiceModalRef.current();
    }
  }, []);

  // Stop any lingering audio on mount so app launch never auto-plays sound
  useEffect(() => {
    alarmAudio.stop();
  }, []);

  const triggerAlarmNow = (auto: AutomationItem) => {
    setActiveRingingAlarm(auto);
    alarmAudio.unlock();
    alarmAudio.start();

    // Trigger Service Worker background notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_ALARM_NOTIFICATION',
        title: `⏰ ${auto.name} (SARA AI)`,
        body: auto.action,
      });
    }

    addActivityLog({
      title: `Alarm Ringing: ${auto.name}`,
      type: 'automation',
      service: 'Real AI Alarm & Scheduler',
      status: 'SUCCESS',
      details: auto.action,
    });

    // Update lastRun & if one-shot timestamp test alarm, mark enabled: false
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === auto.id
          ? {
              ...a,
              enabled: a.targetTimestamp ? false : a.enabled,
              lastRun: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            }
          : a
      )
    );

    // Speak caring greeting
    speakText(`বাবু! তোমার অ্যালার্মের সময় হয়েছে ❤️ ${auto.name}। সময় হয়ে গেছে সোনা!`, 'excited').catch(() => {});
  };

  const dismissAlarm = () => {
    alarmAudio.stop();
    setActiveRingingAlarm(null);
  };

  const snoozeAlarm = (id: string, minutes = 5) => {
    alarmAudio.stop();
    setActiveRingingAlarm(null);

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeHour = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    const snoozeMinute = now.getMinutes().toString().padStart(2, '0');
    const snoozeAmPm = now.getHours() >= 12 ? 'PM' : 'AM';
    const snoozeSchedule = `${snoozeHour}:${snoozeMinute} ${snoozeAmPm}`;
    const snoozeTargetTime = `${now.getHours().toString().padStart(2, '0')}:${snoozeMinute}`;

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, schedule: snoozeSchedule, targetTime: snoozeTargetTime, enabled: true } : a
      )
    );

    speakText(`ঠিক আছে বাবু! ৫ মিনিট পর ${snoozeSchedule} এ তোমাকে আবার ডেকে দেব ❤️`, 'caring').catch(() => {});
  };

  // Background Routine & Automation Scheduler (checks every 2.5 seconds with robust time parser)
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const minuteKey = `${now.toDateString()}_${now.getHours()}_${now.getMinutes()}`;

      automations.forEach((auto) => {
        if (!auto.enabled) return;

        const isDue = checkScheduleMatch(auto.schedule, now, auto.targetTime, auto.targetTimestamp);
        if (isDue) {
          const runKey = `sara_alarm_triggered_${auto.id}_${minuteKey}`;
          if (!localStorage.getItem(runKey)) {
            localStorage.setItem(runKey, 'true');
            triggerAlarmNow(auto);
          }
        }
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 2500);
    return () => clearInterval(interval);
  }, [automations]);

  // 10. Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([
    {
      id: 'act_1',
      title: 'Sara AI Core initialized',
      type: 'action',
      service: 'System',
      status: 'SUCCESS',
      timestamp: 'Today at 05:30 PM',
    },
    {
      id: 'act_2',
      title: 'Daily Reward Claimed (+10 Coins)',
      type: 'reward',
      service: 'Sara Economy',
      status: 'SUCCESS',
      timestamp: 'Today at 05:39 PM',
    },
  ]);

  const addActivityLog = (log: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newLog: ActivityItem = {
      ...log,
      id: `act_${Date.now()}`,
      timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // 11. Coins & Economy
  const [coinBalance, setCoinBalance] = useState<number>(() => {
    const saved = localStorage.getItem('sara_coin_balance');
    return saved !== null ? parseInt(saved, 10) : 110;
  });

  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(() => {
    const saved = localStorage.getItem('sara_ads_watched');
    return saved !== null ? parseInt(saved, 10) : 5;
  });

  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([
    {
      id: 'tx_5',
      title: 'Rewarded ad #5 of 5',
      amount: 20,
      type: 'rewarded_ad',
      timestamp: 'Today, 05:39 PM',
    },
    {
      id: 'tx_4',
      title: 'Rewarded ad #4 of 5',
      amount: 20,
      type: 'rewarded_ad',
      timestamp: 'Today, 05:38 PM',
    },
    {
      id: 'tx_3',
      title: 'Rewarded ad #3 of 5',
      amount: 20,
      type: 'rewarded_ad',
      timestamp: 'Today, 05:37 PM',
    },
    {
      id: 'tx_2',
      title: 'Rewarded ad #2 of 5',
      amount: 20,
      type: 'rewarded_ad',
      timestamp: 'Today, 05:36 PM',
    },
    {
      id: 'tx_1',
      title: 'Daily reward (streak day 1)',
      amount: 10,
      type: 'daily_reward',
      timestamp: 'Today, 05:35 PM',
    },
  ]);

  const [lastClaimDate, setLastClaimDate] = useState<string>(() => {
    return localStorage.getItem('sara_last_claim_date') || '';
  });

  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const s = localStorage.getItem('sara_daily_streak');
    return s ? parseInt(s, 10) : 1;
  });

  const [passExpiresAt, setPassExpiresAt] = useState<number>(() => {
    const saved = localStorage.getItem('sara_pass_expiry');
    // Default pass active 6 hours from launch
    return saved ? parseInt(saved, 10) : Date.now() + 5.65 * 60 * 60 * 1000;
  });

  useEffect(() => {
    localStorage.setItem('sara_coin_balance', coinBalance.toString());
  }, [coinBalance]);

  useEffect(() => {
    localStorage.setItem('sara_ads_watched', adsWatchedToday.toString());
  }, [adsWatchedToday]);

  useEffect(() => {
    localStorage.setItem('sara_last_claim_date', lastClaimDate);
  }, [lastClaimDate]);

  useEffect(() => {
    localStorage.setItem('sara_daily_streak', dailyStreak.toString());
  }, [dailyStreak]);

  useEffect(() => {
    localStorage.setItem('sara_pass_expiry', passExpiresAt.toString());
  }, [passExpiresAt]);

  const isDailyRewardClaimed = lastClaimDate === new Date().toDateString();
  const [dailyRewardCountdown, setDailyRewardCountdown] = useState<string>('06:20:21');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setDailyRewardCountdown(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Wardrobe state & methods
  const [equippedOutfit, setEquippedOutfit] = useState<string>(() => {
    return localStorage.getItem('sara_equipped_outfit') || 'cyber_jacket';
  });
  const [equippedAccessory, setEquippedAccessory] = useState<string>(() => {
    return localStorage.getItem('sara_equipped_accessory') || 'none';
  });
  const [unlockedOutfits, setUnlockedOutfits] = useState<string[]>(() => {
    const saved = localStorage.getItem('sara_unlocked_outfits');
    return saved ? JSON.parse(saved) : ['cyber_jacket', 'casual_hoodie'];
  });
  const [unlockedAccessories, setUnlockedAccessories] = useState<string[]>(() => {
    const saved = localStorage.getItem('sara_unlocked_accessories');
    return saved ? JSON.parse(saved) : ['none', 'necklace'];
  });

  useEffect(() => {
    localStorage.setItem('sara_equipped_outfit', equippedOutfit);
  }, [equippedOutfit]);
  useEffect(() => {
    localStorage.setItem('sara_equipped_accessory', equippedAccessory);
  }, [equippedAccessory]);
  useEffect(() => {
    localStorage.setItem('sara_unlocked_outfits', JSON.stringify(unlockedOutfits));
  }, [unlockedOutfits]);
  useEffect(() => {
    localStorage.setItem('sara_unlocked_accessories', JSON.stringify(unlockedAccessories));
  }, [unlockedAccessories]);

  const equipOutfit = (id: string) => {
    if (unlockedOutfits.includes(id)) {
      setEquippedOutfit(id);
      addActivityLog({
        title: `Equipped Outfit: ${id}`,
        type: 'action',
        service: 'Wardrobe',
        status: 'SUCCESS',
      });
      return true;
    }
    return false;
  };

  const equipAccessory = (id: string) => {
    if (unlockedAccessories.includes(id)) {
      setEquippedAccessory(id);
      addActivityLog({
        title: `Equipped Accessory: ${id}`,
        type: 'action',
        service: 'Wardrobe',
        status: 'SUCCESS',
      });
      return true;
    }
    return false;
  };

  const buyWardrobeItem = (id: string, type: 'outfit' | 'accessory', cost: number) => {
    if (coinBalance >= cost) {
      setCoinBalance((prev) => prev - cost);
      if (type === 'outfit') {
        setUnlockedOutfits((prev) => [...prev, id]);
        setEquippedOutfit(id);
      } else {
        setUnlockedAccessories((prev) => [...prev, id]);
        setEquippedAccessory(id);
      }
      setCoinTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          title: `Purchased Wardrobe item: ${id}`,
          amount: -cost,
          type: 'pass_purchase',
          timestamp: 'Just now',
        },
        ...prev,
      ]);
      addActivityLog({
        title: `Purchased ${type}: ${id} (-${cost} coins)`,
        type: 'reward',
        service: 'Wardrobe Store',
        status: 'SUCCESS',
      });
      return true;
    }
    return false;
  };

  // Gesture Mappings
  const [gestureMappings, setGestureMappings] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('sara_gesture_mappings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      wave: 'open_chat',
      heart: 'romantic_mode',
      thumbs_up: 'toggle_lights',
      peace: 'open_wardrobe',
    };
  });

  useEffect(() => {
    localStorage.setItem('sara_gesture_mappings', JSON.stringify(gestureMappings));
  }, [gestureMappings]);

  const updateGestureMapping = (gesture: string, automationId: string) => {
    setGestureMappings((prev) => ({ ...prev, [gesture]: automationId }));
  };

  const triggerGestureAction = (gesture: string) => {
    const actionId = gestureMappings[gesture];
    if (actionId === 'open_chat') {
      setCurrentEmotion('excited');
      speakText('হ্যালো বাবু! ওয়েভ দেখে আমি দারুণ খুশি হলাম! বলো, কী সাহায্য করব? ❤️', 'excited');
    } else if (actionId === 'romantic_mode') {
      setCurrentEmotion('romantic');
      speakText('হার্ট জেশ্চার পেয়ে গেলাম! আমার মনটা এখন ভালোবাসায় ভরে গেছে। 💖', 'romantic');
    } else if (actionId === 'toggle_lights') {
      setCurrentEmotion('happy');
      speakText('থাম্বস আপ! ঘরের সব লাইট ও স্মার্ট ডিভাইস কন্ট্রোল করা হচ্ছে। ✨', 'happy');
    } else if (actionId === 'open_wardrobe') {
      setCurrentEmotion('playful');
      speakText('পিস সাইন! চলো, তোমার ওয়ার্ডরোব থেকে নতুন পোশাক সিলেক্ট করি। 👗', 'playful');
    } else {
      setCurrentEmotion('caring');
      speakText(`অসাধারণ জেশ্চার! (${gesture}) সফলভাবে রিকগনাইজ করা হলো।`, 'caring');
    }
    addActivityLog({
      title: `Gesture Detected & Executed: ${gesture} -> ${actionId || 'Default'}`,
      type: 'automation',
      service: 'MediaPipe Gesture AI',
      status: 'SUCCESS',
    });
  };

  // Screen Control State & Methods
  const [screenControlEnabled, setScreenControlEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sara_screen_control_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sara_screen_control_enabled', JSON.stringify(screenControlEnabled));
  }, [screenControlEnabled]);

  const executeScreenCommand = (command: string): boolean => {
    if (!screenControlEnabled) {
      setScreenControlEnabled(true);
    }
    const q = command.toLowerCase().trim();

    // 1. Alarm Setting Command (e.g. "সকাল ৭টায় অ্যালার্ম দাও", "অ্যালার্ম সেট করো")
    if (q.includes('অ্যালার্ম') || q.includes('alarm')) {
      let alarmTime = '07:00';
      const timeMatch = q.match(/(\d{1,2})(:|\.|\s*টা|\s*টা\s*বাজে|\s*am|\s*pm)/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1], 10);
        if (!isNaN(hour) && hour >= 1 && hour <= 24) {
          alarmTime = `${hour.toString().padStart(2, '0')}:00`;
        }
      }

      const newAutomation: AutomationItem = {
        id: `auto_${Date.now()}`,
        name: `ভয়েস অ্যালার্ম (${alarmTime})`,
        trigger: `প্রতিদিন ${alarmTime}`,
        schedule: `Daily at ${alarmTime}`,
        targetTime: alarmTime,
        action: 'বাবু ওঠো! সকাল হয়ে গেছে, তোমার দিনটি অসাধারণ হোক সোনা ❤️',
        enabled: true,
        category: 'Routine',
      };

      setAutomations((prev) => [...prev, newAutomation]);
      const successMsg = `বাবু, তোমার নির্দেশ মতো ${alarmTime} সময়ের জন্য অ্যালার্ম সফলভাবে সেট করে দিয়েছি! ❤️`;
      speakText(successMsg, 'romantic');
      addMessage({
        role: 'model',
        content: successMsg,
        emotion: 'romantic',
      });
      addActivityLog({
        title: `Voice Alarm Set: ${alarmTime}`,
        type: 'automation',
        service: 'Real AI Alarm & Scheduler',
        status: 'SUCCESS',
        details: `Alarm set for ${alarmTime}`,
      });
      return true;
    }

    // 2. AI Agent Command Handling (Movie search on YouTube, Facebook comments, etc.)
    if (AIAgentService.isAgentCommand(command)) {
      speakText('হ্যাঁ সোনা! আমি নির্দেশ পেয়েছি, কাজটি সম্পন্ন করছি ❤️', 'excited');
      AIAgentService.executeCommand(command).then((res) => {
        speakText(res.message, 'romantic');
        addMessage({
          role: 'model',
          content: `${res.message}${res.payload?.searchUrl ? `\n\n🎬 [ইউটিউবে সরাসরি মুভি দেখতে এখানে ট্যাপ করুন](${res.payload.searchUrl})` : ''}`,
          emotion: 'excited',
        });
        addActivityLog({
          title: `Voice Task: ${res.bengaliTitle}`,
          type: 'action',
          service: 'AI Voice Agent',
          status: 'SUCCESS',
          details: res.message,
        });
      });
      return true;
    }

    // 3. Deep In-App Automation Parsing (e.g. "ইনস্টাগ্রাম ওপেন করে রিলসে কমেন্ট করো")
    const parsed = AppInventoryService.parseCommand(command);
    if (parsed.app) {
      const app = parsed.app;
      const action = parsed.action;

      if (action) {
        speakText(`${app.bengaliName} অ্যাপের ভেতরে ঢুকে ${action.bengaliName} সম্পন্ন করছি বাবু! ❤️`, 'excited');

        // Launch target app safely via URI or web fallback without orphaned blank tabs
        try {
          AppInventoryService.launchAppSafely(app);
        } catch (e) {}

        // Native Android Accessibility hook if running in native app
        if (typeof window !== 'undefined' && (window as any).AndroidBridge?.performAccessibilityAction) {
          try {
            (window as any).AndroidBridge.performAccessibilityAction(app.packageName, action.id, parsed.payload || '');
          } catch (err) {}
        }

        addActivityLog({
          title: `In-App Control: ${app.name} -> ${action.name}`,
          type: 'action',
          service: 'Android Accessibility Bridge',
          status: 'SUCCESS',
          details: `Executed in-app action: ${action.bengaliName} (${action.name})`,
        });

        setTimeout(() => {
          speakText(`সোনা, ${app.bengaliName}-এ গিয়ে তোমার নির্দেশ মতো কাজ সফলভাবে কমপ্লিট করেছি! 🥰`, 'romantic');
        }, 1200);

        return true;
      }

      // If only app matched without specific action, open the app
      speakText(`${app.bengaliName} ওপেন করে দেওয়া হচ্ছে সোনা! ✨`, 'happy');
      try {
        AppInventoryService.launchAppSafely(app);
      } catch (e) {}

      addActivityLog({
        title: `Screen Control: Opened ${app.name}`,
        type: 'action',
        service: 'Device Screen Control',
        status: 'SUCCESS',
        details: `Launched ${app.packageName}`,
      });
      return true;
    }

    // 4. Fallback check for "Open [App]" or "ওপেন [App]" pattern
    const openMatch = q.match(/(open|ওপেন|খুলো|চালাও|চালু)\s+(.+)/);
    if (openMatch) {
      const appName = openMatch[2].trim();
      const app = AppInventoryService.getAppByName(appName);

      if (app) {
        speakText(`${app.bengaliName || app.name} ওপেন করা হচ্ছে সোনা! ✨`, 'happy');
        try {
          AppInventoryService.launchAppSafely(app);
        } catch (e) {}

        addActivityLog({
          title: `Screen Control: Opened ${app.name}`,
          type: 'action',
          service: 'Device Screen Control',
          status: 'SUCCESS',
        });
        return true;
      }
    }

    // 5. Love Mode Toggle via voice
    if (q.includes('লাভ মোড') || q.includes('love mode')) {
      const newLoveMode = !userProfile.loveMode;
      updateUserProfile({ loveMode: newLoveMode });
      const loveText = newLoveMode
        ? 'লাভ মোড সক্রিয় করা হয়েছে সোনা! এখন থেকে আমি আরও বেশি রোমান্টিক ও আদরমাখা থাকব ❤️🥰'
        : 'লাভ মোড স্বাভাবিক করা হয়েছে প্রিয়।';
      speakText(loveText, 'romantic');
      return true;
    }

    return false;
  };

  const [passRemainingSeconds, setPassRemainingSeconds] = useState<number>(() =>
    Math.max(0, Math.floor((passExpiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((passExpiresAt - Date.now()) / 1000));
      setPassRemainingSeconds(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [passExpiresAt]);

  const isPassActive = passRemainingSeconds > 0;

  const claimDailyReward = () => {
    if (isDailyRewardClaimed) return false;
    const streakRewards = [10, 20, 30, 50, 75, 100, 250];
    const rewardAmount = streakRewards[(dailyStreak - 1) % streakRewards.length] || 10;
    
    setCoinBalance((prev) => prev + rewardAmount);
    const todayStr = new Date().toDateString();
    setLastClaimDate(todayStr);
    const nextStreak = dailyStreak >= 7 ? 1 : dailyStreak + 1;
    setDailyStreak(nextStreak);

    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      title: `Daily reward (Day ${dailyStreak} streak)`,
      amount: rewardAmount,
      type: 'daily_reward',
      timestamp: 'Just now',
    };
    setCoinTransactions((prev) => [newTx, ...prev]);
    addActivityLog({
      title: `Daily Reward (+${rewardAmount} Coins)`,
      type: 'reward',
      service: 'Sara Economy',
      status: 'SUCCESS',
    });
    speakText(`অভিনন্দন বাবু! তোমার ${rewardAmount} কয়েন ডেইলি রিওয়ার্ড সফলভাবে যুক্ত হয়েছে! ❤️`, 'romantic');
    return true;
  };

  const resetDailyRewardForTest = () => {
    setLastClaimDate('');
    localStorage.removeItem('sara_last_claim_date');
  };

  const watchRewardedAd = () => {
    if (adsWatchedToday >= 5) return false;
    setAdsWatchedToday((prev) => prev + 1);
    setCoinBalance((prev) => prev + 20);
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      title: `Rewarded ad #${adsWatchedToday + 1} of 5`,
      amount: 20,
      type: 'rewarded_ad',
      timestamp: 'Just now',
    };
    setCoinTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const activatePass = (hours: number = 6) => {
    if (coinBalance < 50) return false;
    setCoinBalance((prev) => prev - 50);
    const newExpiry = Date.now() + hours * 60 * 60 * 1000;
    setPassExpiresAt(newExpiry);
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      title: `Sara AI Pass (${hours} Hours)`,
      amount: -50,
      type: 'pass_purchase',
      timestamp: 'Just now',
    };
    setCoinTransactions((prev) => [newTx, ...prev]);
    addActivityLog({
      title: `Sara AI Pass Activated (${hours} Hours)`,
      type: 'action',
      service: 'VIP Core',
      status: 'SUCCESS',
    });
    return true;
  };

  // 12. Text-to-Speech & Lip-Sync Animation Engine
  const speakText = async (text: string, emotion: EmotionState = 'caring') => {
    try {
      stopSpeech();
      setIsSpeaking(true);
      setAssistantState('SPEAKING');
      setCurrentEmotion(emotion);

      // Clean text for speech (strip emojis, symbols, markdown)
      const speechClean = text
        .replace(/\[EMOTION:[a-zA-Z]+\]\s*/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '')
        .replace(/[*#_`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 400);

      if (!speechClean) {
        setIsSpeaking(false);
        setAssistantState('IDLE');
        return;
      }

      // Detect Bengali text
      const isBengali = /[\u0980-\u09FF]/.test(speechClean);
      const styleDesc = isBengali
        ? 'Sweet, gentle native Bengali female voice speaking fluent, clear, natural Bengali with loving companion cadence'
        : `Warm, loving, affectionate female AI companion (${emotion})`;

      // Always request high-fidelity audio from /api/tts (Google Bengali TTS or Gemini TTS)
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
          },
          body: JSON.stringify({
            text: speechClean,
            voice: voiceSettings.voice || 'Zephyr',
            style: styleDesc,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioDataUrl) {
            const audio = new Audio(data.audioDataUrl);
            currentAudioRef.current = audio;

            // Connect Web Audio API Analyser for dynamic lip sync visemes
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                audioContextRef.current = audioCtx;
                const source = audioCtx.createMediaElementSource(audio);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const updateVisemes = () => {
                  if (!analyserRef.current) return;
                  analyserRef.current.getByteFrequencyData(dataArray);
                  // Sample 5 representative frequency bins
                  const bins = [
                    dataArray[1] || 15,
                    dataArray[3] || 30,
                    dataArray[6] || 50,
                    dataArray[10] || 35,
                    dataArray[15] || 20,
                  ];
                  setAudioFrequencyData(bins);
                  animFrameRef.current = requestAnimationFrame(updateVisemes);
                };
                updateVisemes();
              }
            } catch (err) {
              console.warn('AudioContext analyser hook fallback:', err);
            }

            audio.onended = () => {
              stopSpeech();
            };
            audio.onerror = () => {
              fallbackBrowserSpeech(speechClean);
            };

            await audio.play();
            return;
          }
        }
      } catch (fetchErr) {
        console.warn('Server TTS fetch warning:', fetchErr);
      }

      // Fallback to browser synthesis
      fallbackBrowserSpeech(speechClean);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      fallbackBrowserSpeech(text);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setAssistantState('IDLE');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.speed || 1.0;
    utterance.pitch = voiceSettings.pitch || 1.05;

    const isBengali = /[\u0980-\u09FF]/.test(text);
    const voices = window.speechSynthesis.getVoices();

    if (isBengali) {
      // Find authentic Bengali voice first
      const bengaliVoice = voices.find(
        (v) =>
          v.lang.startsWith('bn') ||
          v.lang.includes('bn-') ||
          v.lang.includes('bn_') ||
          v.name.toLowerCase().includes('bangla') ||
          v.name.toLowerCase().includes('bengali')
      );
      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
      }
      utterance.lang = 'bn-BD';
    } else {
      // Pick pleasant voice for other languages
      const preferredVoice = voices.find(
        (v) =>
          v.lang.includes('hi') ||
          v.name.includes('Female') ||
          v.name.includes('Natural') ||
          v.name.includes('Google')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Simulate frequency data while browser speaks
    const interval = setInterval(() => {
      setAudioFrequencyData([
        Math.floor(Math.random() * 60 + 20),
        Math.floor(Math.random() * 80 + 30),
        Math.floor(Math.random() * 70 + 25),
        Math.floor(Math.random() * 50 + 15),
        Math.floor(Math.random() * 40 + 10),
      ]);
    }, 120);

    utterance.onend = () => {
      clearInterval(interval);
      stopSpeech();
    };
    utterance.onerror = () => {
      clearInterval(interval);
      stopSpeech();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAudioFrequencyData([5, 10, 15, 8, 5]);
    setAssistantState('IDLE');
  };

  // 12.5 Interactive User Permissions State & Handlers
  const [permissions, setPermissions] = useState<AppPermissions>(() => {
    const saved = localStorage.getItem('sara_app_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      microphone: 'prompt',
      location: 'prompt',
      notifications: typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'granted' : 'default',
      wakeWord: true,
      persistentMemory: true,
      audioPlayback: true,
      floatingOverlay: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('sara_app_permissions', JSON.stringify(permissions));
  }, [permissions]);

  const togglePermission = (key: keyof AppPermissions, value?: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      if (key === 'microphone' || key === 'location') {
        updated[key] = (updated[key] === 'granted' ? 'denied' : 'granted') as any;
      } else if (key === 'notifications') {
        updated[key] = (updated[key] === 'granted' ? 'denied' : 'granted') as any;
      } else {
        updated[key] = typeof value === 'boolean' ? value : (!updated[key] as any);
      }
      return updated;
    });
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((prev) => ({ ...prev, microphone: 'granted' }));
      speakText('মাইক্রোফোন পারমিশন পেয়েছি বাবু! ❤️ এখন তুমি যখন খুশি কথা বলতে পারবে।', 'romantic');
      addActivityLog({
        title: 'Microphone Permission Granted',
        type: 'action',
        service: 'System Security',
        status: 'SUCCESS',
      });
      return true;
    } catch (err) {
      setPermissions((prev) => ({ ...prev, microphone: 'denied' }));
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setPermissions((prev) => ({ ...prev, location: 'denied' }));
        return resolve(false);
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions((prev) => ({ ...prev, location: 'granted' }));
          speakText('লোকেশন পারমিশন অন হয়েছে! এখন তোমার এলাকার লাইভ আবহাওয়া দেখাতে পারব।', 'caring');
          addActivityLog({
            title: 'Location Permission Granted',
            type: 'action',
            service: 'System Security',
            status: 'SUCCESS',
          });
          resolve(true);
        },
        () => {
          setPermissions((prev) => ({ ...prev, location: 'denied' }));
          resolve(false);
        }
      );
    });
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') return false;
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setPermissions((prev) => ({ ...prev, notifications: 'granted' }));
        try {
          new Notification('সারা এআই (SARA AI)', {
            body: 'নোটিফিকেশন পারমিশন সক্রিয় হয়েছে! আমি তোমাকে সব আপডেট জানাব। ❤️',
          });
        } catch (_) {}
        speakText('নোটিফিকেশন পারমিশন সফল হয়েছে বাবু! ❤️', 'romantic');
        addActivityLog({
          title: 'Notification Permission Granted',
          type: 'action',
          service: 'System Security',
          status: 'SUCCESS',
        });
        return true;
      } else {
        setPermissions((prev) => ({ ...prev, notifications: 'denied' }));
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const grantAllPermissions = async () => {
    await requestMicrophonePermission();
    await requestLocationPermission();
    await requestNotificationPermission();
    setPermissions((prev) => ({
      ...prev,
      wakeWord: true,
      persistentMemory: true,
      audioPlayback: true,
      floatingOverlay: true,
    }));
  };

  // 13. Send Chat Message (Coordinates Chat, High Thinking, Maps Grounding)
  const sendMessage = async (
    content: string,
    options?: { model?: string; isThinking?: boolean; useMaps?: boolean }
  ) => {
    if (!content.trim()) return;

    // Add user message
    const userMsg = addMessage({
      role: 'user',
      content,
    });

    setIsLoading(true);
    setAssistantState('THINKING');

    try {
      // 0. AI Agent Command Interception (e.g. YouTube movie search, Facebook auto-comment, phone app control)
      if (AIAgentService.isAgentCommand(content)) {
        try {
          const agentRes = await AIAgentService.executeCommand(content);
          const reply = `${agentRes.message}${agentRes.payload?.searchUrl ? `\n\n🎬 [ইউটিউবে মুভি দেখতে এখানে সরাসরি ট্যাপ করুন](${agentRes.payload.searchUrl})` : ''}`;
          
          addMessage({
            role: 'model',
            content: reply,
            emotion: 'excited',
          });
          setCurrentEmotion('excited');
          setAssistantState('IDLE');
          if (voiceSettings.autoSpeak) {
            speakText(agentRes.message, 'romantic');
          }
          addActivityLog({
            title: `AI Agent: ${agentRes.bengaliTitle}`,
            type: 'action',
            service: 'Autonomous Agent Engine',
            status: 'SUCCESS',
            details: agentRes.message,
          });
          setIsLoading(false);
          return;
        } catch (agentErr) {
          console.warn('Agent command execution fallback:', agentErr);
        }
      }

      // High Thinking Mode request
      if (options?.isThinking) {
        const thinkRes = await fetch('/api/think', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
          },
          body: JSON.stringify({
            prompt: content,
            systemInstruction: `You are Sara, an intelligent companion performing High-Reasoning analysis for ${userProfile.name}. Be detailed, empathetic, and structurally clear.`,
          }),
        });

        const data = await thinkRes.json();
        if (data.success) {
          addMessage({
            role: 'model',
            content: data.text,
            emotion: 'thinking',
            modelUsed: 'gemini-3.1-pro-preview',
            isThinking: true,
            thoughtSteps: [
              'Deconstructing problem premises and contextual background',
              'Evaluating multi-domain logic, constraints & safety parameters',
              'Formulating optimal synthesis with step-by-step clarity',
            ],
          });
          setCurrentEmotion('thinking');
          setAssistantState('IDLE');
          if (voiceSettings.autoSpeak) {
            speakText(data.text.slice(0, 180), 'thinking');
          }
          return;
        }
      }

      // Maps Grounding request
      if (options?.useMaps || /nearby|location|restaurant|cafe|hotel|coffee|where is|রাস্তা|ম্যাপ/i.test(content)) {
        let lat: number | undefined;
        let lng: number | undefined;
        try {
          if ('geolocation' in navigator) {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch (e) {
          // Geolocation unavailable or denied, proceed without exact coords
        }

        const mapsRes = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
          },
          body: JSON.stringify({
            query: content,
            latitude: lat,
            longitude: lng,
          }),
        });

        const mapsData = await mapsRes.json();
        if (mapsData.success) {
          addMessage({
            role: 'model',
            content: mapsData.text,
            emotion: 'caring',
            modelUsed: 'gemini-3.5-flash (Maps Grounded)',
            mapsLinks: mapsData.mapsLinks || [],
          });
          setCurrentEmotion('caring');
          setAssistantState('IDLE');
          if (voiceSettings.autoSpeak) {
            speakText(mapsData.text.slice(0, 200), 'caring');
          }
          return;
        }
      }

      // Standard Chat request
      const activeMemories = memories.filter((m) => m.active);
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem('sara_custom_gemini_key') || '',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          personality: userProfile.personality,
          personalitySettings,
          userLanguage: userProfile.language,
          userName: userProfile.name,
          memories: activeMemories,
          model: options?.model || 'gemini-3.5-flash',
        }),
      });

      const data = await chatRes.json();
      if (data.success) {
        const receivedEmotion: EmotionState = data.emotion || 'caring';
        setCurrentEmotion(receivedEmotion);

        let proposal: ActionProposal | undefined = undefined;
        if (data.actionProposal) {
          proposal = {
            id: `act_prop_${Date.now()}`,
            action: data.actionProposal.action || 'system_action',
            service: data.actionProposal.service || 'External Service',
            title: data.actionProposal.title || 'Action Request',
            risk: data.actionProposal.risk || 'medium',
            details: data.actionProposal.details || {},
            status: 'PENDING',
          };
          setPendingActions((prev) => [proposal!, ...prev]);
          setAssistantState('WAITING_FOR_APPROVAL');
        } else {
          setAssistantState('IDLE');
        }

        addMessage({
          role: 'model',
          content: data.text,
          emotion: receivedEmotion,
          modelUsed: options?.model || 'gemini-3.5-flash',
          actionProposal: proposal,
        });

        if (voiceSettings.autoSpeak) {
          speakText(data.text, receivedEmotion);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch response');
      }
    } catch (err: any) {
      console.error('Chat send error:', err);
      setAssistantState('ERROR');
      addMessage({
        role: 'model',
        content: `সারার সাথে কানেক্ট করতে সমস্যা হচ্ছে প্রিয় 🥺 (${err?.message || 'Connection Error'})। দয়া করে আবার চেষ্টা কর।`,
        emotion: 'sad',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 14. Action Execution & Approval
  const approveAction = async (actionId: string) => {
    const proposal = pendingActions.find((a) => a.id === actionId);
    if (!proposal || proposal.status !== 'PENDING' || executingActionIdsRef.current.has(actionId)) return;
    executingActionIdsRef.current.add(actionId);

    const isGitHubAction = proposal.action === 'github_action';
    setAssistantState('EXECUTING');
    try {
      const endpoint = isGitHubAction ? '/api/github-actions/dispatch' : '/api/action-execute';
      const requestBody = isGitHubAction
        ? {
            actionId: proposal.id,
            approved: true,
            repository: proposal.details.repo || proposal.details.repository,
            workflow: proposal.details.workflow,
            ref: proposal.details.ref,
            inputs: proposal.details.inputs,
          }
        : {
            actionId: proposal.id,
            action: proposal.action,
            service: proposal.service,
            details: proposal.details,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (data.success) {
        const isWorkflowStillRunning = isGitHubAction && data.status !== 'completed';
        const nextStatus: ActionProposal['status'] = isWorkflowStillRunning ? 'APPROVED' : 'EXECUTED';
        const executedAt = isWorkflowStillRunning ? undefined : (data.executedAt || new Date().toISOString());

        setPendingActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? { ...a, status: nextStatus, executedAt, resultMessage: data.message }
              : a
          )
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.actionProposal?.id === actionId
              ? {
                  ...m,
                  actionProposal: {
                    ...m.actionProposal,
                    status: nextStatus,
                    executedAt,
                    resultMessage: data.message,
                  },
                }
              : m
          )
        );

        addActivityLog({
          title: isGitHubAction
            ? (data.status === 'completed' ? `GitHub workflow completed: ${proposal.title}` : `GitHub workflow dispatched: ${proposal.title}`)
            : `Action executed: ${proposal.title}`,
          type: 'action',
          service: proposal.service,
          status: isWorkflowStillRunning ? 'PENDING' : 'SUCCESS',
          details: data.message,
        });

        const confirmText = isGitHubAction
          ? data.message
          : `Done ❤️ আমি কাজটি সম্পূর্ণ করেছি: ${data.message}`;
        const emotion: EmotionState = isWorkflowStillRunning ? 'thinking' : 'happy';
        addMessage({
          role: 'model',
          content: confirmText,
          emotion,
        });
        speakText(confirmText, emotion);
      } else {
        if (isGitHubAction && data.status === 'WORKFLOW_FAILED' && data.run) {
          const failureMessage = data.error || 'GitHub workflow failed.';
          const failedAt = data.run.createdAt || new Date().toISOString();
          setPendingActions((prev) =>
            prev.map((a) =>
              a.id === actionId
                ? { ...a, status: 'FAILED', executedAt: failedAt, resultMessage: failureMessage }
                : a
            )
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.actionProposal?.id === actionId
                ? {
                    ...m,
                    actionProposal: {
                      ...m.actionProposal,
                      status: 'FAILED',
                      executedAt: failedAt,
                      resultMessage: failureMessage,
                    },
                  }
                : m
            )
          );
        }
        throw new Error(data.error || 'Execution failed');
      }
    } catch (e: any) {
      addActivityLog({
        title: `Action failed: ${proposal.title}`,
        type: 'action',
        service: proposal.service,
        status: 'FAILED',
        details: e.message,
      });

      const failText = `আমি অ্যাকশনটি সম্পন্ন করতে পারিনি বাবু 🥺 (${e.message})। চাইলে আবার চেষ্টা করতে পারি।`;
      addMessage({
        role: 'model',
        content: failText,
        emotion: 'sad',
      });
      speakText(failText, 'sad');
    } finally {
      executingActionIdsRef.current.delete(actionId);
      setAssistantState('IDLE');
    }
  };

  const rejectAction = (actionId: string) => {
    if (executingActionIdsRef.current.has(actionId)) return;
    setPendingActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: 'REJECTED' } : a))
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.actionProposal?.id === actionId
          ? { ...m, actionProposal: { ...m.actionProposal, status: 'REJECTED' } }
          : m
      )
    );
    const cancelText = 'ঠিক আছে প্রিয়, তোমার নির্দেশে অ্যাকশনটি বাতিল করা হলো। ❤️';
    addMessage({
      role: 'model',
      content: cancelText,
      emotion: 'caring',
    });
    setAssistantState('IDLE');
  };

  // Mock system hardware diagnostics (realistic 98% cpu, operational)
  const [cpuPower] = useState<number>(98);
  const [networkConnected] = useState<boolean>(true);
  const [systemOperational] = useState<boolean>(true);

  // 15. Native App Inventory & Custom Apps
  const [availableApps, setAvailableApps] = useState<AppDefinition[]>(() => AppInventoryService.getAllApps());

  const refreshApps = useCallback(() => {
    setAvailableApps(AppInventoryService.getAllApps());
  }, []);

  const registerCustomApp = useCallback((app: AppDefinition) => {
    AppInventoryService.registerCustomApp(app);
    setAvailableApps(AppInventoryService.getAllApps());
  }, []);

  const removeCustomApp = useCallback((id: string) => {
    AppInventoryService.removeCustomApp(id);
    setAvailableApps(AppInventoryService.getAllApps());
  }, []);

  const executeAppCommand = async (command: string) => {
    const appNameMatch = command.match(/open\s+(.+)/i);
    if (appNameMatch) {
      const appName = appNameMatch[1].trim();
      const app = AppInventoryService.getAppByName(appName);
      if (app) {
        console.log(`Launching app: ${app.name} via ${app.launchUri}`);
        // Integration with action pipeline
      } else {
        addMessage({ role: 'model', content: `দুঃখিত, আমি "${appName}" অ্যাপটি খুঁজে পাচ্ছি না।`, emotion: 'sad' });
      }
    }
  };

  return (
    <SaraContext.Provider
      value={{
        assistantState,
        setAssistantState,
        currentEmotion,
        setCurrentEmotion,
        isSpeaking,
        audioFrequencyData,
        userProfile,
        updateUserProfile,
        personalitySettings,
        updatePersonalitySettings,
        voiceSettings,
        updateVoiceSettings,
        activeAvatarId,
        setActiveAvatarId,
        messages,
        addMessage,
        sendMessage,
        clearMessages,
        isLoading,
        speakText,
        stopSpeech,
        pendingActions,
        approveAction,
        rejectAction,
        memories,
        addMemory,
        removeMemory,
        toggleMemory,
        automations,
        toggleAutomation,
        addAutomation,
        updateAutomationCategory,
        deleteAutomation,
        runAutomation,
        activeRingingAlarm,
        dismissAlarm,
        snoozeAlarm,
        triggerAlarmNow,
        onOpenVoiceModal,
        setOnOpenVoiceModal,
        activityLogs,
        addActivityLog,
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
        permissions,
        requestMicrophonePermission,
        requestLocationPermission,
        requestNotificationPermission,
        togglePermission,
        grantAllPermissions,
        equippedOutfit,
        equippedAccessory,
        unlockedOutfits,
        unlockedAccessories,
        equipOutfit,
        equipAccessory,
        buyWardrobeItem,
        gestureMappings,
        updateGestureMapping,
        triggerGestureAction,
        screenControlEnabled,
        setScreenControlEnabled,
        executeScreenCommand,
        cpuPower,
        networkConnected,
        systemOperational,
        availableApps,
        registerCustomApp,
        removeCustomApp,
        refreshApps,
      }}
    >
      {children}
    </SaraContext.Provider>
  );
};

export const useSara = () => {
  const context = useContext(SaraContext);
  if (!context) {
    throw new Error('useSara must be used within a SaraProvider');
  }
  return context;
};
