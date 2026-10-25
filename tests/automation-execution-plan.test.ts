import assert from 'node:assert/strict';
import { planAutomationExecution } from '../src/services/AutomationExecutionPlan.ts';

const hydration = planAutomationExecution(
  'হেল্থ ও পানি খাওয়ার রিমাইন্ডার',
  'Gentle hydration prompt',
);
assert.equal(hydration.supported, true);
if (hydration.supported) {
  assert.equal(hydration.kind, 'hydration');
  assert.match(hydration.reply, /পানি/);
  assert.match(hydration.executionNote, /No external service was called/);
}

const bedtime = planAutomationExecution(
  'রাতে ঘুমের আগে ভালোবাসার বার্তা',
  'Sweet dreams reminder + Positive affirmation',
);
assert.equal(bedtime.supported, true);
if (bedtime.supported) {
  assert.equal(bedtime.kind, 'sleep');
  assert.match(bedtime.reply, /শুভ রাত্রি/);
}

const localAffirmation = planAutomationExecution('Daily affirmation', 'Positive affirmation');
assert.equal(localAffirmation.supported, true);
if (localAffirmation.supported) assert.equal(localAffirmation.kind, 'affirmation');

const morningGreeting = planAutomationExecution('Morning greeting', 'Wake up greeting');
assert.equal(morningGreeting.supported, true);
if (morningGreeting.supported) assert.equal(morningGreeting.kind, 'greeting');

for (const [name, action] of [
  ['সকালের ব্রিফিং', 'Wake up greeting + Weather report + Todays Agenda'],
  ['Send WhatsApp message', 'Send a WhatsApp message to a friend'],
  ['Deploy project', 'Deploy app to production'],
  ['Calendar reminder', 'Create a calendar event'],
  ['Unknown workflow', 'Run the configured remote task'],
  ['Missing action', ''],
]) {
  const plan = planAutomationExecution(name, action);
  assert.equal(plan.supported, false, `${name} should not be reported as executed without a real executor`);
  if (!plan.supported) {
    assert.match(plan.reason, /integration|description|executor/i);
  }
}

const longAction = planAutomationExecution('Hydration', 'Gentle hydration prompt ' + 'x'.repeat(2000));
assert.equal(longAction.supported, true, 'Known local reminders should still classify when descriptions exceed the text display limit');

console.log('Automation execution planning checks passed.');
