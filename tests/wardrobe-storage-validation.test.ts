import assert from 'node:assert/strict';
import {
  DEFAULT_UNLOCKED_ACCESSORIES,
  DEFAULT_UNLOCKED_OUTFITS,
  validateStoredEquippedAccessory,
  validateStoredEquippedOutfit,
  validateStoredUnlockedAccessories,
  validateStoredUnlockedOutfits,
} from '../src/services/WardrobeStorageValidation.ts';

assert.deepEqual(validateStoredUnlockedOutfits(null), [...DEFAULT_UNLOCKED_OUTFITS]);
assert.deepEqual(validateStoredUnlockedAccessories(null), [...DEFAULT_UNLOCKED_ACCESSORIES]);
assert.deepEqual(validateStoredUnlockedOutfits('not json'), [...DEFAULT_UNLOCKED_OUTFITS]);
assert.deepEqual(validateStoredUnlockedAccessories('{"not":"an array"}'), [...DEFAULT_UNLOCKED_ACCESSORIES]);

const outfits = validateStoredUnlockedOutfits(JSON.stringify([
  'ROYAL_GOWN',
  'silk_saree',
  'silk_saree',
  'unknown_outfit',
  123,
  '__proto__',
  'constructor',
]));
assert.deepEqual(outfits, ['royal_gown', 'silk_saree', 'cyber_jacket']);
assert.ok(outfits.includes('cyber_jacket'), 'The free starter outfit must always remain unlocked');

const emptyOutfits = validateStoredUnlockedOutfits('[]');
assert.deepEqual(emptyOutfits, ['cyber_jacket']);

const accessories = validateStoredUnlockedAccessories(JSON.stringify([
  'CROWN',
  'garland',
  'garland',
  'not-an-accessory',
  null,
  'prototype',
]));
assert.deepEqual(accessories, ['crown', 'garland', 'none']);
assert.ok(accessories.includes('none'), 'The no-accessory option must always remain available');

const oversizedInventory = JSON.stringify([
  ...Array.from({ length: 30 }, (_, index) => (index % 2 === 0 ? 'royal_gown' : 'silk_saree')),
]);
assert.ok(validateStoredUnlockedOutfits(oversizedInventory).length <= 3);

assert.equal(validateStoredEquippedOutfit('royal_gown', ['royal_gown', 'cyber_jacket']), 'royal_gown');
assert.equal(validateStoredEquippedOutfit('silk_saree', ['cyber_jacket']), 'cyber_jacket');
assert.equal(validateStoredEquippedOutfit('javascript:alert(1)', ['cyber_jacket']), 'cyber_jacket');
assert.equal(validateStoredEquippedOutfit(null, ['royal_gown']), 'royal_gown');
assert.equal(validateStoredEquippedOutfit('unknown', []), 'cyber_jacket');

assert.equal(validateStoredEquippedAccessory('crown', ['none', 'crown']), 'crown');
assert.equal(validateStoredEquippedAccessory('garland', ['none']), 'none');
assert.equal(validateStoredEquippedAccessory('javascript:alert(1)', ['none']), 'none');
assert.equal(validateStoredEquippedAccessory(null, ['none', 'visor']), 'none');
assert.equal(validateStoredEquippedAccessory('unknown', []), 'none');

console.log('Wardrobe inventory and equipped-item storage validation checks passed.');
