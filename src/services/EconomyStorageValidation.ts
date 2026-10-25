const MAX_COIN_BALANCE = 1_000_000;
const MAX_ADS_WATCHED_PER_DAY = 5;
const MAX_DAILY_STREAK = 7;
const DEFAULT_COIN_BALANCE = 110;
const DEFAULT_ADS_WATCHED = 5;
const DEFAULT_DAILY_STREAK = 1;
const DEFAULT_PASS_DURATION_MS = 5.65 * 60 * 60 * 1000;
const MAX_FUTURE_PASS_MS = 90 * 24 * 60 * 60 * 1000;

function parseStrictInteger(value: string | null): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function validateStoredCoinBalance(
  value: string | null,
  fallback = DEFAULT_COIN_BALANCE,
): number {
  if (value === null) return fallback;
  const parsed = parseStrictInteger(value);
  return parsed !== null && parsed <= MAX_COIN_BALANCE ? parsed : fallback;
}

export function validateStoredAdsWatched(
  value: string | null,
  fallback = DEFAULT_ADS_WATCHED,
): number {
  if (value === null) return fallback;
  const parsed = parseStrictInteger(value);
  return parsed !== null && parsed <= MAX_ADS_WATCHED_PER_DAY ? parsed : fallback;
}

export function validateStoredDailyStreak(
  value: string | null,
  fallback = DEFAULT_DAILY_STREAK,
): number {
  if (value === null) return fallback;
  const parsed = parseStrictInteger(value);
  return parsed !== null && parsed >= 1 && parsed <= MAX_DAILY_STREAK ? parsed : fallback;
}

/**
 * Daily claim dates are stored in Date.toDateString() format. Reject malformed
 * and future values so arbitrary localStorage strings can't lock or spoof the
 * daily reward UI. This remains client-side UI state, not a trusted economy.
 */
export function validateStoredLastClaimDate(value: string | null, nowMs = Date.now()): string {
  if (!value) return '';
  if (value.length > 40 || !Number.isFinite(nowMs)) return '';

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return '';
  if (new Date(parsed).toDateString() !== value) return '';
  if (parsed > nowMs + 24 * 60 * 60 * 1000) return '';

  return value;
}

/**
 * Missing pass expiry retains the app's existing short trial-pass default.
 * A malformed stored expiry fails closed by expiring immediately rather than
 * granting a fresh pass or accepting an arbitrarily distant timestamp.
 */
export function validateStoredPassExpiry(value: string | null, nowMs = Date.now()): number {
  if (!Number.isFinite(nowMs)) return 0;
  if (value === null) return nowMs + DEFAULT_PASS_DURATION_MS;

  const parsed = parseStrictInteger(value);
  if (parsed === null || parsed > nowMs + MAX_FUTURE_PASS_MS) return nowMs;

  return parsed;
}

export const ECONOMY_STORAGE_LIMITS = {
  maxCoinBalance: MAX_COIN_BALANCE,
  maxAdsWatchedPerDay: MAX_ADS_WATCHED_PER_DAY,
  maxDailyStreak: MAX_DAILY_STREAK,
  maxFuturePassDays: 90,
} as const;
