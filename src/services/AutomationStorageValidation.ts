import type { AutomationItem } from '../types';

const MAX_AUTOMATIONS = 100;
const RESERVED_IDS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  'tostring',
  'valueof',
  'hasownproperty',
  'isprototypeof',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function safeId(value: unknown): string | null {
  const id = cleanText(value, 80);
  if (!id) return null;
  const normalized = id.toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(normalized) || RESERVED_IDS.has(normalized)) return null;
  return normalized;
}

/**
 * Validates a single persisted automation. Unknown/non-boolean enabled values
 * are disabled rather than treated as truthy; optional malformed time metadata
 * is discarded so it cannot affect scheduling.
 */
export function validateStoredAutomation(input: unknown): AutomationItem | null {
  if (!isRecord(input)) return null;

  const id = safeId(input.id);
  const name = cleanText(input.name, 120);
  const trigger = cleanText(input.trigger, 60);
  const schedule = cleanText(input.schedule, 120);
  const action = cleanText(input.action, 1_000);
  if (!id || !name || !trigger || !schedule || !action) return null;

  const item: AutomationItem = {
    id,
    name,
    trigger,
    schedule,
    action,
    enabled: input.enabled === true,
  };

  if (input.category !== undefined) {
    const category = cleanText(input.category, 80);
    if (category) item.category = category;
  }

  if (input.lastRun !== undefined) {
    const lastRun = cleanText(input.lastRun, 160);
    if (lastRun) item.lastRun = lastRun;
  }

  if (input.targetTime !== undefined) {
    if (typeof input.targetTime === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.targetTime)) {
      item.targetTime = input.targetTime;
    }
  }

  if (input.targetTimestamp !== undefined) {
    if (
      typeof input.targetTimestamp === 'number' &&
      Number.isSafeInteger(input.targetTimestamp) &&
      input.targetTimestamp >= 0 &&
      input.targetTimestamp <= 8_640_000_000_000_000
    ) {
      item.targetTimestamp = input.targetTimestamp;
    }
  }

  return item;
}

/**
 * Validates localStorage-derived data and returns the first occurrence of each
 * valid ID. Returns null for a malformed non-array or a non-empty array with no
 * usable entries, allowing callers to fall back to safe defaults. An empty
 * array remains a valid user choice.
 */
export function validateStoredAutomations(input: unknown): AutomationItem[] | null {
  if (!Array.isArray(input)) return null;

  const result: AutomationItem[] = [];
  const seenIds = new Set<string>();

  for (const rawItem of input.slice(0, MAX_AUTOMATIONS)) {
    const item = validateStoredAutomation(rawItem);
    if (!item || seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push(item);
  }

  if (input.length > 0 && result.length === 0) return null;
  return result;
}
