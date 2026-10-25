import type { AppDefinition, InAppAction } from './AppInventoryService';

const ALLOWED_CATEGORIES = new Set([
  'social',
  'video',
  'chat',
  'camera',
  'productivity',
  'system',
]);

const RESERVED_IDS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  'tostring',
  'valueof',
  'hasownproperty',
  'isprototypeof',
  'propertyisenumerable',
  '__definegetter__',
  '__definesetter__',
  '__lookupgetter__',
  '__lookupsetter__',
]);

const MAX_SAVED_APPS = 100;
const MAX_ACTIONS_PER_APP = 20;
const MAX_STEPS_PER_ACTION = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeText(value: unknown, limit: number, allowEmpty = false): string | null {
  if (typeof value !== 'string') return null;
  const normalized = Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length > limit) return null;
  if (!normalized && !allowEmpty) return null;
  return normalized;
}

function safeId(value: unknown): string | null {
  const raw = safeText(value, 80);
  if (!raw) return null;
  const id = raw.toLowerCase();
  if (!/^[a-z0-9_\-\u0980-\u09ff]{1,80}$/.test(id) || RESERVED_IDS.has(id)) return null;
  return id;
}

export function createSafeAppId(nameInput: string): string {
  const name = safeText(nameInput, 160);
  if (!name) return '';
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9_\-\u0980-\u09ff]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return RESERVED_IDS.has(slug) ? '' : slug;
}

function validateAction(input: unknown): InAppAction | null {
  if (!isRecord(input)) return null;

  const id = safeId(input.id);
  const name = safeText(input.name, 100);
  const bengaliName = safeText(input.bengaliName, 100);
  const description = safeText(input.description, 400);
  if (!id || !name || !bengaliName || !description) return null;

  if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > MAX_STEPS_PER_ACTION) {
    return null;
  }

  const steps: string[] = [];
  for (const rawStep of input.steps) {
    const step = safeText(rawStep, 300);
    if (!step) return null;
    steps.push(step);
  }

  if (input.requiresInput !== undefined && typeof input.requiresInput !== 'boolean') return null;

  const action: InAppAction = {
    id,
    name,
    bengaliName,
    description,
    steps,
  };

  if (input.iconName !== undefined) {
    const iconName = safeText(input.iconName, 60);
    if (!iconName || !/^[a-z0-9-]+$/i.test(iconName)) return null;
    action.iconName = iconName;
  }

  if (input.requiresInput !== undefined) action.requiresInput = input.requiresInput;

  if (input.inputPlaceholder !== undefined) {
    const placeholder = safeText(input.inputPlaceholder, 200, true);
    if (placeholder === null) return null;
    action.inputPlaceholder = placeholder;
  }

  if (input.defaultPayload !== undefined) {
    const defaultPayload = safeText(input.defaultPayload, 500, true);
    if (defaultPayload === null) return null;
    action.defaultPayload = defaultPayload;
  }

  return action;
}

/** Validate and copy an untrusted, browser-persisted app definition. */
export function validateAppDefinition(input: unknown): AppDefinition | null {
  if (!isRecord(input)) return null;

  const id = safeId(input.id);
  const name = safeText(input.name, 100);
  const bengaliName = safeText(input.bengaliName, 100);
  const packageName = safeText(input.packageName, 160);
  const launchUri = safeText(input.launchUri, 2048, true);
  const webFallbackUrl = safeText(input.webFallbackUrl, 2048, true);
  const category = typeof input.category === 'string' && ALLOWED_CATEGORIES.has(input.category)
    ? input.category as AppDefinition['category']
    : null;
  const iconColor = safeText(input.iconColor, 7);
  const accentBg = safeText(input.accentBg, 160);

  if (!id || !name || !bengaliName || !packageName || launchUri === null || webFallbackUrl === null) {
    return null;
  }
  if (!category || !iconColor || !/^#[0-9a-f]{6}$/i.test(iconColor)) return null;
  if (!accentBg || !/^[a-z0-9_\-:/ .]+$/i.test(accentBg)) return null;
  if (!Array.isArray(input.actions) || input.actions.length < 1 || input.actions.length > MAX_ACTIONS_PER_APP) {
    return null;
  }

  const actions: InAppAction[] = [];
  for (const rawAction of input.actions) {
    const action = validateAction(rawAction);
    if (!action) return null;
    actions.push(action);
  }

  return {
    id,
    name,
    bengaliName,
    packageName,
    launchUri,
    webFallbackUrl,
    category,
    iconColor,
    accentBg,
    actions,
  };
}

/**
 * Merge storage into the built-in registry without permitting saved records to
 * replace built-ins, prototype keys, malformed entries, or unbounded arrays.
 * Legacy object-map storage is rejected; the app persists an array.
 */
export function mergeSavedApps(
  builtIns: Record<string, AppDefinition>,
  storedValue: unknown,
): Record<string, AppDefinition> {
  const registry = Object.assign(Object.create(null), builtIns) as Record<string, AppDefinition>;
  if (!Array.isArray(storedValue)) return registry;

  for (const input of storedValue.slice(0, MAX_SAVED_APPS)) {
    const app = validateAppDefinition(input);
    if (!app) continue;
    if (Object.prototype.hasOwnProperty.call(builtIns, app.id)) continue;
    if (Object.prototype.hasOwnProperty.call(registry, app.id)) continue;
    registry[app.id] = app;
  }

  return registry;
}
