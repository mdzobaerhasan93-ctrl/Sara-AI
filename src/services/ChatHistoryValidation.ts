import type { ChatMessage, EmotionState } from '../types';

const MAX_MESSAGES = 200;
const MAX_MESSAGE_LENGTH = 20_000;
const MAX_TOTAL_CONTENT_LENGTH = 500_000;
const MAX_MAP_LINKS = 10;
const MAX_THOUGHT_STEPS = 20;

const ALLOWED_ROLES = new Set(['user', 'model']);
const ALLOWED_EMOTIONS = new Set<EmotionState>([
  'happy',
  'caring',
  'playful',
  'romantic',
  'excited',
  'surprised',
  'thinking',
  'sad',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .trim();

  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

function safeId(value: unknown): string | null {
  const id = cleanText(value, 160);
  if (!id || !/^[a-z0-9_.:-]+$/i.test(id)) return null;
  const normalized = id.toLowerCase();
  if (['__proto__', 'prototype', 'constructor'].includes(normalized)) return null;
  return id;
}

function safeMapsLinks(value: unknown): Array<{ title: string; uri: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  const links: Array<{ title: string; uri: string }> = [];

  for (const item of value.slice(0, MAX_MAP_LINKS)) {
    if (!isRecord(item)) continue;
    const title = cleanText(item.title, 160);
    const rawUri = cleanText(item.uri, 2048);
    if (!title || !rawUri || rawUri.includes('\\')) continue;

    try {
      const url = new URL(rawUri);
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) continue;
      links.push({ title, uri: url.toString() });
    } catch {
      // Skip invalid URLs from persisted chat history.
    }
  }

  return links.length ? links : undefined;
}

/**
 * Validates untrusted localStorage chat history. Saved action proposals and
 * transient UI flags are intentionally not restored: localStorage is not an
 * authoritative approval queue and cannot re-activate old approve buttons.
 */
export function validateStoredChatMessage(
  input: unknown,
  fallbackIndex = 0,
): ChatMessage | null {
  if (!isRecord(input)) return null;
  if (typeof input.role !== 'string' || !ALLOWED_ROLES.has(input.role)) return null;

  const content = cleanText(input.content, MAX_MESSAGE_LENGTH);
  if (!content) return null;

  const id = safeId(input.id) || `restored_message_${fallbackIndex}`;
  const timestamp = cleanText(input.timestamp, 100) || 'Unknown time';
  const message: ChatMessage = {
    id,
    role: input.role as ChatMessage['role'],
    content,
    timestamp,
  };

  if (typeof input.emotion === 'string' && ALLOWED_EMOTIONS.has(input.emotion as EmotionState)) {
    message.emotion = input.emotion as EmotionState;
  }

  if (input.modelUsed !== undefined) {
    const modelUsed = cleanText(input.modelUsed, 100);
    if (modelUsed) message.modelUsed = modelUsed;
  }

  const mapsLinks = safeMapsLinks(input.mapsLinks);
  if (mapsLinks) message.mapsLinks = mapsLinks;

  if (Array.isArray(input.thoughtSteps)) {
    const thoughtSteps = input.thoughtSteps
      .slice(0, MAX_THOUGHT_STEPS)
      .map((step) => cleanText(step, 500))
      .filter((step): step is string => Boolean(step));
    if (thoughtSteps.length) message.thoughtSteps = thoughtSteps;
  }

  // Never restore actionProposal, isThinking, or isAudioPlaying from storage.
  return message;
}

/**
 * Keeps a bounded chronological tail of validated messages, rejecting bad
 * records and duplicate IDs while retaining the most recent valid message.
 */
export function validateStoredChatHistory(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  if (input.length === 0) return [];

  const tail = input.slice(-MAX_MESSAGES);
  const reversed: ChatMessage[] = [];
  const seenIds = new Set<string>();
  let totalContentLength = 0;

  for (let index = tail.length - 1; index >= 0; index -= 1) {
    const message = validateStoredChatMessage(tail[index], input.length - tail.length + index);
    if (!message || seenIds.has(message.id)) continue;
    if (totalContentLength + message.content.length > MAX_TOTAL_CONTENT_LENGTH) continue;

    seenIds.add(message.id);
    totalContentLength += message.content.length;
    reversed.push(message);
  }

  if (reversed.length === 0) return null;
  return reversed.reverse();
}
