import assert from 'node:assert/strict';
import {
  DEFAULT_APP_PERMISSIONS,
  DEFAULT_GESTURE_MAPPINGS,
  normalizeAppPermissions,
  normalizeGestureMappings,
} from '../src/services/DeviceStateStorageValidation.ts';

const validPermissions = normalizeAppPermissions({
  microphone: 'granted',
  location: 'denied',
  notifications: 'granted',
  wakeWord: false,
  persistentMemory: true,
  audioPlayback: false,
  floatingOverlay: true,
});
assert.deepEqual(validPermissions, {
  microphone: 'granted',
  location: 'denied',
  notifications: 'granted',
  wakeWord: false,
  persistentMemory: true,
  audioPlayback: false,
  floatingOverlay: true,
});

const malformedPermissions = normalizeAppPermissions({
  microphone: 'allow',
  location: {},
  notifications: 'prompt',
  wakeWord: 'false',
  persistentMemory: 1,
  audioPlayback: null,
  floatingOverlay: false,
});
assert.deepEqual(malformedPermissions, {
  microphone: DEFAULT_APP_PERMISSIONS.microphone,
  location: DEFAULT_APP_PERMISSIONS.location,
  notifications: DEFAULT_APP_PERMISSIONS.notifications,
  wakeWord: DEFAULT_APP_PERMISSIONS.wakeWord,
  persistentMemory: DEFAULT_APP_PERMISSIONS.persistentMemory,
  audioPlayback: DEFAULT_APP_PERMISSIONS.audioPlayback,
  floatingOverlay: false,
});
assert.deepEqual(normalizeAppPermissions(null), DEFAULT_APP_PERMISSIONS);
assert.deepEqual(normalizeAppPermissions([]), DEFAULT_APP_PERMISSIONS);

const partialPermissions = normalizeAppPermissions(
  { microphone: 'granted', wakeWord: false, notifications: 'default' },
  { ...DEFAULT_APP_PERMISSIONS, location: 'denied', audioPlayback: false },
);
assert.equal(partialPermissions.microphone, 'granted');
assert.equal(partialPermissions.location, 'denied');
assert.equal(partialPermissions.wakeWord, false);
assert.equal(partialPermissions.audioPlayback, false);
assert.equal(partialPermissions.notifications, 'default');

const savedMappings = normalizeGestureMappings({
  wave: 'romantic_mode',
  heart: 'open_chat',
  thumbs_up: 'toggle_lights',
  peace: 'open_wardrobe',
  fist: 'app_youtube',
});
assert.deepEqual({ ...savedMappings }, {
  wave: 'romantic_mode',
  heart: 'open_chat',
  thumbs_up: 'toggle_lights',
  peace: 'open_wardrobe',
  fist: 'app_youtube',
});

const hostileMappings = normalizeGestureMappings(JSON.parse(
  '{"wave":"javascript:alert(1)","heart":"open_chat","constructor":"toggle_lights","__proto__":{"polluted":"yes"},"thumbs_up":42,"peace":"unknown_action","fist":"app_facebook","unknown_gesture":"app_instagram"}',
));
assert.deepEqual({ ...hostileMappings }, {
  wave: DEFAULT_GESTURE_MAPPINGS.wave,
  heart: 'open_chat',
  thumbs_up: DEFAULT_GESTURE_MAPPINGS.thumbs_up,
  peace: DEFAULT_GESTURE_MAPPINGS.peace,
  fist: 'app_facebook',
});
assert.equal(Object.prototype.hasOwnProperty.call(hostileMappings, '__proto__'), false);
assert.equal(({} as Record<string, unknown>).polluted, undefined);
assert.equal(Object.getPrototypeOf(hostileMappings), null);

const preserveExisting = normalizeGestureMappings(
  { wave: 'invalid_target', heart: 'romantic_mode' },
  { wave: 'app_youtube', heart: 'open_chat', thumbs_up: 'toggle_lights', peace: 'open_wardrobe' },
);
assert.deepEqual({ ...preserveExisting }, {
  wave: 'app_youtube',
  heart: 'romantic_mode',
  thumbs_up: 'toggle_lights',
  peace: 'open_wardrobe',
});

assert.deepEqual({ ...normalizeGestureMappings(null) }, DEFAULT_GESTURE_MAPPINGS);
assert.deepEqual({ ...normalizeGestureMappings([]) }, DEFAULT_GESTURE_MAPPINGS);

console.log('App permission and gesture mapping storage validation checks passed.');
