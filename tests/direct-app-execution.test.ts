import assert from 'node:assert/strict';
import { dispatchDirectAppAction, extractExplicitActionPayload } from '../src/services/DirectAppExecution.ts';

assert.equal(extractExplicitActionPayload('Instagram-এ comment করো'), null, 'An action without explicit content must not get an invented payload');
assert.equal(extractExplicitActionPayload('Facebook status: আজকের দিনটা সুন্দর'), 'আজকের দিনটা সুন্দর');
assert.equal(extractExplicitActionPayload('WhatsApp মেসেজ পাঠাও "আমি পথে আছি"'), 'আমি পথে আছি');
assert.equal(extractExplicitActionPayload('Instagram caption: ' + 'x'.repeat(600))?.length, 500);
assert.equal(extractExplicitActionPayload('text: \u0000\u0007'), null);
assert.equal(extractExplicitActionPayload('x'.repeat(8001)), null);

const request = {
  packageName: 'com.instagram.android',
  actionId: 'post_status',
  payload: 'Hello world',
};

const missingBridge = await dispatchDirectAppAction(undefined, request);
assert.equal(missingBridge.status, 'FAILED');
assert.equal(missingBridge.errorCode, 'BRIDGE_UNAVAILABLE');
assert.match(missingBridge.message, /No action was executed/);

const wrongBridge = await dispatchDirectAppAction({ launchApp: () => true }, request);
assert.equal(wrongBridge.status, 'FAILED');
assert.equal(wrongBridge.errorCode, 'BRIDGE_UNAVAILABLE');

let calledWith: unknown[] = [];
const acceptedButUnverified = await dispatchDirectAppAction({
  performAccessibilityAction: (...args: unknown[]) => {
    calledWith = args;
    return undefined;
  },
}, request);
assert.deepEqual(calledWith, ['com.instagram.android', 'post_status', 'Hello world']);
assert.equal(acceptedButUnverified.status, 'PENDING');
if (acceptedButUnverified.status === 'PENDING') {
  assert.equal(acceptedButUnverified.errorCode, 'COMPLETION_UNVERIFIED');
  assert.match(acceptedButUnverified.message, /completion was not verified/i);
}

const booleanTrueIsNotCompletion = await dispatchDirectAppAction({
  performAccessibilityAction: () => true,
}, request);
assert.equal(booleanTrueIsNotCompletion.status, 'PENDING', 'A generic boolean must not be treated as proof of completion');

const completed = await dispatchDirectAppAction({
  performAccessibilityAction: async () => ({ success: true, completed: true }),
}, request);
assert.equal(completed.status, 'SUCCESS');
if (completed.status === 'SUCCESS') {
  assert.equal(completed.verified, true);
  assert.match(completed.message, /explicitly confirmed/i);
}

const incompleteAck = await dispatchDirectAppAction({
  performAccessibilityAction: () => ({ success: true, completed: false }),
}, request);
assert.equal(incompleteAck.status, 'PENDING');

const rejected = await dispatchDirectAppAction({
  performAccessibilityAction: () => { throw new Error('native internals'); },
}, request);
assert.equal(rejected.status, 'FAILED');
if (rejected.status === 'FAILED') {
  assert.equal(rejected.errorCode, 'DISPATCH_FAILED');
  assert.ok(!rejected.message.includes('native internals'));
}

console.log('Direct app bridge dispatch and explicit completion acknowledgement checks passed.');
