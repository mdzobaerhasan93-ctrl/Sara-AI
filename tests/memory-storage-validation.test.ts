import assert from 'node:assert/strict';
import {
  validateStoredMemory,
  validateStoredMemories,
} from '../src/services/MemoryStorageValidation.ts';

const validMemory = {
  id: 'mem_123',
  category: 'Preferences',
  content: 'Speaks Bengali and prefers clear explanations.',
  createdAt: '2026-10-08',
  active: true,
};

const valid = validateStoredMemory(validMemory);
assert.deepEqual(valid, validMemory);

const invalidInputs: unknown[] = [
  null,
  [],
  'memory',
  {},
  { ...validMemory, id: '__proto__' },
  { ...validMemory, id: 'constructor' },
  { ...validMemory, id: 'invalid/id' },
  { ...validMemory, id: 123 },
  { ...validMemory, category: 'System Override' },
  { ...validMemory, content: '' },
  { ...validMemory, content: 123 },
  { ...validMemory, createdAt: '2026-02-31' },
  { ...validMemory, createdAt: 'not a date' },
];

for (const memory of invalidInputs) {
  assert.equal(validateStoredMemory(memory), null, 'Malformed memory records must be rejected');
}

const invalidActive = validateStoredMemory({
  ...validMemory,
  active: 'true',
});
assert.ok(invalidActive);
assert.equal(invalidActive?.active, false, 'A truthy string must not activate a memory');

const cleanControls = validateStoredMemory({
  ...validMemory,
  content: '  first\u0000 line\u001F\nsecond line  ',
});
assert.ok(cleanControls);
assert.equal(cleanControls?.content, 'first line\nsecond line');

const longMemory = validateStoredMemory({
  ...validMemory,
  content: 'x'.repeat(900),
});
assert.ok(longMemory);
assert.equal(longMemory?.content.length, 500);

const timestampDate = validateStoredMemory({
  ...validMemory,
  createdAt: '2026-10-08T12:34:56.000Z',
});
assert.equal(timestampDate?.createdAt, '2026-10-08');

const list = validateStoredMemories([
  validMemory,
  { ...validMemory, content: 'Duplicate IDs should not replace the first record.' },
  { ...validMemory, id: 'mem_124', category: 'Work', active: false },
  { ...validMemory, id: '__proto__' },
  { id: 'broken' },
]);
assert.ok(list);
assert.equal(list?.length, 2);
assert.equal(list?.[0].content, validMemory.content);
assert.equal(list?.[1].id, 'mem_124');
assert.equal(list?.[1].active, false);

assert.deepEqual(validateStoredMemories([]), []);
assert.equal(validateStoredMemories(null), null);
assert.equal(validateStoredMemories({ mem_123: validMemory }), null);
assert.equal(validateStoredMemories([null, {}, { ...validMemory, category: 'not allowed' }]), null);

const many = Array.from({ length: 150 }, (_, index) => ({
  ...validMemory,
  id: `mem_${index}`,
  content: `memory-${index}`,
}));
const bounded = validateStoredMemories(many);
assert.ok(bounded);
assert.equal(bounded?.length, 100);
assert.equal(bounded?.[99].id, 'mem_99');

console.log('Memory storage validation, strict activation, category/date validation, and bounded list checks passed.');
