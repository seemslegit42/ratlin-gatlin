import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  EPHEMERAL_STORAGE_PREFIX,
  getEphemeralLocalItem,
  PROTECTED_LOCAL_STORAGE_KEYS,
  registerBlobUrl,
  revokeBlobUrl,
  setEphemeralLocalItem,
} from './fileManagementService.js';

describe('fileManagementService', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    const mockStorage = {
      get length() {
        return storage.size;
      },
      key: (i: number) => [...storage.keys()][i] ?? null,
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
      clear: () => storage.clear(),
    };
    const win = { localStorage: mockStorage as Storage };
    (globalThis as { localStorage?: Storage; window?: typeof win }).localStorage = mockStorage as Storage;
    (globalThis as { window?: typeof win }).window = win as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    storage.clear();
  });

  it('protected keys set includes sovereign credentials', () => {
    expect(PROTECTED_LOCAL_STORAGE_KEYS.has('beep_access_keys')).toBe(true);
    expect(PROTECTED_LOCAL_STORAGE_KEYS.has('beep_integrations')).toBe(true);
  });

  it('setEphemeralLocalItem expires entries', () => {
    setEphemeralLocalItem('scratch', { ok: 1 }, 50);
    expect(getEphemeralLocalItem<{ ok: number }>('scratch')).toEqual({ ok: 1 });

    const key = `${EPHEMERAL_STORAGE_PREFIX}scratch`;
    const raw = storage.get(key);
    expect(raw).toBeTruthy();
    if (raw) {
      const env = JSON.parse(raw) as { exp: number };
      env.exp = Date.now() - 1;
      storage.set(key, JSON.stringify(env));
    }
    expect(getEphemeralLocalItem('scratch')).toBeNull();
    expect(storage.has(key)).toBe(false);
  });

  it('registerBlobUrl tracks and revokes blob URLs', () => {
    const revoke = globalThis.URL.revokeObjectURL;
    let revoked: string | null = null;
    globalThis.URL.revokeObjectURL = (url: string) => {
      revoked = url;
    };

    const url = 'blob:https://example.com/abc';
    const dispose = registerBlobUrl(url);
    revokeBlobUrl(url);
    expect(revoked).toBe(url);
    dispose();

    globalThis.URL.revokeObjectURL = revoke;
  });
});
