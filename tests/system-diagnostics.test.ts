import assert from 'node:assert/strict';
import {
  normalizeSystemDiagnostics,
  UNAVAILABLE_SYSTEM_DIAGNOSTICS,
} from '../src/services/SystemDiagnostics.ts';

assert.deepEqual(normalizeSystemDiagnostics(null), UNAVAILABLE_SYSTEM_DIAGNOSTICS);
assert.deepEqual(normalizeSystemDiagnostics([]), UNAVAILABLE_SYSTEM_DIAGNOSTICS);
assert.deepEqual(normalizeSystemDiagnostics({ cpuUsagePercent: 98, networkConnected: true, systemOperational: true }), UNAVAILABLE_SYSTEM_DIAGNOSTICS,
  'Unmarked browser data must not be presented as trusted host telemetry');
assert.deepEqual(normalizeSystemDiagnostics({ source: 'browser', cpuUsagePercent: 98 }), UNAVAILABLE_SYSTEM_DIAGNOSTICS);

assert.deepEqual(normalizeSystemDiagnostics({
  source: 'native-telemetry',
  cpuUsagePercent: 83.6,
  networkConnected: true,
  systemOperational: false,
}), {
  cpuUsagePercent: 84,
  networkConnected: true,
  systemOperational: false,
  source: 'native-telemetry',
});

assert.deepEqual(normalizeSystemDiagnostics({
  source: 'native-telemetry',
  cpuUsagePercent: 1000,
  networkConnected: 'connected',
  systemOperational: null,
}), UNAVAILABLE_SYSTEM_DIAGNOSTICS);

assert.deepEqual(normalizeSystemDiagnostics({
  source: 'native-telemetry',
  cpuUsagePercent: 44,
  networkConnected: 'yes',
  systemOperational: true,
}), {
  cpuUsagePercent: 44,
  networkConnected: null,
  systemOperational: true,
  source: 'native-telemetry',
});

console.log('System diagnostics are unavailable without native telemetry; invalid readings are discarded.');
