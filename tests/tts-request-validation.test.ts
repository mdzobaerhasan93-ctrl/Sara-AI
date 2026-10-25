import assert from 'node:assert/strict';
import { validateTTSRequest } from '../src/services/TTSRequestValidation.ts';

const valid = validateTTSRequest({
  text: '  [EMOTION:happy] Hello *there*! ❤️  ',
  voice: 'Kore',
  style: ' Calm, natural voice ',
});
assert.equal(valid.success, true);
if (valid.success) {
  assert.equal(valid.data.text, 'Hello there!');
  assert.equal(valid.data.voice, 'Kore');
  assert.equal(valid.data.style, 'Calm, natural voice');
}

const defaultVoice = validateTTSRequest({ text: 'হ্যালো বাবু ❤️' });
assert.equal(defaultVoice.success, true);
if (defaultVoice.success) {
  assert.equal(defaultVoice.data.voice, 'Zephyr');
  assert.equal(defaultVoice.data.text, 'হ্যালো বাবু');
}

const browserVoice = validateTTSRequest({ text: 'Speak this', voice: 'browser' });
assert.equal(browserVoice.success, true);
if (browserVoice.success) assert.equal(browserVoice.data.voice, 'Zephyr');

const invalidInputs: unknown[] = [
  null,
  [],
  {},
  { text: 123 },
  { text: '' },
  { text: '   ' },
  { text: 'x'.repeat(401) },
  { text: 'hello\u0000hidden' },
  { text: '😀✨🔥' },
  { text: '```js\nconst x = 1;\n```' },
  { text: 'valid text', voice: 12 },
  { text: 'valid text', voice: 'NotAProviderVoice' },
  { text: 'valid text', style: { voice: 'override' } },
  { text: 'valid text', style: 'x'.repeat(201) },
  { text: 'valid text', style: 'bad\u0000style' },
];

for (const input of invalidInputs) {
  assert.equal(
    validateTTSRequest(input).success,
    false,
    `Expected TTS payload to be rejected: ${JSON.stringify(input).slice(0, 60)}`,
  );
}

const maxSize = validateTTSRequest({ text: 'x'.repeat(400) });
assert.equal(maxSize.success, true, 'The configured maximum text size should be accepted');
if (maxSize.success) assert.equal(maxSize.data.text.length, 400);

const emptyAfterFormatting = validateTTSRequest({ text: '[EMOTION:happy] ```ts\nlet x = 2;\n```' });
assert.equal(emptyAfterFormatting.success, false);

console.log('TTS input type, size, voice, style, and sanitization checks passed.');
