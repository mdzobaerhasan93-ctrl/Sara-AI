export interface RewardedAdIntegrationStatus {
  providerSdkInstalled: boolean;
  serverSideVerificationConfigured: boolean;
}

/**
 * Rewarded ads must stay disabled unless an ad provider and server-side
 * verification are both implemented. A click or client-side callback alone
 * is not evidence that an ad was watched.
 */
export function isRewardedAdsAvailable(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  return value.providerSdkInstalled === true
    && value.serverSideVerificationConfigured === true;
}

/**
 * Fail closed until the app has a provider and a server-verified completion
 * receipt. This policy expects explicit booleans; string "true" is not enough.
 */
export function mayGrantRewardedAdCoins(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  return value.providerSdkInstalled === true
    && value.serverSideVerificationConfigured === true
    && value.serverVerifiedCompletion === true
    && typeof value.transactionId === 'string'
    && /^[a-zA-Z0-9:_-]{8,200}$/.test(value.transactionId);
}
