import assert from 'node:assert/strict';
import {
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
  type StorageLike,
} from '../src/services/SafeLocalStorage.ts';

const values = new Map<string, string>();
const fakeStorage: StorageLike = {
  getItem(key) {
    return values.has(key) ? values.get(key)! : null;
  },
  setItem(key, value) {
    values.set(key, value);
  },
  removeItem(key) {
    values.delete(key);
  },
};

assert.equal(safeLocalStorageGetItem('missing', fakeStorage), null);
assert.equal(safeLocalStorageSetItem('profile', '{"name":"Sara"}', fakeStorage), true);
assert.equal(safeLocalStorageGetItem('profile', fakeStorage), '{"name":"Sara"}');
assert.equal(safeLocalStorageRemoveItem('profile', fakeStorage), true);
assert.equal(safeLocalStorageGetItem('profile', fakeStorage), null);

const deniedStorage: StorageLike = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
  removeItem() {
    throw new Error('SecurityError');
  },
};
assert.equal(safeLocalStorageGetItem('key', deniedStorage), null);
assert.equal(safeLocalStorageSetItem('key', 'value', deniedStorage), false);
assert.equal(safeLocalStorageRemoveItem('key', deniedStorage), false);

assert.equal(safeLocalStorageGetItem('key', null), null);
assert.equal(safeLocalStorageSetItem('key', 'value', null), false);
assert.equal(safeLocalStorageRemoveItem('key', null), false);

const partialStorage: StorageLike = {
  getItem() {
    return 'persisted';
  },
  setItem() {},
  removeItem() {
    throw new Error('Storage access revoked after initialization');
  },
};
assert.equal(safeLocalStorageGetItem('key', partialStorage), 'persisted');
assert.equal(safeLocalStorageSetItem('key', 'value', partialStorage), true);
assert.equal(safeLocalStorageRemoveItem('key', partialStorage), false);

console.log('Safe localStorage read/write/remove behavior checks passed.');
