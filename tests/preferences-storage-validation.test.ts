import assert from 'node:assert/strict';
import {
  DEFAULT_PERSONALITY_SETTINGS,
  DEFAULT_USER_PROFILE,
  DEFAULT_VOICE_SETTINGS,
  normalizePersonalitySettings,
  normalizeUserProfile,
  normalizeVoiceSettings,
} from '../src/services/PreferencesStorageValidation.ts';

const validProfile = normalizeUserProfile({
  id: 'user_123',
  name: '  Sara User  ',
  email: 'user@example.com',
  avatarUrl: 'https://images.example/avatar.png',
  language: 'English',
  timezone: 'Asia/Dhaka',
  personality: 'Caring',
  loveMode: false,
  wakeWord: '  Hello Sara ',
  dismissWord: ' Stop ',
  autoTimeoutSeconds: 30,
});
assert.deepEqual(validProfile, {
  id: 'user_123',
  name: 'Sara User',
  email: 'user@example.com',
  avatarUrl: 'https://images.example/avatar.png',
  language: 'English',
  timezone: 'Asia/Dhaka',
  personality: 'Caring',
  loveMode: false,
  wakeWord: 'Hello Sara',
  dismissWord: 'Stop',
  autoTimeoutSeconds: 30,
});

const fallbackProfile = normalizeUserProfile(null);
assert.deepEqual(fallbackProfile, DEFAULT_USER_PROFILE);

const invalidProfile = normalizeUserProfile({
  id: '__proto__',
  name: 'x'.repeat(81),
  email: 'not-an-email',
  avatarUrl: 'javascript:alert(1)',
  language: 'Klingon',
  timezone: '<script>bad</script>',
  personality: 'system',
  loveMode: 'false',
  wakeWord: '',
  dismissWord: 123,
  autoTimeoutSeconds: 9_999,
});
assert.equal(invalidProfile.id, DEFAULT_USER_PROFILE.id);
assert.equal(invalidProfile.name, DEFAULT_USER_PROFILE.name);
assert.equal(invalidProfile.email, DEFAULT_USER_PROFILE.email);
assert.equal(invalidProfile.avatarUrl, '');
assert.equal(invalidProfile.language, 'Bengali');
assert.equal(invalidProfile.timezone, 'scriptbad/script');
assert.equal(invalidProfile.personality, 'GirlFriend');
assert.equal(invalidProfile.loveMode, true);
assert.equal(invalidProfile.wakeWord, 'Hello Hello');
assert.equal(invalidProfile.dismissWord, 'Bye Bye');
assert.equal(invalidProfile.autoTimeoutSeconds, 300);

const guestProfile = normalizeUserProfile({
  ...DEFAULT_USER_PROFILE,
  name: 'Guest',
  email: '',
  avatarUrl: '',
});
assert.equal(guestProfile.name, 'Guest');
assert.equal(guestProfile.email, '');
assert.equal(guestProfile.avatarUrl, '');

const partialProfileUpdate = normalizeUserProfile({
  ...validProfile,
  name: '',
  language: 'invalid',
  autoTimeoutSeconds: '120',
}, validProfile);
assert.equal(partialProfileUpdate.name, validProfile.name);
assert.equal(partialProfileUpdate.language, 'English');
assert.equal(partialProfileUpdate.autoTimeoutSeconds, 30);

const personality = normalizePersonalitySettings({
  warmth: 105,
  playfulness: -5,
  romance: 72.8,
  affection: '99',
  formality: Number.NaN,
  responseLength: 'balanced',
  emojiFrequency: 'minimal',
});
assert.deepEqual(personality, {
  warmth: 100,
  playfulness: 0,
  romance: 73,
  affection: DEFAULT_PERSONALITY_SETTINGS.affection,
  formality: DEFAULT_PERSONALITY_SETTINGS.formality,
  responseLength: 'balanced',
  emojiFrequency: 'minimal',
});

const previousPersonality = {
  ...DEFAULT_PERSONALITY_SETTINGS,
  warmth: 50,
  responseLength: 'concise' as const,
};
const updatedPersonality = normalizePersonalitySettings({
  ...previousPersonality,
  warmth: 45,
  responseLength: 'ultra',
}, previousPersonality);
assert.equal(updatedPersonality.warmth, 45);
assert.equal(updatedPersonality.responseLength, 'concise');

const voice = normalizeVoiceSettings({
  voice: 'Kore',
  speed: 9,
  pitch: 0.3,
  autoSpeak: 'false',
  provider: 'bad-provider',
});
assert.deepEqual(voice, {
  voice: 'Kore',
  speed: 1.4,
  pitch: 0.8,
  autoSpeak: DEFAULT_VOICE_SETTINGS.autoSpeak,
  provider: DEFAULT_VOICE_SETTINGS.provider,
});

const validVoice = normalizeVoiceSettings({
  ...DEFAULT_VOICE_SETTINGS,
  voice: 'browser',
  speed: 1.17,
  pitch: 1.29,
  autoSpeak: false,
  provider: 'browser',
});
assert.equal(validVoice.voice, 'browser');
assert.equal(validVoice.speed, 1.17);
assert.equal(validVoice.pitch, 1.29);
assert.equal(validVoice.autoSpeak, false);
assert.equal(validVoice.provider, 'browser');

assert.deepEqual(normalizeVoiceSettings([] as unknown as object), DEFAULT_VOICE_SETTINGS);
console.log('User profile, personality, and voice settings validation checks passed.');
