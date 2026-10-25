export interface MapsGroundingCoordinates {
  latitude: number;
  longitude: number;
}

export interface ValidatedMapsGroundingRequest {
  query: string;
  coordinates?: MapsGroundingCoordinates;
}

export type MapsGroundingValidationResult =
  | { success: true; data: ValidatedMapsGroundingRequest }
  | { success: false; error: string };

const MAX_QUERY_LENGTH = 1200;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseCoordinate(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  if (typeof value === 'string' && !/^-?\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const numeric = typeof value === 'number' ? value : Number(value.trim());
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Validates a Google Maps grounding request before any provider/API call.
 * Coordinates must be supplied as a pair; query and numeric ranges are bounded.
 */
export function validateMapsGroundingRequest(input: unknown): MapsGroundingValidationResult {
  if (!isRecord(input)) {
    return { success: false, error: 'Request body must be an object.' };
  }

  if (typeof input.query !== 'string') {
    return { success: false, error: 'A search query is required.' };
  }

  const query = input.query.trim();
  if (!query) {
    return { success: false, error: 'A search query is required.' };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return { success: false, error: `Search query must be ${MAX_QUERY_LENGTH} characters or fewer.` };
  }
  if (CONTROL_CHARACTERS.test(query)) {
    return { success: false, error: 'Search query contains unsupported control characters.' };
  }

  const hasLatitude = input.latitude !== undefined && input.latitude !== null;
  const hasLongitude = input.longitude !== undefined && input.longitude !== null;
  if (hasLatitude !== hasLongitude) {
    return { success: false, error: 'Latitude and longitude must be provided together.' };
  }

  if (!hasLatitude && !hasLongitude) {
    return { success: true, data: { query } };
  }

  const latitude = parseCoordinate(input.latitude);
  const longitude = parseCoordinate(input.longitude);
  if (latitude === null || longitude === null) {
    return { success: false, error: 'Latitude and longitude must be valid finite numbers.' };
  }
  if (latitude < -90 || latitude > 90) {
    return { success: false, error: 'Latitude must be between -90 and 90.' };
  }
  if (longitude < -180 || longitude > 180) {
    return { success: false, error: 'Longitude must be between -180 and 180.' };
  }

  return { success: true, data: { query, coordinates: { latitude, longitude } } };
}
