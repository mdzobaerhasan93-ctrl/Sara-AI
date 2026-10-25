import assert from 'node:assert/strict';
import {
  fetchCurrentWeather,
  validateWeatherCoordinates,
} from '../src/services/WeatherService.ts';

const defaultCoordinates = validateWeatherCoordinates(undefined, undefined);
assert.equal(defaultCoordinates.success, true);
if (defaultCoordinates.success) {
  assert.equal(defaultCoordinates.coordinates.latitude, 23.8103);
  assert.equal(defaultCoordinates.coordinates.longitude, 90.4125);
}

const validCoordinates = validateWeatherCoordinates('51.5072', '-0.1276');
assert.equal(validCoordinates.success, true);
if (validCoordinates.success) {
  assert.equal(validCoordinates.coordinates.latitude, 51.5072);
  assert.equal(validCoordinates.coordinates.longitude, -0.1276);
}

for (const [lat, lon] of [
  ['91', '0'],
  ['-91', '0'],
  ['0', '181'],
  ['0', '-181'],
  ['abc', '0'],
  ['0', 'NaN'],
  ['', '0'],
  [['23.8'], '90.4'],
  ['0;DROP TABLE users', '90'],
]) {
  assert.equal(validateWeatherCoordinates(lat, lon).success, false, `Invalid coordinates should be rejected: ${String(lat)}, ${String(lon)}`);
}

let seenUrl: URL | null = null;
const successfulFetch: typeof fetch = async (input) => {
  seenUrl = new URL(String(input));
  return new Response(JSON.stringify({
    current: {
      temperature_2m: 27.6,
      relative_humidity_2m: 83,
      weather_code: 3,
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

const current = await fetchCurrentWeather(
  { latitude: 23.8103, longitude: 90.4125 },
  successfulFetch,
);
assert.deepEqual(current, { success: true, temp: 28, code: 3, humidity: 83 });
assert.equal(seenUrl?.origin, 'https://api.open-meteo.com');
assert.equal(seenUrl?.searchParams.get('latitude'), '23.8103');
assert.equal(seenUrl?.searchParams.get('longitude'), '90.4125');

const exactZeroFetch: typeof fetch = async () => new Response(JSON.stringify({
  current: { temperature_2m: 0, relative_humidity_2m: 0, weather_code: 0 },
}), { status: 200 });
assert.deepEqual(
  await fetchCurrentWeather({ latitude: 0, longitude: 0 }, exactZeroFetch),
  { success: true, temp: 0, code: 0, humidity: 0 },
  'Real zero-valued readings must not be treated as missing',
);

for (const payload of [
  {},
  { current: null },
  { current: { temperature_2m: null } },
  { current: { temperature_2m: '28' } },
  { current: { temperature_2m: 100 } },
  { current: { temperature_2m: -150 } },
]) {
  const invalidPayloadFetch: typeof fetch = async () => new Response(JSON.stringify(payload), { status: 200 });
  const result = await fetchCurrentWeather({ latitude: 0, longitude: 0 }, invalidPayloadFetch);
  assert.equal(result.success, false, 'Incomplete or invalid provider payloads must fail rather than inventing a reading');
}

const httpFailureFetch: typeof fetch = async () => new Response('upstream unavailable', { status: 503 });
const httpFailure = await fetchCurrentWeather({ latitude: 0, longitude: 0 }, httpFailureFetch);
assert.deepEqual(httpFailure, {
  success: false,
  error: 'Weather provider returned an unsuccessful response.',
});

const networkFailureFetch: typeof fetch = async () => {
  throw new Error('private upstream details should not leak');
};
const networkFailure = await fetchCurrentWeather({ latitude: 0, longitude: 0 }, networkFailureFetch);
assert.equal(networkFailure.success, false);
if (!networkFailure.success) {
  assert.match(networkFailure.error, /could not be reached/);
  assert.ok(!networkFailure.error.includes('private upstream details'));
}

console.log('Weather coordinates, provider validation, error reporting, and no-fake-temperature checks passed.');
