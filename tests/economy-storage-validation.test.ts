import assert from 'node:assert/strict';
import {
  ECONOMY_STORAGE_LIMITS,
  validateStoredAdsWatched,
  validateStoredCoinBalance,
  validateStoredDailyStreak,
  validateStoredLastClaimDate,
  validateStoredPassExpiry,
} from '../src/services/EconomyStorageValidation.ts';

const now = new Date(2026, 9, 25, 12, 0, 0, 0).getTime();
const today = new Date(now).toDateString();
const yesterdayDate = new Date(now);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = yesterdayDate.toDateString();
const tomorrowDate = new Date(now);
tomorrowDate.setDate(tomorrowDate.getDate() + 2);
const futureDate = tomorrowDate.toDateString();

assert.equal(validateStoredCoinBalance(null), 110);
assert.equal(validateStoredCoinBalance('0'), 0);
assert.equal(validateStoredCoinBalance('110'), 110);
assert.equal(validateStoredCoinBalance('1000000'), 1_000_000);
for (const value of ['-1', '1.5', '12coins', 'Infinity', '1000001', '999999999999999999999999', '']) {
  assert.equal(validateStoredCoinBalance(value), 110, `Invalid coin balance should fallback: ${value}`);
}

assert.equal(validateStoredAdsWatched(null), 5);
assert.equal(validateStoredAdsWatched('0'), 0);
assert.equal(validateStoredAdsWatched('5'), 5);
for (const value of ['-1', '6', '2.5', '5ads', 'NaN', '999999']) {
  assert.equal(validateStoredAdsWatched(value), 5);
}

assert.equal(validateStoredDailyStreak(null), 1);
for (let day = 1; day <= 7; day += 1) {
  assert.equal(validateStoredDailyStreak(String(day)), day);
}
for (const value of ['0', '8', '-3', '2.5', 'NaN', 'day7']) {
  assert.equal(validateStoredDailyStreak(value), 1);
}

assert.equal(validateStoredLastClaimDate(null, now), '');
assert.equal(validateStoredLastClaimDate('', now), '');
assert.equal(validateStoredLastClaimDate(today, now), today);
assert.equal(validateStoredLastClaimDate(yesterday, now), yesterday);
assert.equal(validateStoredLastClaimDate(futureDate, now), '');
assert.equal(validateStoredLastClaimDate('not a date', now), '');
assert.equal(validateStoredLastClaimDate('2026-10-25', now), '', 'Only canonical Date.toDateString values are accepted');
assert.equal(validateStoredLastClaimDate('x'.repeat(100), now), '');

assert.equal(validateStoredPassExpiry(null, now), now + 5.65 * 60 * 60 * 1000);
assert.equal(validateStoredPassExpiry('0', now), 0);
assert.equal(validateStoredPassExpiry(String(now + 6 * 60 * 60 * 1000), now), now + 6 * 60 * 60 * 1000);
assert.equal(validateStoredPassExpiry(String(now - 60_000), now), now - 60_000);
assert.equal(validateStoredPassExpiry('invalid', now), now);
assert.equal(validateStoredPassExpiry('NaN', now), now);
assert.equal(validateStoredPassExpiry(String(now + 91 * 24 * 60 * 60 * 1000), now), now);

assert.equal(ECONOMY_STORAGE_LIMITS.maxCoinBalance, 1_000_000);
assert.equal(ECONOMY_STORAGE_LIMITS.maxAdsWatchedPerDay, 5);
assert.equal(ECONOMY_STORAGE_LIMITS.maxDailyStreak, 7);

console.log('Economy storage validation checks passed.');
