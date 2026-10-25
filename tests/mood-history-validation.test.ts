import assert from 'node:assert/strict';
import type { MoodRecord } from '../src/types';
import {
  calculateMoodStreak,
  MOOD_HISTORY_LIMITS,
  normalizeMoodNote,
  validateStoredMoodHistory,
} from '../src/services/MoodHistoryValidation.ts';

const now = Date.UTC(2026, 9, 25, 12, 0, 0);
const today = '2026-10-25';
const yesterday = '2026-10-24';
const twoDaysAgo = '2026-10-23';

assert.deepEqual(validateStoredMoodHistory(null, now), []);
assert.deepEqual(validateStoredMoodHistory('not json', now), []);
assert.deepEqual(validateStoredMoodHistory('{"not":"array"}', now), []);

const validRecord = {
  id: 'untrusted-id',
  date: today,
  dayName: 'Fake Day Name',
  mood: 'happy',
  score: 99,
  note: '  Good day\nwith Sara  ',
  habitsCompleted: ['hydration', 'hydration', 'unknown_habit', 'talk_sara', 123],
};
const valid = validateStoredMoodHistory(JSON.stringify([validRecord]), now);
assert.equal(valid.length, 1);
assert.deepEqual(valid[0], {
  id: `mood_${today}`,
  date: today,
  dayName: 'Today',
  mood: 'happy',
  score: 4,
  note: 'Good day with Sara',
  habitsCompleted: ['hydration', 'talk_sara'],
});

const invalidRecords = [
  null,
  'not an object',
  {},
  { date: '2026-02-30', mood: 'happy', habitsCompleted: [] },
  { date: '2026-10-25T00:00:00Z', mood: 'happy', habitsCompleted: [] },
  { date: '2026-10-26', mood: 'happy', habitsCompleted: [] },
  { date: today, mood: 'unexpected', habitsCompleted: [] },
  { date: today, mood: 'happy', score: -500, habitsCompleted: [] },
];
assert.deepEqual(validateStoredMoodHistory(JSON.stringify(invalidRecords), now), []);

assert.equal(normalizeMoodNote('x'.repeat(1000)).length, 500);
assert.equal(normalizeMoodNote('  hello\u0000 world  '), 'hello world');
assert.equal(normalizeMoodNote(123), '');

const duplicateDate = validateStoredMoodHistory(JSON.stringify([
  { date: yesterday, mood: 'calm', note: 'first', habitsCompleted: [] },
  { date: yesterday, mood: 'tired', note: 'last saved', habitsCompleted: ['rest'] },
]), now);
assert.equal(duplicateDate.length, 1);
assert.equal(duplicateDate[0].mood, 'tired');
assert.equal(duplicateDate[0].note, 'last saved');

const manyRecords = Array.from({ length: 400 }, (_, index) => {
  const date = new Date(Date.parse(`${today}T00:00:00.000Z`) - index * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return { date, mood: 'calm', note: `day-${index}`, habitsCompleted: [] };
});
const bounded = validateStoredMoodHistory(JSON.stringify(manyRecords), now);
assert.equal(bounded.length, MOOD_HISTORY_LIMITS.maxRecords);
assert.ok(bounded.length <= 365);
assert.equal(bounded[bounded.length - 1].date, today);

const record = (date: string): MoodRecord => ({
  id: `mood_${date}`,
  date,
  dayName: 'Mon',
  mood: 'calm',
  score: 3,
  note: '',
  habitsCompleted: [],
});
assert.equal(calculateMoodStreak([], now), 0);
assert.equal(calculateMoodStreak([record(twoDaysAgo)], now), 0);
assert.equal(calculateMoodStreak([record(yesterday)], now), 1);
assert.equal(calculateMoodStreak([record(yesterday), record(twoDaysAgo)], now), 2);
assert.equal(calculateMoodStreak([record(today), record(yesterday), record(twoDaysAgo)], now), 3);

console.log('Mood history validation, truthful blank state, date bounds, and streak checks passed.');
