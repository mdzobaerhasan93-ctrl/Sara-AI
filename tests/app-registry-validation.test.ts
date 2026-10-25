import assert from 'node:assert/strict';
import {
  createSafeAppId,
  mergeSavedApps,
  validateAppDefinition,
} from '../src/services/AppRegistryValidation.ts';

const validApp = {
  id: 'custom_tool',
  name: 'Custom Tool',
  bengaliName: 'কাস্টম টুল',
  packageName: 'com.example.custom',
  launchUri: 'customtool://open',
  webFallbackUrl: 'https://example.com',
  category: 'productivity',
  iconColor: '#EC4899',
  accentBg: 'from-pink-600/30 to-purple-600/20',
  actions: [{
    id: 'launch_and_control',
    name: 'Open Tool',
    bengaliName: 'টুল খোলো',
    description: 'Open the registered app',
    requiresInput: false,
    steps: ['Request launch', 'Await native confirmation'],
  }],
};

const validated = validateAppDefinition(validApp);
assert.ok(validated);
assert.equal(validated?.id, 'custom_tool');
assert.equal(validated?.actions.length, 1);
assert.deepEqual(validated?.actions[0].steps, ['Request launch', 'Await native confirmation']);

assert.equal(createSafeAppId(' New App @@ '), 'new_app');
assert.equal(createSafeAppId('আমার অ্যাপ'), 'আমার_অ্যাপ');
assert.equal(createSafeAppId('constructor'), '');
assert.equal(createSafeAppId('!!!'), '');

const invalidApps: unknown[] = [
  null,
  [],
  {},
  { ...validApp, id: '__proto__' },
  { ...validApp, id: 'constructor' },
  { ...validApp, id: 'bad/id' },
  { ...validApp, name: 'x'.repeat(101) },
  { ...validApp, bengaliName: 123 },
  { ...validApp, packageName: 'x'.repeat(161) },
  { ...validApp, launchUri: 'x'.repeat(2049) },
  { ...validApp, webFallbackUrl: 'x'.repeat(2049) },
  { ...validApp, category: 'system-command' },
  { ...validApp, iconColor: 'url(javascript:alert(1))' },
  { ...validApp, accentBg: '<script>alert(1)</script>' },
  { ...validApp, actions: [] },
  { ...validApp, actions: Array.from({ length: 21 }, () => validApp.actions[0]) },
  { ...validApp, actions: [{ ...validApp.actions[0], id: '__proto__' }] },
  { ...validApp, actions: [{ ...validApp.actions[0], requiresInput: 'yes' }] },
  { ...validApp, actions: [{ ...validApp.actions[0], steps: [] }] },
  { ...validApp, actions: [{ ...validApp.actions[0], steps: Array.from({ length: 13 }, () => 'step') }] },
  { ...validApp, actions: [{ ...validApp.actions[0], defaultPayload: 'x'.repeat(501) }] },
];

for (const app of invalidApps) {
  assert.equal(validateAppDefinition(app), null, 'Invalid app definitions must be rejected');
}

const builtIn = {
  ...validApp,
  id: 'instagram',
  name: 'Instagram',
  bengaliName: 'ইনস্টাগ্রাম',
  packageName: 'com.instagram.android',
  launchUri: 'instagram://app',
  webFallbackUrl: 'https://www.instagram.com',
};
const base = { instagram: builtIn };

const merged = mergeSavedApps(base, [
  validApp,
  { ...validApp, id: 'instagram', name: 'Overwritten Instagram' },
  { ...validApp, id: '__proto__', name: 'Prototype payload' },
  { ...validApp, id: 'other_custom', name: 'Other Custom' },
  { ...validApp, id: 'other_custom', name: 'Duplicate Custom' },
  { ...validApp, id: 'broken', actions: [{ id: 'launch', name: 'No steps' }] },
]);

assert.equal(merged.instagram.name, 'Instagram', 'Stored data must not overwrite built-in apps');
assert.equal(merged.custom_tool.name, 'Custom Tool');
assert.equal(merged.other_custom.name, 'Other Custom', 'First valid custom ID should win');
assert.equal(Object.prototype.hasOwnProperty.call(merged, '__proto__'), false);
assert.equal(Object.prototype.hasOwnProperty.call(merged, 'broken'), false);
assert.equal(Object.getPrototypeOf(merged), null, 'Registry should not inherit prototype keys');

const legacyObjectMap = mergeSavedApps(base, { custom_tool: validApp });
assert.deepEqual(Object.keys(legacyObjectMap), ['instagram'], 'Unexpected object-map storage should be ignored');

const manyApps = Array.from({ length: 120 }, (_, index) => ({
  ...validApp,
  id: `tool_${index}`,
  name: `Tool ${index}`,
}));
const bounded = mergeSavedApps(base, manyApps);
assert.equal(Object.keys(bounded).length, 101, 'Only the first 100 custom app records may be loaded');
assert.equal(Object.prototype.hasOwnProperty.call(bounded, 'tool_99'), true);
assert.equal(Object.prototype.hasOwnProperty.call(bounded, 'tool_100'), false);

console.log('Custom app registry validation, built-in protection, and storage bounds checks passed.');
