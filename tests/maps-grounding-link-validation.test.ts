import assert from 'node:assert/strict';
import { sanitizeMapsGroundingLinks } from '../src/services/MapsGroundingLinkValidation.ts';

const valid = sanitizeMapsGroundingLinks([
  { maps: { title: 'Dhaka Museum', uri: 'https://www.google.com/maps/place/Dhaka+Museum' } },
  { maps: { title: 'Nearby places', uri: 'https://maps.google.com/?q=Dhaka' } },
  { maps: { title: 'Short maps link', uri: 'https://maps.app.goo.gl/AbCdEf123' } },
]);
assert.equal(valid.length, 3);
assert.deepEqual(valid.map(item => item.title), ['Dhaka Museum', 'Nearby places', 'Short maps link']);
assert.ok(valid.every(item => item.uri.startsWith('https://')));

const invalid = sanitizeMapsGroundingLinks([
  { maps: { title: 'HTTP', uri: 'http://www.google.com/maps/place/Dhaka' } },
  { maps: { title: 'JavaScript', uri: 'javascript:alert(1)' } },
  { maps: { title: 'Data URL', uri: 'data:text/html,<script>alert(1)</script>' } },
  { maps: { title: 'Credential URL', uri: 'https://user:pass@www.google.com/maps/place/Dhaka' } },
  { maps: { title: 'Lookalike domain', uri: 'https://www.google.com.attacker.example/maps/place/Dhaka' } },
  { maps: { title: 'Non Maps page', uri: 'https://www.google.com/search?q=Dhaka' } },
  { maps: { title: 'Wrong provider', uri: 'https://example.com/maps/place/Dhaka' } },
  { maps: { title: 'Malformed', uri: 'not a URL' } },
  { maps: { title: 'Control chars', uri: 'https://www.google.com/maps/\nplace/Dhaka' } },
  { maps: { title: 'Too long', uri: 'https://www.google.com/maps/' + 'x'.repeat(3000) } },
  { maps: { title: 'Wrong type', uri: 42 } },
  { web: { title: 'Not a maps chunk', uri: 'https://www.google.com/maps/place/Dhaka' } },
]);
assert.deepEqual(invalid, []);

const fallbackTitle = sanitizeMapsGroundingLinks([
  { maps: { title: '  ', uri: 'https://www.google.com/maps/place/Dhaka' } },
])[0];
assert.equal(fallbackTitle.title, 'Google Maps Location');

const longTitle = sanitizeMapsGroundingLinks([
  { maps: { title: 'T'.repeat(300), uri: 'https://www.google.com/maps/place/Dhaka' } },
])[0];
assert.equal(longTitle.title.length, 160);

const duplicate = sanitizeMapsGroundingLinks([
  { maps: { title: 'First title', uri: 'https://www.google.com/maps/place/Dhaka' } },
  { maps: { title: 'Duplicate title', uri: 'https://www.google.com/maps/place/Dhaka' } },
]);
assert.equal(duplicate.length, 1);
assert.equal(duplicate[0].title, 'First title');

const many = sanitizeMapsGroundingLinks(Array.from({ length: 60 }, (_, index) => ({
  maps: { title: `Place ${index}`, uri: `https://www.google.com/maps/place/${index}` },
})));
assert.equal(many.length, 20);

assert.deepEqual(sanitizeMapsGroundingLinks(null), []);
assert.deepEqual(sanitizeMapsGroundingLinks({}), []);

console.log('Maps grounding output URL allowlist, sanitization, deduplication, and bounds checks passed.');
