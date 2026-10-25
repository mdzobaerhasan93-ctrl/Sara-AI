export interface WeatherCoordinates {
  latitude: number;
  longitude: number;
}

export type CoordinateValidation =
  | { success: true; coordinates: WeatherCoordinates }
  | { success: false; error: string };

export interface CurrentWeather {
  success: true;
  temp: number;
  code?: number;
  humidity?: number;
}

export type WeatherLookupResult =
  | CurrentWeather
  | { success: false; error: string };

const DEFAULT_LATITUDE = 23.8103;
const DEFAULT_LONGITUDE = 90.4125;
const WEATHER_TIMEOUT_MS = 8_000;

function parseCoordinate(value: unknown, name: string, fallback: number, min: number, max: number):
  | { success: true; value: number }
  | { success: false; error: string } {
  if (value === undefined || value === null) {
    return { success: true, value: fallback };
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return { success: false, error: `${name} must be a single numeric value.` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { success: false, error: `${name} must not be empty.` };
  }

  const parsed = typeof value === 'number' ? value : Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { success: false, error: `${name} must be between ${min} and ${max}.` };
  }

  return { success: true, value: parsed };
}

/** Missing coordinates preserve the existing Dhaka default; explicit bad values are rejected. */
export function validateWeatherCoordinates(latitudeInput: unknown, longitudeInput: unknown): CoordinateValidation {
  const latitude = parseCoordinate(latitudeInput, 'Latitude', DEFAULT_LATITUDE, -90, 90);
  if (!latitude.success) return latitude;

  const longitude = parseCoordinate(longitudeInput, 'Longitude', DEFAULT_LONGITUDE, -180, 180);
  if (!longitude.success) return longitude;

  return {
    success: true,
    coordinates: {
      latitude: latitude.value,
      longitude: longitude.value,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Calls Open-Meteo and returns a typed result. Failures are never replaced with
 * made-up temperatures. fetchImpl is injectable for deterministic tests.
 */
export async function fetchCurrentWeather(
  coordinates: WeatherCoordinates,
  fetchImpl: typeof fetch = fetch,
): Promise<WeatherLookupResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(coordinates.latitude));
  url.searchParams.set('longitude', String(coordinates.longitude));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code');

  let response: Response;
  try {
    response = await fetchImpl(url, {
      signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
  } catch {
    return {
      success: false,
      error: 'Weather provider could not be reached. Please retry shortly.',
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: 'Weather provider returned an unsuccessful response.',
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return {
      success: false,
      error: 'Weather provider returned an unreadable response.',
    };
  }

  if (!isRecord(data) || !isRecord(data.current)) {
    return {
      success: false,
      error: 'Weather provider returned an incomplete response.',
    };
  }

  const temperature = data.current.temperature_2m;
  if (
    typeof temperature !== 'number' ||
    !Number.isFinite(temperature) ||
    temperature < -100 ||
    temperature > 70
  ) {
    return {
      success: false,
      error: 'Weather provider returned an invalid temperature.',
    };
  }

  const result: CurrentWeather = {
    success: true,
    temp: Math.round(temperature),
  };

  const weatherCode = data.current.weather_code;
  if (typeof weatherCode === 'number' && Number.isInteger(weatherCode) && weatherCode >= 0 && weatherCode <= 99) {
    result.code = weatherCode;
  }

  const humidity = data.current.relative_humidity_2m;
  if (typeof humidity === 'number' && Number.isFinite(humidity) && humidity >= 0 && humidity <= 100) {
    result.humidity = humidity;
  }

  return result;
}
