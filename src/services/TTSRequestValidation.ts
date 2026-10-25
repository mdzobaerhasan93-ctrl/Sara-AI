export type TTSVoice = 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Aoede';

export interface ValidatedTTSRequest {
  text: string;
  voice: TTSVoice;
  style: string;
}

export type TTSValidationResult =
  | { success: true; data: ValidatedTTSRequest }
  | { success: false; error: string };

const MAX_INPUT_TEXT_LENGTH = 400;
const MAX_STYLE_LENGTH = 200;
const VOICES = new Set<TTSVoice>(['Zephyr', 'Kore', 'Puck', 'Fenrir', 'Aoede']);
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cleanSpeechText(input: string): string {
  return input
    .replace(/\[EMOTION:[a-zA-Z]+\]\s*/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[*#_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Bounds TTS input before provider calls. The browser's native "browser" voice
 * option is mapped to the server's default provider voice, Zephyr.
 */
export function validateTTSRequest(input: unknown): TTSValidationResult {
  if (!isRecord(input)) {
    return { success: false, error: 'Request body must be an object.' };
  }

  if (typeof input.text !== 'string') {
    return { success: false, error: 'TTS text must be a string.' };
  }
  const rawText = input.text.trim();
  if (!rawText) {
    return { success: false, error: 'TTS text is required.' };
  }
  if (rawText.length > MAX_INPUT_TEXT_LENGTH) {
    return { success: false, error: `TTS text must be ${MAX_INPUT_TEXT_LENGTH} characters or fewer.` };
  }
  if (CONTROL_CHARACTERS.test(rawText)) {
    return { success: false, error: 'TTS text contains unsupported control characters.' };
  }

  const text = cleanSpeechText(rawText);
  if (!text) {
    return { success: false, error: 'TTS text is empty after removing formatting.' };
  }

  let voice: TTSVoice = 'Zephyr';
  if (input.voice !== undefined && input.voice !== null) {
    if (typeof input.voice !== 'string') {
      return { success: false, error: 'Voice must be a supported voice name.' };
    }
    if (input.voice === 'browser') {
      voice = 'Zephyr';
    } else if (VOICES.has(input.voice as TTSVoice)) {
      voice = input.voice as TTSVoice;
    } else {
      return { success: false, error: 'Voice must be one of Zephyr, Kore, Puck, Fenrir, Aoede, or browser.' };
    }
  }

  let style = 'Warm, loving, expressive female companion';
  if (input.style !== undefined && input.style !== null) {
    if (typeof input.style !== 'string') {
      return { success: false, error: 'Voice style must be a string.' };
    }
    if (input.style.length > MAX_STYLE_LENGTH) {
      return { success: false, error: `Voice style must be ${MAX_STYLE_LENGTH} characters or fewer.` };
    }
    if (CONTROL_CHARACTERS.test(input.style)) {
      return { success: false, error: 'Voice style contains unsupported control characters.' };
    }
    style = input.style.replace(/\s+/g, ' ').trim() || style;
  }

  return { success: true, data: { text, voice, style } };
}
