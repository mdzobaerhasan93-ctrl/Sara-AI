import type { MemoryItem } from '../types';

const ALLOWED_CATEGORIES = new Set<MemoryItem['category']>([
  'Personal',
  'Preferences',
  'Projects',
  'Important Dates',
  'Work',
  'Custom',
  'Journal',
]);

const MAX_MEMORIES = 100;
const MAX_CONTENT_LENGTH = 500;
const RESERVED_IDS = new Set(['__proto__', 'prototype', 'constructor']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  if (!/^[a-z0-9_-]{1,80}$/i.test(id) || RESERVED_IDS.has(id.toLowerCase())) return null;
  return id;
}

function cleanContent(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const content = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\r\n?/g, '\n')
    .trim();

  if (!content) return null;
  return Array.from(content).slice(0, MAX_CONTENT_LENGTH).join('');
}

function normalizeCreatedAt(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 60) return null;
  const candidate = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    const date = new Date(`${candidate}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== candidate) return null;
    return candidate;
  }

  const parsed = new Date(candidate);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/** Validates one browser-persisted memory record without trusting its shape. */
export function validateStoredMemory(input: unknown): MemoryItem | null {
  if (!isRecord(input)) return null;

  const id = cleanId(input.id);
  const content = cleanContent(input.content);
  const createdAt = normalizeCreatedAt(input.createdAt);
  const category = typeof input.category === 'string' && ALLOWED_CATEGORIES.has(input.category as MemoryItem['category'])
    ? input.category as MemoryItem['category']
    : null;

  if (!id || !content || !createdAt || !category) return null;

  return {
    id,
    category,
    content,
    createdAt,
    // Unknown or truthy string values must not activate a memory.
    active: input.active === true,
  };
}

/**
 * Returns validated, bounded memories. Empty arrays are valid (users can
 * intentionally delete all memories); malformed collections return null so
 * callers can preserve the safe default list. The first valid ID wins.
 */
export function validateStoredMemories(input: unknown): MemoryItem[] | null {
  if (!Array.isArray(input)) return null;

  const memories: MemoryItem[] = [];
  const seenIds = new Set<string>();

  for (const rawMemory of input.slice(0, MAX_MEMORIES)) {
    const memory = validateStoredMemory(rawMemory);
    if (!memory || seenIds.has(memory.id)) continue;
    seenIds.add(memory.id);
    memories.push(memory);
  }

  if (input.length > 0 && memories.length === 0) return null;
  return memories;
}
