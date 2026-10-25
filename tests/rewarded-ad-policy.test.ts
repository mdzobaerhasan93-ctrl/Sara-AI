import assert from 'node:assert/strict';
import {
  isRewardedAdsAvailable,
  mayGrantRewardedAdCoins,
} from '../src/services/RewardedAdPolicy.ts';

assert.equal(isRewardedAdsAvailable(null), false);
assert.equal(isRewardedAdsAvailable([]), false);
assert.equal(isRewardedAdsAvailable({ providerSdkInstalled: true }), false);
assert.equal(isRewardedAdsAvailable({ serverSideVerificationConfigured: true }), false);
assert.equal(isRewardedAdsAvailable({
  providerSdkInstalled: 'true',
  serverSideVerificationConfigured: 'true',
}), false);

assert.equal(isRewardedAdsAvailable({
  providerSdkInstalled: true,
  serverSideVerificationConfigured: true,
}), true);

const validReceipt = {
  providerSdkInstalled: true,
  serverSideVerificationConfigured: true,
  serverVerifiedCompletion: true,
  transactionId: 'admob_tx_12345678',
};
assert.equal(mayGrantRewardedAdCoins(validReceipt), true);

const invalidReceipts: unknown[] = [
  null,
  [],
  {},
  { ...validReceipt, providerSdkInstalled: false },
  { ...validReceipt, serverSideVerificationConfigured: false },
  { ...validReceipt, serverVerifiedCompletion: false },
  { ...validReceipt, serverVerifiedCompletion: 'true' },
  { ...validReceipt, transactionId: '' },
  { ...validReceipt, transactionId: 'short' },
  { ...validReceipt, transactionId: 'bad receipt value!' },
  { ...validReceipt, transactionId: 'x'.repeat(201) },
];

for (const receipt of invalidReceipts) {
  assert.equal(mayGrantRewardedAdCoins(receipt), false, 'Unverified rewarded-ad receipts must not grant coins');
}

console.log('Rewarded ad provider readiness and server-verified receipt policy checks passed.');
