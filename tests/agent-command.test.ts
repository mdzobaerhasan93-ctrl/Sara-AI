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

console.log('Agent command detection checks passed.');
