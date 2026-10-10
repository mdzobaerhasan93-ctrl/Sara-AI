export type AssistantState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'HAPPY'
  | 'SAD'
  | 'EXCITED'
  | 'SURPRISED'
  | 'WAITING_FOR_APPROVAL'
  | 'EXECUTING'
  | 'ERROR';

export type EmotionState =
  | 'happy'
  | 'caring'
  | 'playful'
  | 'romantic'
  | 'excited'
  | 'surprised'
  | 'thinking'
  | 'sad';

export type PersonalityPreset =
  | 'Friendly'
  | 'Caring'
  | 'Playful'
  | 'Romantic'
  | 'Highly Affectionate'
  | 'GirlFriend';

export interface PersonalitySettings {
  warmth: number; // 0 - 100
  playfulness: number; // 0 - 100
  romance: number; // 0 - 100
  affection: number; // 0 - 100
  formality: number; // 0 - 100
  responseLength: 'concise' | 'balanced' | 'expressive';
  emojiFrequency: 'minimal' | 'moderate' | 'abundant';
}

export interface VoiceSettings {
  voice: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Aoede' | 'browser';
  speed: number; // 0.8 to 1.4
  pitch: number; // 0.8 to 1.4
  autoSpeak: boolean;
  provider: 'gemini-tts' | 'browser';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  language: 'Bengali' | 'English' | 'Hindi' | 'Banglish';
  timezone: string;
  personality: PersonalityPreset;
  loveMode: boolean;
  wakeWord: string;
  dismissWord: string;
  autoTimeoutSeconds: number;
}

export interface ActionProposal {
  id: string;
  action: string;
  service: string;
  title: string;
  risk: 'low' | 'medium' | 'high';
  details: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  executedAt?: string;
  resultMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  emotion?: EmotionState;
  modelUsed?: string;
  isAudioPlaying?: boolean;
  actionProposal?: ActionProposal;
  mapsLinks?: Array<{ title: string; uri: string }>;
  isThinking?: boolean;
  thoughtSteps?: string[];
}

export interface MemoryItem {
  id: string;
  category: 'Personal' | 'Preferences' | 'Projects' | 'Important Dates' | 'Work' | 'Custom';
  content: string;
  createdAt: string;
  active: boolean;
}

export interface AutomationItem {
  id: string;
  name: string;
  trigger: string;
  schedule: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: 'conversation' | 'action' | 'automation' | 'reward';
  service: string;
  status: 'SUCCESS' | 'PENDING' | 'REJECTED' | 'FAILED';
  timestamp: string;
  details?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  skinType: 'cyberpunk' | 'kimono' | 'casual' | 'secret_agent' | 'royal';
}

export interface CoinTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'daily_reward' | 'rewarded_ad' | 'pass_purchase' | 'referral';
  timestamp: string;
}


export type MoodType = 'radiant' | 'happy' | 'calm' | 'tired' | 'stressed';

export interface DailyHabit {
  id: string;
  title: string;
  icon: string;
  category: string;
}

export interface MoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  mood: MoodType;
  score: number; // 1 to 5
  note?: string;
  habitsCompleted: string[];
}

export interface AppPermissions {
  microphone: 'granted' | 'denied' | 'prompt';
  location: 'granted' | 'denied' | 'prompt';
  notifications: 'granted' | 'denied' | 'default';
  wakeWord: boolean;
  persistentMemory: boolean;
  audioPlayback: boolean;
  floatingOverlay: boolean;
}


