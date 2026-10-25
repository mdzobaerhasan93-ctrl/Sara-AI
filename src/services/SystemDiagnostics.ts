export interface SystemDiagnosticsSnapshot {
  cpuUsagePercent: number | null;
  networkConnected: boolean | null;
  systemOperational: boolean | null;
  source: 'native-telemetry' | 'unavailable';
}

const UNAVAILABLE: SystemDiagnosticsSnapshot = {
  cpuUsagePercent: null,
  networkConnected: null,
  systemOperational: null,
  source: 'unavailable',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Browser code cannot inspect host CPU usage or native app health. Only a
 * separately wired native telemetry adapter may provide this snapshot; absent
 * that adapter, the UI must display unavailable rather than invented values.
 */
export function normalizeSystemDiagnostics(input: unknown): SystemDiagnosticsSnapshot {
  if (!isRecord(input) || input.source !== 'native-telemetry') {
    return { ...UNAVAILABLE };
  }

  const rawCpu = input.cpuUsagePercent;
  const cpuUsagePercent = typeof rawCpu === 'number' && Number.isFinite(rawCpu) && rawCpu >= 0 && rawCpu <= 100
    ? Math.round(rawCpu)
    : null;

  const networkConnected = typeof input.networkConnected === 'boolean'
    ? input.networkConnected
    : null;

  const systemOperational = typeof input.systemOperational === 'boolean'
    ? input.systemOperational
    : null;

  if (cpuUsagePercent === null && networkConnected === null && systemOperational === null) {
    return { ...UNAVAILABLE };
  }

  return {
    cpuUsagePercent,
    networkConnected,
    systemOperational,
    source: 'native-telemetry',
  };
}

export const UNAVAILABLE_SYSTEM_DIAGNOSTICS = UNAVAILABLE;
