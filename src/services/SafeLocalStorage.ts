export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    // Some browsers/security modes can throw just by accessing localStorage.
    return null;
  }
}

export function safeLocalStorageGetItem(
  key: string,
  storage: StorageLike | null = resolveBrowserStorage(),
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeLocalStorageSetItem(
  key: string,
  value: string,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    // QuotaExceededError, SecurityError, or a browser storage policy must not
    // crash UI updates. A false result means the data was not persisted.
    return false;
  }
}

export function safeLocalStorageRemoveItem(
  key: string,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  try {
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
