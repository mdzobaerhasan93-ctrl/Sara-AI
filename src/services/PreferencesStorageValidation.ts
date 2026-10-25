import type {
  PersonalityPreset,
  PersonalitySettings,
  UserProfile,
  VoiceSettings,
} from '../types';

const ALLOWED_LANGUAGES = new Set<UserProfile['language']>([
  'Bengali',
  'English',
  'Hindi',
  'Banglish',
]);

const ALLOWED_PERSONALITIES = new Set<PersonalityPreset>([
  'Friendly',
  'Caring',
  'Playful',
  'Romantic',
  'Highly Affectionate',
  'GirlFriend',
]);

const ALLOWED_VOICES = new Set<VoiceSettings['voice']>([
  'Zephyr',
  'Kore',
  'Puck',
  'Fenrir',
  'Aoede',
  'browser',
]);

const ALLOWED_RESPONSE_LENGTHS = new Set<PersonalitySettings['responseLength']>([
  'concise',
  'balanced',
  'expressive',
]);

const ALLOWED_EMOJI_FREQUENCIES = new Set<PersonalitySettings['emojiFrequency']>([
  'minimal',
  'moderate',
  'abundant',
]);

const ALLOWED_TTS_PROVIDERS = new Set<VoiceSettings['provider']>([
  'gemini-tts',
  'browser',
]);

export const DEFAULT_USER_PROFILE: UserProfile = {
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

export const DEFAULT_PERSONALITY_SETTINGS: PersonalitySettings = {
  warmth: 95,
  playfulness: 88,
  romance: 92,
  affection: 96,
  formality: 15,
  responseLength: 'expressive',
  emojiFrequency: 'abundant',
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: 'Zephyr',
  speed: 1.0,
  pitch: 1.05,
  autoSpeak: true,
  provider: 'gemini-tts',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string') return fallback;
  const text = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return text && text.length <= maxLength ? text : fallback;
}

function boundedNumber(value: unknown, fallback: number, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}

function safeId(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const id = value.trim();
  if (!/^[a-z0-9_-]{1,80}$/i.test(id)) return fallback;
  if (['__proto__', 'prototype', 'constructor'].includes(id.toLowerCase())) return fallback;
  return id;
}

function safeEmail(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const email = value.trim();
  if (email === '') return '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fallback;
  return email;
}

function safeAvatarUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  if (candidate === '') return '';
  if (candidate.length > 1_500_000 || candidate.includes('\\')) return fallback;

  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(candidate)) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export function normalizeUserProfile(
  input: unknown,
  fallback: UserProfile = DEFAULT_USER_PROFILE,
): UserProfile {
  if (!isRecord(input)) return { ...fallback };

  const language = typeof input.language === 'string' && ALLOWED_LANGUAGES.has(input.language as UserProfile['language'])
    ? input.language as UserProfile['language']
    : fallback.language;
  const personality = typeof input.personality === 'string' && ALLOWED_PERSONALITIES.has(input.personality as PersonalityPreset)
    ? input.personality as PersonalityPreset
    : fallback.personality;

  return {
    id: safeId(input.id, fallback.id),
    name: cleanText(input.name, fallback.name, 80),
    email: safeEmail(input.email, fallback.email),
    avatarUrl: safeAvatarUrl(input.avatarUrl, fallback.avatarUrl),
    language,
    timezone: cleanText(input.timezone, fallback.timezone, 80).replace(/[<>\\]/g, ''),
    personality,
    loveMode: typeof input.loveMode === 'boolean' ? input.loveMode : fallback.loveMode,
    wakeWord: cleanText(input.wakeWord, fallback.wakeWord, 80),
    dismissWord: cleanText(input.dismissWord, fallback.dismissWord, 80),
    autoTimeoutSeconds: Math.round(boundedNumber(input.autoTimeoutSeconds, fallback.autoTimeoutSeconds, 1, 300)),
  };
}

export function normalizePersonalitySettings(
  input: unknown,
  fallback: PersonalitySettings = DEFAULT_PERSONALITY_SETTINGS,
): PersonalitySettings {
  if (!isRecord(input)) return { ...fallback };

  const responseLength = typeof input.responseLength === 'string'
    && ALLOWED_RESPONSE_LENGTHS.has(input.responseLength as PersonalitySettings['responseLength'])
    ? input.responseLength as PersonalitySettings['responseLength']
    : fallback.responseLength;

  const emojiFrequency = typeof input.emojiFrequency === 'string'
    && ALLOWED_EMOJI_FREQUENCIES.has(input.emojiFrequency as PersonalitySettings['emojiFrequency'])
    ? input.emojiFrequency as PersonalitySettings['emojiFrequency']
    : fallback.emojiFrequency;

  return {
    warmth: Math.round(boundedNumber(input.warmth, fallback.warmth, 0, 100)),
    playfulness: Math.round(boundedNumber(input.playfulness, fallback.playfulness, 0, 100)),
    romance: Math.round(boundedNumber(input.romance, fallback.romance, 0, 100)),
    affection: Math.round(boundedNumber(input.affection, fallback.affection, 0, 100)),
    formality: Math.round(boundedNumber(input.formality, fallback.formality, 0, 100)),
    responseLength,
    emojiFrequency,
  };
}

export function normalizeVoiceSettings(
  input: unknown,
  fallback: VoiceSettings = DEFAULT_VOICE_SETTINGS,
): VoiceSettings {
  if (!isRecord(input)) return { ...fallback };

  const voice = typeof input.voice === 'string' && ALLOWED_VOICES.has(input.voice as VoiceSettings['voice'])
    ? input.voice as VoiceSettings['voice']
    : fallback.voice;
  const provider = typeof input.provider === 'string' && ALLOWED_TTS_PROVIDERS.has(input.provider as VoiceSettings['provider'])
    ? input.provider as VoiceSettings['provider']
    : fallback.provider;

  return {
    voice,
    speed: Math.round(boundedNumber(input.speed, fallback.speed, 0.8, 1.4) * 100) / 100,
    pitch: Math.round(boundedNumber(input.pitch, fallback.pitch, 0.8, 1.4) * 100) / 100,
    autoSpeak: typeof input.autoSpeak === 'boolean' ? input.autoSpeak : fallback.autoSpeak,
    provider,
  };
}
