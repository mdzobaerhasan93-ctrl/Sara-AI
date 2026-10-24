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
