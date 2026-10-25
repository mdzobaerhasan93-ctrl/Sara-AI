import assert from 'node:assert/strict';
import {
  validateStoredCoinTransaction,
  validateStoredCoinTransactions,
} from '../src/services/CoinTransactionStorageValidation.ts';

const validTransaction = {
  id: 'tx_123',
  title: 'Daily reward (+10 coins)',
  amount: 10,
  type: 'daily_reward',
  timestamp: 'Just now',
};

assert.deepEqual(validateStoredCoinTransaction(validTransaction), validTransaction);
assert.equal(validateStoredCoinTransaction(null), null);
assert.equal(validateStoredCoinTransaction([]), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, id: '__proto__' }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, id: 'tx 1' }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, title: 'x'.repeat(161) }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, timestamp: 'x'.repeat(81) }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, amount: '10' }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, amount: 1.5 }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, amount: 1_000_001 }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, type: 'unknown' }), null);
assert.equal(validateStoredCoinTransaction({ ...validTransaction, title: '   ' }), null);

assert.deepEqual(validateStoredCoinTransactions(null), []);
assert.deepEqual(validateStoredCoinTransactions('not json'), []);
assert.deepEqual(validateStoredCoinTransactions('{}'), []);
assert.deepEqual(validateStoredCoinTransactions('[]'), []);

const history = validateStoredCoinTransactions(JSON.stringify([
  validTransaction,
  { ...validTransaction, id: 'tx_123', title: 'Duplicate entry' },
  { ...validTransaction, id: 'tx_124', amount: -50, type: 'pass_purchase', title: 'Pass purchase' },
  { ...validTransaction, id: 'tx_invalid', amount: 999_999_999 },
  { ...validTransaction, id: 'bad id' },
  null,
  'invalid',
]));
assert.equal(history.length, 2);
assert.equal(history[0].title, 'Daily reward (+10 coins)');
assert.equal(history[1].amount, -50);
assert.equal(history[1].type, 'pass_purchase');

const maxList = validateStoredCoinTransactions(JSON.stringify(
  Array.from({ length: 200 }, (_, index) => ({
    ...validTransaction,
    id: `tx_${index}`,
    title: `Transaction ${index}`,
  })),
));
assert.equal(maxList.length, 100, 'Transaction history should be bounded');
assert.equal(maxList[0].id, 'tx_0');
assert.equal(maxList[99].id, 'tx_99');

console.log('Coin transaction validation, deduplication, bounds, and malformed storage checks passed.');
