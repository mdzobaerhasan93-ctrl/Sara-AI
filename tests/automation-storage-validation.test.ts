import assert from 'node:assert/strict';
import {
  validateStoredAutomation,
  validateStoredAutomations,
} from '../src/services/AutomationStorageValidation.ts';

const validAutomation = {
  id: 'auto_42',
  name: 'Hydration reminder',
  trigger: 'Interval',
  schedule: 'Every 2 Hours',
  action: 'Gentle hydration prompt',
  enabled: true,
  category: 'Health',
  targetTime: '08:30',
  targetTimestamp: 1_900_000_000_000,
  lastRun: 'Yesterday at 08:00 AM',
};

const valid = validateStoredAutomation(validAutomation);
assert.ok(valid);
assert.deepEqual(valid, validAutomation);

const invalidInputs: unknown[] = [
  null,
  [],
  'not an object',
  {},
  { ...validAutomation, id: '__proto__' },
  { ...validAutomation, id: 'constructor' },
  { ...validAutomation, id: 'invalid/id' },
  { ...validAutomation, id: 'x'.repeat(81) },
  { ...validAutomation, name: 42 },
  { ...validAutomation, name: 'x'.repeat(121) },
  { ...validAutomation, trigger: '' },
  { ...validAutomation, schedule: {} },
  { ...validAutomation, action: 'x'.repeat(1001) },
];

for (const input of invalidInputs) {
  assert.equal(validateStoredAutomation(input), null, 'Malformed automation records must be rejected');
}

const invalidBoolean = validateStoredAutomation({
  ...validAutomation,
  enabled: 'true',
  targetTime: '25:99',
  targetTimestamp: '1900000000000',
  lastRun: {},
});
assert.ok(invalidBoolean);
assert.equal(invalidBoolean?.enabled, false, 'Truthily typed strings must never enable an automation');
assert.equal(invalidBoolean?.targetTime, undefined);
assert.equal(invalidBoolean?.targetTimestamp, undefined);
assert.equal(invalidBoolean?.lastRun, undefined);

const withControlCharacters = validateStoredAutomation({
  ...validAutomation,
  name: 'Hydration\u0000 reminder',
  action: 'Gentle\u0007 reminder',
});
assert.ok(withControlCharacters);
assert.equal(withControlCharacters?.name, 'Hydration reminder');
assert.equal(withControlCharacters?.action, 'Gentle reminder');

const list = validateStoredAutomations([
  validAutomation,
  { ...validAutomation, name: 'Duplicate ID must not replace the first record' },
  { ...validAutomation, id: 'auto_43', name: 'Second valid automation', enabled: false },
  { ...validAutomation, id: '__proto__', name: 'Prototype record' },
  { id: 'broken', name: 'Missing required fields' },
]);
assert.ok(list);
assert.equal(list?.length, 2);
assert.equal(list?.[0].name, 'Hydration reminder');
assert.equal(list?.[1].id, 'auto_43');

assert.deepEqual(validateStoredAutomations([]), [], 'An intentional empty automation list is valid');
assert.equal(validateStoredAutomations(null), null);
assert.equal(validateStoredAutomations({ auto_1: validAutomation }), null);
assert.equal(validateStoredAutomations([null, {}, { ...validAutomation, id: 'bad/id' }]), null);

const many = Array.from({ length: 150 }, (_, index) => ({
  ...validAutomation,
  id: `auto_${index}`,
}));
const bounded = validateStoredAutomations(many);
assert.ok(bounded);
assert.equal(bounded?.length, 100);
assert.equal(bounded?.[99].id, 'auto_99');

const hugeTimestamp = validateStoredAutomation({
  ...validAutomation,
  targetTimestamp: Number.MAX_SAFE_INTEGER,
});
assert.equal(hugeTimestamp?.targetTimestamp, undefined);

console.log('Automation storage validation, invalid-enabled-state rejection, and bounded list checks passed.');
