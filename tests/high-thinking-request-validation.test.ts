import assert from 'node:assert/strict';
import { validateHighThinkingRequest } from '../src/services/HighThinkingRequestValidation.ts';

const valid = validateHighThinkingRequest({
  prompt: '  Explain recursion clearly.  ',
  systemInstruction: '  Be concise.  ',
  model: 'arbitrary-model',
  generationConfig: { maxOutputTokens: 999999 },
});
assert.equal(valid.success, true);
if (valid.success) {
  assert.deepEqual(valid.data, {
    prompt: 'Explain recursion clearly.',
    systemInstruction: 'Be concise.',
  });
  assert.ok(!('model' in valid.data), 'Caller-selected model is not forwarded');
  assert.ok(!('generationConfig' in valid.data), 'Arbitrary provider config is not forwarded');
}

const defaultInstruction = validateHighThinkingRequest({
  prompt: 'Summarize the main trade-offs.',
});
assert.equal(defaultInstruction.success, true);
if (defaultInstruction.success) {
  assert.equal(defaultInstruction.data.prompt, 'Summarize the main trade-offs.');
  assert.equal(defaultInstruction.data.systemInstruction, undefined);
}

const normalized = validateHighThinkingRequest({
  prompt: '  First\u0000 line\r\nSecond line  ',
  systemInstruction: '\u0007Helpful\tassistant',
});
assert.equal(normalized.success, true);
if (normalized.success) {
  assert.equal(normalized.data.prompt, 'First line\nSecond line');
  assert.equal(normalized.data.systemInstruction, 'Helpful\tassistant');
}

const invalidRequests: unknown[] = [
  null,
  [],
  'prompt',
  {},
  { prompt: 123 },
  { prompt: '' },
  { prompt: '   \n\t' },
  { prompt: 'x'.repeat(12_001) },
  { prompt: 'valid', systemInstruction: 123 },
  { prompt: 'valid', systemInstruction: 'x'.repeat(4_001) },
];

for (const input of invalidRequests) {
  assert.equal(validateHighThinkingRequest(input).success, false, 'Malformed or overlong requests should be rejected');
}

const longAtLimit = validateHighThinkingRequest({ prompt: 'x'.repeat(12_000) });
assert.equal(longAtLimit.success, true);

console.log('High Thinking request validation and bounds checks passed.');
