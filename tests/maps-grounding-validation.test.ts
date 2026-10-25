import assert from 'node:assert/strict';
import { validateMapsGroundingRequest } from '../src/services/MapsGroundingValidation.ts';

const queryOnly = validateMapsGroundingRequest({ query: '  coffee shops near me  ' });
assert.equal(queryOnly.success, true);
if (queryOnly.success) {
  assert.equal(queryOnly.data.query, 'coffee shops near me');
  assert.equal(queryOnly.data.coordinates, undefined);
}

const validCoordinates = validateMapsGroundingRequest({
  query: 'Find museums nearby',
  latitude: '23.8103',
  longitude: 90.4125,
});
assert.equal(validCoordinates.success, true);
if (validCoordinates.success) {
  assert.deepEqual(validCoordinates.data.coordinates, {
    latitude: 23.8103,
    longitude: 90.4125,
  });
}

const boundaryCoordinates = validateMapsGroundingRequest({
  query: 'Places around the pole',
  latitude: -90,
  longitude: 180,
});
assert.equal(boundaryCoordinates.success, true);

const invalidBodies: unknown[] = [
  null,
  [],
  'query',
  {},
  { query: 42 },
  { query: '' },
  { query: '   ' },
  { query: 'x'.repeat(1201) },
  { query: 'query\u0000hidden' },
  { query: 'query\nsecond line' },
  { query: 'query', latitude: 23 },
  { query: 'query', longitude: 90 },
  { query: 'query', latitude: null, longitude: 90 },
  { query: 'query', latitude: [], longitude: 90 },
  { query: 'query', latitude: 'abc', longitude: '90' },
  { query: 'query', latitude: '1e2', longitude: '90' },
  { query: 'query', latitude: Number.NaN, longitude: 90 },
  { query: 'query', latitude: Number.POSITIVE_INFINITY, longitude: 90 },
  { query: 'query', latitude: 91, longitude: 0 },
  { query: 'query', latitude: -91, longitude: 0 },
  { query: 'query', latitude: 0, longitude: 181 },
  { query: 'query', latitude: 0, longitude: -181 },
  { query: 'query', latitude: '0;DROP TABLE', longitude: '90' },
];

for (const input of invalidBodies) {
  assert.equal(
    validateMapsGroundingRequest(input).success,
    false,
    `Expected invalid Maps grounding input to be rejected: ${JSON.stringify(input).slice(0, 80)}`,
  );
}

const queryAtLimit = validateMapsGroundingRequest({ query: 'q'.repeat(1200) });
assert.equal(queryAtLimit.success, true, 'Query at configured max length should be accepted');

console.log('Maps grounding request validation checks passed.');
