import type { MoodRecord, MoodType } from '../types';

const MAX_RECORDS = 365;
const MAX_SCAN_ITEMS = 1000;
const MAX_NOTE_LENGTH = 500;
const MAX_HABITS_PER_RECORD = 5;
const VALID_MOODS = new Set<MoodType>(['radiant', 'happy', 'calm', 'tired', 'stressed']);
const MOOD_SCORES: Record<MoodType, number> = {
  radiant: 5,
  happy: 4,
  calm: 3,
  tired: 2,
  stressed: 1,
};
const VALID_HABITS = new Set(['talk_sara', 'hydration', 'exercise', 'learning', 'rest']);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseCanonicalDate(value: unknown): string | null {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return value;
}

export function normalizeMoodNote(value: unknown): string {
  if (typeof value !== 'string') return '';
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}

function normalizeHabits(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of value.slice(0, 100)) {
    if (typeof item !== 'string') continue;
    const habitId = item.trim();
    if (!VALID_HABITS.has(habitId) || seen.has(habitId)) continue;
    seen.add(habitId);
    result.push(habitId);
    if (result.length >= MAX_HABITS_PER_RECORD) break;
  }
  return result;
}

function normalizeMoodRecord(input: unknown, today: string): MoodRecord | null {
  if (!isRecord(input)) return null;
  const date = parseCanonicalDate(input.date);
  if (!date || date > today) return null;
  if (typeof input.mood !== 'string' || !VALID_MOODS.has(input.mood as MoodType)) return null;

  return {
    id: `mood_${date}`,
    date,
    dayName: date === today ? 'Today' : WEEKDAYS[new Date(`${date}T00:00:00.000Z`).getUTCDay()],
    mood: input.mood as MoodType,
    // Keep the score consistent with the selected mood rather than trusting
    // arbitrary stored numbers that could distort charts.
    score: MOOD_SCORES[input.mood as MoodType],
    note: normalizeMoodNote(input.note),
    habitsCompleted: normalizeHabits(input.habitsCompleted),
  };
}

/**
 * Validates persisted check-ins; it never invents historical mood or habit data.
 * Only recognized moods, dates and habit IDs are retained.
 */
export function validateStoredMoodHistory(value: string | null, nowMs = Date.now()): MoodRecord[] {
  if (value === null || !Number.isFinite(nowMs)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const today = new Date(nowMs).toISOString().slice(0, 10);
  const cutoffDate = new Date(Date.parse(`${today}T00:00:00.000Z`) - (MAX_RECORDS - 1) * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const byDate = new Map<string, MoodRecord>();

  for (const item of parsed.slice(-MAX_SCAN_ITEMS)) {
    const record = normalizeMoodRecord(item, today);
    if (!record || record.date < cutoffDate) continue;
    // Later duplicate entries take precedence, preserving the latest saved
    // state for a given date.
    byDate.set(record.date, record);
  }

  return [...byDate.values()]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-MAX_RECORDS);
}

export function calculateMoodStreak(records: MoodRecord[], nowMs = Date.now()): number {
  if (!Number.isFinite(nowMs)) return 0;
  const knownDates = new Set(records.map((record) => record.date));
  let cursor = new Date(nowMs);
  cursor.setUTCHours(0, 0, 0, 0);

  let currentDate = cursor.toISOString().slice(0, 10);
  if (!knownDates.has(currentDate)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    currentDate = cursor.toISOString().slice(0, 10);
    if (!knownDates.has(currentDate)) return 0;
  }

  let streak = 0;
  while (knownDates.has(currentDate) && streak < MAX_RECORDS) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    currentDate = cursor.toISOString().slice(0, 10);
  }

  return streak;
}

export const MOOD_HISTORY_LIMITS = {
  maxRecords: MAX_RECORDS,
  maxNoteLength: MAX_NOTE_LENGTH,
  maxHabitsPerRecord: MAX_HABITS_PER_RECORD,
} as const;
