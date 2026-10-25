export interface ValidatedChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ValidatedChatMemory {
  category: string;
  content: string;
  active: boolean;
}

export interface ValidatedChatRequest {
  messages: ValidatedChatMessage[];
  personality: string;
  personalitySettings: {
    warmth: number;
    playfulness: number;
    romance: number;
    affection: number;
    formality: number;
    responseLength: 'concise' | 'balanced' | 'expressive';
    emojiFrequency: 'minimal' | 'moderate' | 'abundant';
  };
  userLanguage: 'Bengali' | 'English' | 'Hindi' | 'Banglish';
  userName: string;
  memories: ValidatedChatMemory[];
  model: string;
}

export type ChatRequestValidationResult =
  | { success: true; data: ValidatedChatRequest }
  | { success: false; error: string };

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 5_000;
const MAX_TOTAL_MESSAGE_LENGTH = 40_000;
const MAX_MEMORIES = 20;
const MAX_MEMORY_LENGTH = 500;

const PERSONALITIES = new Set([
  'Friendly',
  'Caring',
  'Playful',
  'Romantic',
  'Highly Affectionate',
  'GirlFriend',
]);
const LANGUAGES = new Set(['Bengali', 'English', 'Hindi', 'Banglish']);
const MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-3.0-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-omni-flash-preview',
]);
const MEMORY_CATEGORIES = new Set([
  'Personal',
  'Preferences',
  'Projects',
  'Important Dates',
  'Work',
  'Custom',
  'Journal',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function boundedText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .slice(0, maxLength);
}

function percent(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
}

function validateMemories(value: unknown): ValidatedChatMemory[] {
  if (!Array.isArray(value)) return [];
  const result: ValidatedChatMemory[] = [];
  for (const item of value.slice(0, 100)) {
    if (!isRecord(item) || item.active !== true) continue;
    const content = boundedText(item.content, MAX_MEMORY_LENGTH).replace(/\s+/g, ' ').trim();
    if (!content) continue;
    const category = typeof item.category === 'string' && MEMORY_CATEGORIES.has(item.category)
      ? item.category
      : 'Custom';
    result.push({ category, content, active: true });
    if (result.length >= MAX_MEMORIES) break;
  }
  return result;
}

/**
 * Validates and bounds a browser-provided chat request before it is passed to
 * Gemini or interpolated into the system prompt.
 */
export function validateChatRequest(input: unknown): ChatRequestValidationResult {
  if (!isRecord(input)) {
    return { success: false, error: 'Invalid chat request body.' };
  }

  if (!Array.isArray(input.messages) || input.messages.length < 1 || input.messages.length > MAX_MESSAGES) {
    return { success: false, error: `Chat history must contain between 1 and ${MAX_MESSAGES} messages.` };
  }

  const messages: ValidatedChatMessage[] = [];
  let totalLength = 0;
  for (const message of input.messages) {
    if (!isRecord(message) || (message.role !== 'user' && message.role !== 'model')) {
      return { success: false, error: 'Each chat message must have a valid user/model role.' };
    }
    if (typeof message.content !== 'string') {
      return { success: false, error: 'Each chat message must contain text.' };
    }
    const content = boundedText(message.content, MAX_MESSAGE_LENGTH);
    if (!content.trim()) {
      return { success: false, error: 'Chat messages cannot be empty.' };
    }
    if (message.content.length > MAX_MESSAGE_LENGTH) {
      return { success: false, error: `Each chat message must be at most ${MAX_MESSAGE_LENGTH} characters.` };
    }
    totalLength += content.length;
    if (totalLength > MAX_TOTAL_MESSAGE_LENGTH) {
      return { success: false, error: `Chat history must be at most ${MAX_TOTAL_MESSAGE_LENGTH} characters in total.` };
    }
    messages.push({ role: message.role, content });
  }

  if (messages[messages.length - 1]?.role !== 'user') {
    return { success: false, error: 'The latest chat message must be from the user.' };
  }

  const rawSettings = isRecord(input.personalitySettings) ? input.personalitySettings : {};
  const responseLength = rawSettings.responseLength === 'concise'
    || rawSettings.responseLength === 'balanced'
    || rawSettings.responseLength === 'expressive'
    ? rawSettings.responseLength
    : 'expressive';
  const emojiFrequency = rawSettings.emojiFrequency === 'minimal'
    || rawSettings.emojiFrequency === 'moderate'
    || rawSettings.emojiFrequency === 'abundant'
    ? rawSettings.emojiFrequency
    : 'abundant';

  const personality = typeof input.personality === 'string' && PERSONALITIES.has(input.personality)
    ? input.personality
    : 'GirlFriend';
  const userLanguage = typeof input.userLanguage === 'string' && LANGUAGES.has(input.userLanguage)
    ? input.userLanguage as ValidatedChatRequest['userLanguage']
    : 'Bengali';
  const model = typeof input.model === 'string' && MODELS.has(input.model)
    ? input.model
    : 'gemini-3.5-flash';

  return {
    success: true,
    data: {
      messages,
      personality,
      personalitySettings: {
        warmth: percent(rawSettings.warmth, 90),
        playfulness: percent(rawSettings.playfulness, 85),
        romance: percent(rawSettings.romance, 80),
        affection: percent(rawSettings.affection, 90),
        formality: percent(rawSettings.formality, 15),
        responseLength,
        emojiFrequency,
      },
      userLanguage,
      userName: boundedText(input.userName || 'User', 80).replace(/\s+/g, ' ').trim() || 'User',
      memories: validateMemories(input.memories),
      model,
    },
  };
}
