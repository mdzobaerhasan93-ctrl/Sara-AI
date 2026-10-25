export type AffirmationEmotion = 'romantic' | 'caring' | 'happy' | 'excited';

export interface DailyAffirmationRequest {
  userName: string;
  loveMode: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'daily';
}

export interface NormalizedAffirmation {
  quoteBn: string;
  quoteEn: string;
  greeting: string;
  emotion: AffirmationEmotion;
  tag: string;
  audioScript: string;
}

export type DailyAffirmationRequestResult =
  | { success: true; data: DailyAffirmationRequest }
  | { success: false; error: string };

const MAX_USER_NAME_LENGTH = 60;
const MAX_AFFIRMATION_TEXT_LENGTH = 600;
const MAX_TAG_LENGTH = 80;
const TIME_OF_DAY_VALUES = new Set(['morning', 'afternoon', 'evening', 'night', 'daily']);
const EMOTIONS = new Set<AffirmationEmotion>(['romantic', 'caring', 'happy', 'excited']);
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeSingleLine(value: string, maxLength: number): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function validateDailyAffirmationRequest(input: unknown): DailyAffirmationRequestResult {
  if (!isRecord(input)) {
    return { success: false, error: 'Request body must be an object.' };
  }

  let userName = 'বাবু';
  if (input.userName !== undefined && input.userName !== null) {
    if (typeof input.userName !== 'string') {
      return { success: false, error: 'User name must be a string.' };
    }
    if (input.userName.length > MAX_USER_NAME_LENGTH) {
      return { success: false, error: `User name must be ${MAX_USER_NAME_LENGTH} characters or fewer.` };
    }
    if (CONTROL_CHARACTERS.test(input.userName)) {
      return { success: false, error: 'User name contains unsupported control characters.' };
    }
    userName = normalizeSingleLine(input.userName, MAX_USER_NAME_LENGTH) || 'বাবু';
  }

  let loveMode = true;
  if (input.loveMode !== undefined && input.loveMode !== null) {
    if (typeof input.loveMode !== 'boolean') {
      return { success: false, error: 'Love mode must be a boolean.' };
    }
    loveMode = input.loveMode;
  }

  let timeOfDay: DailyAffirmationRequest['timeOfDay'] = 'morning';
  if (input.timeOfDay !== undefined && input.timeOfDay !== null) {
    if (typeof input.timeOfDay !== 'string' || !TIME_OF_DAY_VALUES.has(input.timeOfDay)) {
      return { success: false, error: 'Time of day must be morning, afternoon, evening, night, or daily.' };
    }
    timeOfDay = input.timeOfDay as DailyAffirmationRequest['timeOfDay'];
  }

  return { success: true, data: { userName, loveMode, timeOfDay } };
}

/**
 * Normalizes model JSON. Only a valid, non-empty Bengali affirmation counts as
 * a model-generated result; missing required output triggers the local fallback.
 */
export function normalizeDailyAffirmationResult(input: unknown): NormalizedAffirmation | null {
  if (!isRecord(input) || typeof input.quoteBn !== 'string') return null;
  if (input.quoteBn.length > 3_000 || CONTROL_CHARACTERS.test(input.quoteBn)) return null;

  const quoteBn = normalizeSingleLine(input.quoteBn, MAX_AFFIRMATION_TEXT_LENGTH);
  if (!quoteBn) return null;

  const quoteEn = typeof input.quoteEn === 'string' && input.quoteEn.length <= 3_000
    ? normalizeSingleLine(input.quoteEn, MAX_AFFIRMATION_TEXT_LENGTH)
    : '';
  const greeting = typeof input.greeting === 'string' && input.greeting.length <= 3_000
    ? normalizeSingleLine(input.greeting, MAX_AFFIRMATION_TEXT_LENGTH)
    : '';
  const audioScript = typeof input.audioScript === 'string' && input.audioScript.length <= 3_000
    ? normalizeSingleLine(input.audioScript, MAX_AFFIRMATION_TEXT_LENGTH)
    : '';
  const tag = typeof input.tag === 'string' && input.tag.length <= 500
    ? normalizeSingleLine(input.tag, MAX_TAG_LENGTH)
    : '';

  const emotion: AffirmationEmotion = typeof input.emotion === 'string' && EMOTIONS.has(input.emotion as AffirmationEmotion)
    ? input.emotion as AffirmationEmotion
    : 'caring';

  return {
    quoteBn,
    quoteEn,
    greeting,
    emotion,
    tag: tag || 'Daily Affirmation',
    audioScript: audioScript || quoteBn,
  };
}
