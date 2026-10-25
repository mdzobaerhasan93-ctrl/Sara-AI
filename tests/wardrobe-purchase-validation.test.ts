import assert from 'node:assert/strict';
import {
  WARDROBE_ITEMS,
  decideWardrobePurchase,
  getWardrobeItem,
} from '../src/services/WardrobeInventory.ts';

assert.equal(WARDROBE_ITEMS.length, 9);
assert.equal(getWardrobeItem('royal_gown', 'outfit')?.cost, 300);
assert.equal(getWardrobeItem('crown', 'accessory')?.cost, 500);
assert.equal(getWardrobeItem('unknown', 'outfit'), null);
assert.equal(getWardrobeItem('crown', 'outfit'), null, 'The requested item type must match the catalog');

const royalGown = decideWardrobePurchase('royal_gown', 'outfit', 500, ['cyber_jacket']);
assert.equal(royalGown.allowed, true);
if (royalGown.allowed) {
  assert.equal(royalGown.cost, 300, 'Cost must come from the inventory catalog');
  assert.equal(royalGown.item.id, 'royal_gown');
}

const insufficientFunds = decideWardrobePurchase('royal_gown', 'outfit', 299, []);
assert.deepEqual(insufficientFunds, { allowed: false, reason: 'INSUFFICIENT_FUNDS' });

const alreadyUnlocked = decideWardrobePurchase('royal_gown', 'outfit', 10_000, ['royal_gown']);
assert.deepEqual(alreadyUnlocked, { allowed: false, reason: 'ALREADY_UNLOCKED' });

const invalidItems = [
  decideWardrobePurchase('unknown', 'outfit', 10_000, []),
  decideWardrobePurchase('crown', 'outfit', 10_000, []),
  decideWardrobePurchase('__proto__', 'accessory', 10_000, []),
  decideWardrobePurchase(123, 'outfit', 10_000, []),
];
for (const decision of invalidItems) {
  assert.equal(decision.allowed, false);
}

for (const balance of [-1, Number.NaN, Number.POSITIVE_INFINITY, 3.5, '999999']) {
  assert.deepEqual(
    decideWardrobePurchase('royal_gown', 'outfit', balance, []),
    { allowed: false, reason: 'INVALID_BALANCE' },
  );
}

assert.deepEqual(
  decideWardrobePurchase('royal_gown', 'outfit', 1000, 'not an array'),
  { allowed: false, reason: 'INVALID_ITEM' },
);
assert.deepEqual(
  decideWardrobePurchase('cyber_jacket', 'outfit', 0, []),
  { allowed: true, item: WARDROBE_ITEMS[0], cost: 0 },
  'A free catalog item remains purchasable if it was not already unlocked',
);

console.log('Wardrobe inventory, authoritative client price lookup, and purchase validation checks passed.');
