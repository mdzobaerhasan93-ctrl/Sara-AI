import assert from 'node:assert/strict';
import { normalizeAgentBuilderData } from '../src/services/AgentBuilderValidation.ts';

const gemini = normalizeAgentBuilderData({
  taskTitle: 'Task manager preview',
  bengaliTitle: 'টাস্ক ম্যানেজার প্রিভিউ',
  summary: 'A UI preview was generated.',
  livePreviewHtml: '<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body></body></html>',
  techStack: ['React 99', 'DeepSeek'],
  modelsInvolved: ['Gemini', 'Claude', 'DeepSeek'],
  files: [{ fileName: 'index.html', language: 'html', content: '<html></html>' }],
}, 'gemini');

assert.ok(gemini);
assert.equal(gemini?.provider, 'gemini');
assert.deepEqual(gemini?.modelsInvolved, ['Gemini API']);
assert.deepEqual(gemini?.techStack, ['HTML5', 'Tailwind CSS (CDN)', 'Browser JavaScript']);
assert.match(gemini?.summary || '', /build, tests and deployment have not been performed/);
assert.doesNotMatch(gemini?.modelsInvolved.join(' ') || '', /Claude|DeepSeek/);
assert.equal(gemini?.files.length, 1);

const fallback = normalizeAgentBuilderData({
  taskTitle: 'Fake Full Stack',
  bengaliTitle: 'ভুয়া',
  summary: 'A full-stack app was built and tested.',
  livePreviewHtml: '<html><body>fallback sample</body></html>',
  techStack: ['React', 'TypeScript'],
  modelsInvolved: ['Gemini', 'DeepSeek'],
}, 'fallback');

assert.ok(fallback);
assert.equal(fallback?.provider, 'fallback');
assert.deepEqual(fallback?.modelsInvolved, ['Built-in fallback template']);
assert.match(fallback?.summary || '', /পূর্ণ implementation নয়/);
assert.doesNotMatch(fallback?.summary || '', /A full-stack app was built and tested/);
assert.deepEqual(fallback?.techStack, ['HTML5', 'CSS', 'Browser JavaScript']);

assert.equal(normalizeAgentBuilderData(null, 'gemini'), null);
assert.equal(normalizeAgentBuilderData({ livePreviewHtml: '' }, 'gemini'), null);
assert.equal(normalizeAgentBuilderData({ livePreviewHtml: 'x'.repeat(500_001) }, 'gemini'), null);

const bounded = normalizeAgentBuilderData({
  taskTitle: 'x'.repeat(1000),
  bengaliTitle: 'y'.repeat(1000),
  summary: 'z'.repeat(3000),
  livePreviewHtml: '<p>valid</p>',
  files: Array.from({ length: 50 }, (_, index) => ({
    fileName: `file-${index}.txt`,
    language: 'text',
    content: 'x'.repeat(150_000),
  })),
}, 'gemini');
assert.ok(bounded);
assert.equal(bounded?.taskTitle.length, 160);
assert.equal(bounded?.bengaliTitle.length, 160);
assert.equal(bounded?.summary.length <= 2000 + 100, true);
assert.equal(bounded?.files.length, 20);
assert.ok(bounded?.files.every((file) => file.content.length <= 100_000));

console.log('Agent builder result normalization and truthful provider metadata checks passed.');
