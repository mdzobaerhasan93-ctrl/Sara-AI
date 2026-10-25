import assert from 'node:assert/strict';
import { AIAgentService } from '../src/services/AIAgentService.ts';

const supportedCommands = [
  'ইউটিউবে তুফান মুভি সার্চ দাও',
  'Open Facebook and comment on a post',
  'WhatsApp মেসেজ পাঠাও',
  'Build a calculator app',
  'গুগল স্টুডিও দিয়ে একটা অ্যাপ বানাও',
  'write some code',
];

for (const command of supportedCommands) {
  assert.equal(
    AIAgentService.isAgentCommand(command),
    true,
    `Expected agent command to be detected: ${command}`,
  );
}

const ordinaryMessages = [
  'কেমন আছো?',
  'What is the capital of Bangladesh?',
  'আজকের আবহাওয়া কেমন?',
  '',
];

for (const message of ordinaryMessages) {
  assert.equal(
    AIAgentService.isAgentCommand(message),
    false,
    `Expected ordinary message not to be detected as an agent command: ${message}`,
  );
}

const youtubeSearch = await AIAgentService.executeCommand('ইউটিউবে ইন্টারস্টেলার মুভি সার্চ দাও');
assert.equal(youtubeSearch.type, 'youtube_movie');
assert.equal(youtubeSearch.success, true);
assert.match(youtubeSearch.payload?.searchUrl || '', /^https:\/\/www\.youtube\.com\/results\?search_query=/);
assert.ok(youtubeSearch.payload?.searchUrl?.includes('official'));
assert.equal(youtubeSearch.payload?.youtubeEmbedId, undefined, 'Search flow must not fabricate a video ID');
assert.equal(youtubeSearch.payload?.movieRating, undefined, 'Search flow must not invent a movie rating');
assert.equal(youtubeSearch.payload?.movieYear, undefined, 'Search flow must not invent a release year');
assert.match(youtubeSearch.message, /যাচাই করে দেখাইনি/);
assert.ok(!youtubeSearch.message.includes('সরাসরি প্লে করতে পারো'));

const missingMovieTitle = await AIAgentService.executeCommand('YouTube open');
assert.equal(missingMovieTitle.type, 'youtube_movie');
assert.equal(missingMovieTitle.success, false);
assert.match(missingMovieTitle.message, /নামটা বলো/);
assert.equal(missingMovieTitle.payload?.youtubeEmbedId, undefined);

const whatsappDraft = await AIAgentService.executeCommand('WhatsApp মেসেজ পাঠাও');
assert.equal(whatsappDraft.type, 'whatsapp_message');
assert.equal(whatsappDraft.success, true);
assert.match(whatsappDraft.payload?.webFallbackUrl || '', /^https:\/\/wa\.me\/\?text=/);
assert.match(whatsappDraft.message, /এখনো মেসেজ পাঠানো হয়নি/);
assert.ok(
  !whatsappDraft.message.includes('সফলভাবে প্রস্তুত ও পাঠানো হয়েছে'),
  'WhatsApp flow must not claim a message was sent',
);

const facebookDraft = await AIAgentService.executeCommand('Facebook একটা পোস্টে কমেন্ট করো');
assert.equal(facebookDraft.type, 'facebook_comment');
assert.ok(facebookDraft.payload?.commentText);
assert.match(facebookDraft.message, /এখনো Facebook-এ কিছু পোস্ট করা হয়নি/);
assert.ok(
  !facebookDraft.message.includes('কমেন্ট করে দিয়েছি'),
  'Facebook flow must not claim a comment was posted',
);

console.log('Agent command detection and external-action draft checks passed.');
