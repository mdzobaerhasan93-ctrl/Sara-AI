import assert from 'node:assert/strict';
import {
  buildFallbackDailyAffirmation,
  normalizeDailyAffirmationResult,
  validateDailyAffirmationRequest,
} from '../src/services/DailyAffirmationValidation.ts';

const defaults = validateDailyAffirmationRequest({});
assert.equal(defaults.success, true);
if (defaults.success) {
  assert.equal(defaults.data.userName, 'বাবু');
  assert.equal(defaults.data.loveMode, true);
  assert.equal(defaults.data.timeOfDay, 'morning');
}

const validRequest = validateDailyAffirmationRequest({
  userName: '  Zobaer\nHasan  ',
  loveMode: false,
  timeOfDay: 'evening',
});
assert.equal(validRequest.success, true);
if (validRequest.success) {
  assert.equal(validRequest.data.userName, 'Zobaer Hasan');
  assert.equal(validRequest.data.loveMode, false);
  assert.equal(validRequest.data.timeOfDay, 'evening');
}

const invalidRequests: unknown[] = [
  null,
  [],
  'not an object',
  { userName: 123 },
  { userName: 'x'.repeat(61) },
  { userName: 'name\u0000injected' },
  { loveMode: 'false' },
  { loveMode: [] },
  { timeOfDay: 'midnight-ish' },
  { timeOfDay: 12 },
];
for (const input of invalidRequests) {
  assert.equal(validateDailyAffirmationRequest(input).success, false);
}

const validModelOutput = normalizeDailyAffirmationResult({
  quoteBn: '  আজ তুমি নিজের প্রতি বিশ্বাস রাখবে।\nছোট পদক্ষেপও গুরুত্বপূর্ণ।  ',
  quoteEn: 'Believe in yourself today.',
  greeting: 'শুভ সকাল সোনা!',
  emotion: 'romantic',
  tag: 'Hope & Growth',
  audioScript: 'আজ নিজের প্রতি বিশ্বাস রাখো।',
});
assert.ok(validModelOutput);
assert.equal(validModelOutput?.quoteBn, 'আজ তুমি নিজের প্রতি বিশ্বাস রাখবে। ছোট পদক্ষেপও গুরুত্বপূর্ণ।');
assert.equal(validModelOutput?.quoteEn, 'Believe in yourself today.');
assert.equal(validModelOutput?.emotion, 'romantic');

const missingQuote = normalizeDailyAffirmationResult({
  quoteEn: 'Only English, no required Bengali quote.',
});
assert.equal(missingQuote, null);

const emptyQuote = normalizeDailyAffirmationResult({ quoteBn: '   ' });
assert.equal(emptyQuote, null);

const overlongQuote = normalizeDailyAffirmationResult({ quoteBn: 'x'.repeat(3001) });
assert.equal(overlongQuote, null);

const invalidOptionalFields = normalizeDailyAffirmationResult({
  quoteBn: 'সুন্দর একটি দিন হোক।',
  quoteEn: 42,
  greeting: {},
  emotion: 'system',
  tag: ['not a string'],
  audioScript: null,
});
assert.ok(invalidOptionalFields);
assert.equal(invalidOptionalFields?.quoteEn, '');
assert.equal(invalidOptionalFields?.greeting, '');
assert.equal(invalidOptionalFields?.emotion, 'caring');
assert.equal(invalidOptionalFields?.tag, 'Daily Affirmation');
assert.equal(invalidOptionalFields?.audioScript, 'সুন্দর একটি দিন হোক।');

const eveningFallback = buildFallbackDailyAffirmation('Zobaer', true, 'evening');
assert.match(eveningFallback.greeting, /শুভ সন্ধ্যা/);
assert.equal(eveningFallback.emotion, 'romantic');
assert.match(eveningFallback.tag, /Love/);
assert.match(eveningFallback.audioScript, /শুভ সন্ধ্যা/);

const nightGentleFallback = buildFallbackDailyAffirmation('  Zobaer\nHasan  ', false, 'night');
assert.match(nightGentleFallback.greeting, /শুভ রাত্রি Zobaer Hasan/);
assert.equal(nightGentleFallback.emotion, 'caring');
assert.equal(nightGentleFallback.tag, 'Care & Hope');
assert.doesNotMatch(nightGentleFallback.quoteBn, /সোনা/);
assert.match(nightGentleFallback.audioScript, /শুভ রাত্রি/);

const dailyFallback = buildFallbackDailyAffirmation('User', false, 'daily');
assert.match(dailyFallback.greeting, /দিনের জন্য/);

console.log('Daily affirmation request and model output validation checks passed.');
