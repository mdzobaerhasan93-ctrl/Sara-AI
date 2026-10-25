const ALLOWED_ACTIONS = new Set([
  'send_email',
  'create_calendar_event',
  'github_action',
  'deploy_project',
  'launch_app',
]);

const MAX_PROPOSAL_LENGTH = 12_000;
const MAX_DETAIL_KEYS = 20;
const MAX_TEXT_LENGTH = 2_000;
const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export type SafeDetailValue =
  | string
  | number
  | boolean
  | null
  | SafeDetailValue[]
  | { [key: string]: SafeDetailValue };

export interface ValidatedActionProposal {
  action: string;
  service: string;
  title: string;
  risk: 'low' | 'medium' | 'high';
  details: Record<string, SafeDetailValue>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sanitizeDetailValue(value: unknown, depth = 0): SafeDetailValue | undefined {
  if (depth > 3) return undefined;

  if (typeof value === 'string') {
    return Array.from(value)
      .filter((character) => {
        const code = character.charCodeAt(0);
        return code === 9 || code === 10 || code === 13 || code >= 32;
      })
      .join('')
      .slice(0, MAX_TEXT_LENGTH);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    const result: SafeDetailValue[] = [];
    for (const entry of value.slice(0, MAX_DETAIL_KEYS)) {
      const safeValue = sanitizeDetailValue(entry, depth + 1);
      if (safeValue !== undefined) result.push(safeValue);
    }
    return result;
  }

  if (!isRecord(value)) return undefined;
  const result: Record<string, SafeDetailValue> = {};
  for (const [key, entry] of Object.entries(value).slice(0, MAX_DETAIL_KEYS)) {
    if (BLOCKED_KEYS.has(key) || !/^[A-Za-z0-9_.-]{1,64}$/.test(key)) continue;
    const safeValue = sanitizeDetailValue(entry, depth + 1);
    if (safeValue !== undefined) result[key] = safeValue;
  }
  return result;
}

/**
 * Validates and bounds an AI-proposed action before it is exposed to the UI
 * approval queue. Unknown actions are rejected because they have no registered
 * executor in the current application.
 */
export function validateActionProposal(input: unknown): ValidatedActionProposal | null {
  if (typeof input !== 'string' || input.length > MAX_PROPOSAL_LENGTH) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  const action = typeof parsed.action === 'string' ? parsed.action.trim() : '';
  const service = typeof parsed.service === 'string' ? parsed.service.trim() : '';
  const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
  if (!ALLOWED_ACTIONS.has(action) || !service || service.length > 100 || !title || title.length > 200) {
    return null;
  }

  const risk = parsed.risk === 'low' || parsed.risk === 'medium' || parsed.risk === 'high'
    ? parsed.risk
    : 'medium';

  if (parsed.details !== undefined && !isRecord(parsed.details)) return null;
  const untrustedDetails = (parsed.details ?? {}) as Record<string, unknown>;
  const details = sanitizeDetailValue(untrustedDetails);
  if (!details || Array.isArray(details) || typeof details !== 'object') return null;

  return {
    action,
    service,
    title,
    risk,
    details: details as Record<string, SafeDetailValue>,
  };
}
