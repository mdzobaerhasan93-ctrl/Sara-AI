import type { CoinTransaction } from '../types';

const MAX_TRANSACTIONS = 100;
const MAX_SCAN_ITEMS = 500;
const MAX_TITLE_LENGTH = 160;
const MAX_TIMESTAMP_LENGTH = 80;
const MAX_TRANSACTION_AMOUNT = 1_000_000;
const TRANSACTION_TYPES = new Set<CoinTransaction['type']>([
  'daily_reward',
  'rewarded_ad',
  'pass_purchase',
  'referral',
]);
const RESERVED_IDS = new Set(['__proto__', 'prototype', 'constructor', 'tostring', 'valueof']);

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
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
  if (RESERVED_IDS.has(id.toLowerCase())) return null;
  return id;
}

export function validateStoredCoinTransaction(input: unknown): CoinTransaction | null {
  if (!isRecord(input)) return null;

  const id = safeId(input.id);
  const title = cleanText(input.title, MAX_TITLE_LENGTH);
  const timestamp = cleanText(input.timestamp, MAX_TIMESTAMP_LENGTH);
  const amount = input.amount;
  if (!id || !title || !timestamp) return null;
  if (typeof amount !== 'number' || !Number.isSafeInteger(amount)) return null;
  if (amount < -MAX_TRANSACTION_AMOUNT || amount > MAX_TRANSACTION_AMOUNT) return null;
  if (typeof input.type !== 'string' || !TRANSACTION_TYPES.has(input.type as CoinTransaction['type'])) return null;

  return {
    id,
    title,
    amount,
    type: input.type as CoinTransaction['type'],
    timestamp,
  };
}

/**
 * Reads transaction history written by local UI actions. This validates local
 * storage for integrity and display safety; it is not a server-authoritative
 * financial ledger and does not verify external purchases or rewarded ads.
 */
export function validateStoredCoinTransactions(value: string | null): CoinTransaction[] {
  if (value === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const result: CoinTransaction[] = [];
  const seen = new Set<string>();

  for (const entry of parsed.slice(0, MAX_SCAN_ITEMS)) {
    const transaction = validateStoredCoinTransaction(entry);
    if (!transaction || seen.has(transaction.id)) continue;
    seen.add(transaction.id);
    result.push(transaction);
    if (result.length >= MAX_TRANSACTIONS) break;
  }

  return result;
}
