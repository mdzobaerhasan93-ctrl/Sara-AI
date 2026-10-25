import type { AppPermissions } from '../types';

const ALLOWED_MICROPHONE_LOCATION = new Set(['granted', 'denied', 'prompt']);
const ALLOWED_NOTIFICATIONS = new Set(['granted', 'denied', 'default']);

const ALLOWED_GESTURES = new Set([
  'wave',
  'heart',
  'thumbs_up',
  'peace',
  'fist',
]);

const ALLOWED_GESTURE_TARGETS = new Set([
  'open_chat',
  'romantic_mode',
  'toggle_lights',
  'open_wardrobe',
  'app_instagram',
  'app_youtube',
  'app_facebook',
]);

export const DEFAULT_APP_PERMISSIONS: AppPermissions = {
  microphone: 'prompt',
  location: 'prompt',
  notifications: 'default',
  wakeWord: true,
  persistentMemory: true,
  audioPlayback: true,
  floatingOverlay: true,
};

export const DEFAULT_GESTURE_MAPPINGS: Record<string, string> = {
  wave: 'open_chat',
  heart: 'romantic_mode',
  thumbs_up: 'toggle_lights',
  peace: 'open_wardrobe',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Normalizes persisted app permission UI state. These values describe app
 * settings; they do not grant browser/device permissions by themselves.
 */
export function normalizeAppPermissions(
  input: unknown,
  fallback: AppPermissions = DEFAULT_APP_PERMISSIONS,
): AppPermissions {
  if (!isRecord(input)) return { ...fallback };

  const microphone = typeof input.microphone === 'string' && ALLOWED_MICROPHONE_LOCATION.has(input.microphone)
    ? input.microphone as AppPermissions['microphone']
    : fallback.microphone;

  const location = typeof input.location === 'string' && ALLOWED_MICROPHONE_LOCATION.has(input.location)
    ? input.location as AppPermissions['location']
    : fallback.location;

  const notifications = typeof input.notifications === 'string' && ALLOWED_NOTIFICATIONS.has(input.notifications)
    ? input.notifications as AppPermissions['notifications']
    : fallback.notifications;

  return {
    microphone,
    location,
    notifications,
    wakeWord: typeof input.wakeWord === 'boolean' ? input.wakeWord : fallback.wakeWord,
    persistentMemory: typeof input.persistentMemory === 'boolean' ? input.persistentMemory : fallback.persistentMemory,
    audioPlayback: typeof input.audioPlayback === 'boolean' ? input.audioPlayback : fallback.audioPlayback,
    floatingOverlay: typeof input.floatingOverlay === 'boolean' ? input.floatingOverlay : fallback.floatingOverlay,
  };
}

function safeGestureKey(value: string): string | null {
  const key = value.trim().toLowerCase();
  return ALLOWED_GESTURES.has(key) ? key : null;
}

function safeGestureTarget(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const target = value.trim().toLowerCase();
  return ALLOWED_GESTURE_TARGETS.has(target) ? target : null;
}

/**
 * Only known gesture names and target IDs can be restored. The caller's
 * previous map is the fallback for invalid entries so one malformed custom
 * assignment does not wipe valid mappings.
 */
export function normalizeGestureMappings(
  input: unknown,
  fallback: Record<string, string> = DEFAULT_GESTURE_MAPPINGS,
): Record<string, string> {
  const result: Record<string, string> = Object.create(null) as Record<string, string>;

  for (const allowedKey of ALLOWED_GESTURES) {
    const fallbackTarget = safeGestureTarget(fallback?.[allowedKey])
      || safeGestureTarget(DEFAULT_GESTURE_MAPPINGS[allowedKey]);
    if (fallbackTarget) result[allowedKey] = fallbackTarget;
  }

  if (!isRecord(input)) return result;

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = safeGestureKey(rawKey);
    const target = safeGestureTarget(rawValue);
    if (!key || !target) continue;
    result[key] = target;
  }

  return result;
}
