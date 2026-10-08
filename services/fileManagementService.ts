/**
 * @file services/fileManagementService.ts
 * @description Automatic purge and hygiene for ephemeral browser storage, caches, blob URLs,
 * in-memory rings, and aged chronicle rows. Protected user keys are never removed.
 */

import { tablesDB, DATABASE_ID, TABLES, Query } from './appwriteClient.js';
import { logDataEvent, logSystemEvent, trimLogRing } from './appLogger.js';
import { telemetry } from './telemetryService.js';
import { reset as resetMediaPipeCache } from './mediapieLLMService.js';
import type {
  FileManagementConfig,
  FileManagementReport,
  FileManagementSliceResult,
  FileManagementTrigger,
} from './fileManagementTypes.js';
import { DEFAULT_FILE_MANAGEMENT_CONFIG } from './fileManagementTypes.js';

/** Keys that must never be deleted by automated hygiene. */
export const PROTECTED_LOCAL_STORAGE_KEYS = new Set([
  'beep_system_uuid',
  'beep_access_keys',
  'beep_integrations',
  'command_palette_history',
]);

/** Session keys preserved across sweeps (UX preferences). */
export const PROTECTED_SESSION_STORAGE_KEYS = new Set(['beep-ai-dock-expanded']);

/** Prefix for TTL-backed ephemeral entries written by the app. */
export const EPHEMERAL_STORAGE_PREFIX = 'lvx:ephemeral:';

const COMMAND_PALETTE_HISTORY_KEY = 'command_palette_history';

const emptySlice = (): FileManagementSliceResult => ({
  removed: 0,
  trimmed: 0,
  bytesReclaimedEstimate: 0,
  errors: [],
});

let config: FileManagementConfig = { ...DEFAULT_FILE_MANAGEMENT_CONFIG };
let bootstrapInstalled = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
const trackedBlobUrls = new Set<string>();

function readEnvFlag(name: string, fallback: boolean): boolean {
  if (typeof import.meta === 'undefined') return fallback;
  const raw = import.meta.env?.[name];
  if (raw === 'false' || raw === '0') return false;
  if (raw === 'true' || raw === '1') return true;
  return fallback;
}

function readEnvNumber(name: string, fallback: number): number {
  if (typeof import.meta === 'undefined') return fallback;
  const raw = import.meta.env?.[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function resolveFileManagementConfig(): FileManagementConfig {
  return {
    enabled: readEnvFlag('VITE_FILE_MGMT_ENABLED', DEFAULT_FILE_MANAGEMENT_CONFIG.enabled),
    intervalMs: readEnvNumber('VITE_FILE_MGMT_INTERVAL_MS', DEFAULT_FILE_MANAGEMENT_CONFIG.intervalMs),
    commandHistoryMax: readEnvNumber(
      'VITE_FILE_MGMT_COMMAND_HISTORY_MAX',
      DEFAULT_FILE_MANAGEMENT_CONFIG.commandHistoryMax,
    ),
    chronicleRetentionDays: readEnvNumber(
      'VITE_FILE_MGMT_CHRONICLE_RETENTION_DAYS',
      DEFAULT_FILE_MANAGEMENT_CONFIG.chronicleRetentionDays,
    ),
    chronicleMaxPerCycle: readEnvNumber(
      'VITE_FILE_MGMT_CHRONICLE_MAX_PER_CYCLE',
      DEFAULT_FILE_MANAGEMENT_CONFIG.chronicleMaxPerCycle,
    ),
    ephemeralMaxAgeMs: readEnvNumber(
      'VITE_FILE_MGMT_EPHEMERAL_MAX_AGE_MS',
      DEFAULT_FILE_MANAGEMENT_CONFIG.ephemeralMaxAgeMs,
    ),
    cacheMaxAgeMs: readEnvNumber(
      'VITE_FILE_MGMT_CACHE_MAX_AGE_MS',
      DEFAULT_FILE_MANAGEMENT_CONFIG.cacheMaxAgeMs,
    ),
  };
}

export function configureFileManagement(partial: Partial<FileManagementConfig>): void {
  config = { ...config, ...partial };
}

/**
 * Register a blob URL for automatic revocation during hygiene cycles.
 * Returns an unsubscribe that revokes immediately when invoked.
 */
export function registerBlobUrl(url: string): () => void {
  if (!url.startsWith('blob:')) return () => {};
  trackedBlobUrls.add(url);
  return () => {
    revokeBlobUrl(url);
  };
}

export function revokeBlobUrl(url: string): void {
  if (!url.startsWith('blob:')) return;
  try {
    URL.revokeObjectURL(url);
    trackedBlobUrls.delete(url);
  } catch {
    trackedBlobUrls.delete(url);
  }
}

function estimateBytes(value: string | null): number {
  if (!value) return 0;
  return value.length * 2;
}

function pruneCommandPaletteHistory(maxItems: number): FileManagementSliceResult {
  const result = emptySlice();
  if (typeof window === 'undefined') return result;

  try {
    const raw = window.localStorage.getItem(COMMAND_PALETTE_HISTORY_KEY);
    if (!raw) return result;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return result;

    if (parsed.length <= maxItems) return result;

    const trimmed = parsed.slice(-maxItems);
    const next = JSON.stringify(trimmed);
    result.bytesReclaimedEstimate += estimateBytes(raw) - estimateBytes(next);
    window.localStorage.setItem(COMMAND_PALETTE_HISTORY_KEY, next);
    result.trimmed = parsed.length - trimmed.length;
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'command_palette_history');
  }

  return result;
}

function pruneEphemeralLocalStorage(maxAgeMs: number): FileManagementSliceResult {
  const result = emptySlice();
  if (typeof window === 'undefined') return result;

  const now = Date.now();

  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(EPHEMERAL_STORAGE_PREFIX)) continue;
    if (PROTECTED_LOCAL_STORAGE_KEYS.has(key)) continue;

    const raw = window.localStorage.getItem(key);
    try {
      const envelope = raw ? (JSON.parse(raw) as { exp?: number; v?: unknown }) : null;
      const expired = !envelope?.exp || envelope.exp < now;
      if (expired) {
        result.bytesReclaimedEstimate += estimateBytes(raw);
        window.localStorage.removeItem(key);
        result.removed++;
      }
    } catch {
      result.bytesReclaimedEstimate += estimateBytes(raw);
      window.localStorage.removeItem(key);
      result.removed++;
    }
  }

  return result;
}

function pruneLocalStorage(): FileManagementSliceResult {
  const merged = emptySlice();
  const history = pruneCommandPaletteHistory(config.commandHistoryMax);
  const ephemeral = pruneEphemeralLocalStorage(config.ephemeralMaxAgeMs);

  merged.removed = history.removed + ephemeral.removed;
  merged.trimmed = history.trimmed + ephemeral.trimmed;
  merged.bytesReclaimedEstimate = history.bytesReclaimedEstimate + ephemeral.bytesReclaimedEstimate;
  merged.errors.push(...history.errors, ...ephemeral.errors);

  return merged;
}

function pruneSessionStorage(): FileManagementSliceResult {
  const result = emptySlice();
  if (typeof window === 'undefined') return result;

  for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
    const key = window.sessionStorage.key(i);
    if (!key) continue;
    if (PROTECTED_SESSION_STORAGE_KEYS.has(key)) continue;
    if (!key.startsWith(EPHEMERAL_STORAGE_PREFIX)) continue;

    const raw = window.sessionStorage.getItem(key);
    result.bytesReclaimedEstimate += estimateBytes(raw);
    window.sessionStorage.removeItem(key);
    result.removed++;
  }

  return result;
}

async function pruneCaches(): Promise<FileManagementSliceResult> {
  const result = emptySlice();
  if (typeof caches === 'undefined') return result;

  try {
    const names = await caches.keys();
    const cutoff = Date.now() - config.cacheMaxAgeMs;

    for (const name of names) {
      if (!name.startsWith('lvx-') && !name.includes('levon') && !name.includes('aeon')) {
        continue;
      }

      const cache = await caches.open(name);
      const requests = await cache.keys();
      for (const req of requests) {
        const res = await cache.match(req);
        const dateHeader = res?.headers.get('date');
        const servedAt = dateHeader ? Date.parse(dateHeader) : 0;
        if (servedAt && servedAt < cutoff) {
          await cache.delete(req);
          result.removed++;
        }
      }

      const remaining = await cache.keys();
      if (remaining.length === 0) {
        await caches.delete(name);
        result.removed++;
      }
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'cache_prune');
  }

  return result;
}

function revokeTrackedBlobUrls(): FileManagementSliceResult {
  const result = emptySlice();
  for (const url of [...trackedBlobUrls]) {
    try {
      URL.revokeObjectURL(url);
      result.removed++;
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : 'blob_revoke');
    } finally {
      trackedBlobUrls.delete(url);
    }
  }
  return result;
}

function trimInMemoryBuffers(): FileManagementSliceResult {
  const result = emptySlice();
  try {
    const beforeLogs = trimLogRing();
    if (beforeLogs > 0) {
      result.trimmed += beforeLogs;
      result.bytesReclaimedEstimate += beforeLogs * 200;
    }
    const beforeTelemetry = telemetry.pruneOldEvents();
    if (beforeTelemetry > 0) {
      result.trimmed += beforeTelemetry;
      result.bytesReclaimedEstimate += beforeTelemetry * 120;
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'in_memory');
  }
  return result;
}

async function pruneChronicleEvents(
  syndicateId: string | undefined,
): Promise<FileManagementSliceResult | undefined> {
  if (!syndicateId) return undefined;

  const result = emptySlice();
  const cutoff = Date.now() - config.chronicleRetentionDays * 24 * 60 * 60 * 1000;

  try {
    const { rows } = await tablesDB.listRows(DATABASE_ID, TABLES.CHRONICLE_EVENTS, [
      Query.equal('syndicate_id', syndicateId),
      Query.lessThan('timestamp', cutoff),
      Query.orderAsc('timestamp'),
      Query.limit(config.chronicleMaxPerCycle),
    ]);

    for (const row of rows) {
      await tablesDB.deleteRow(DATABASE_ID, TABLES.CHRONICLE_EVENTS, row.$id);
      result.removed++;
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'chronicle_prune');
  }

  return result;
}

let cycleInFlight: Promise<FileManagementReport> | null = null;

export interface RunFileManagementOptions {
  trigger: FileManagementTrigger;
  syndicateId?: string;
  /** Release MediaPipe WASM instance on heavy cleanup (logout / manual). */
  releaseLlmCache?: boolean;
}

/**
 * Executes one full hygiene cycle. Concurrent calls share the same in-flight promise.
 */
export async function runFileManagementCycle(
  options: RunFileManagementOptions,
): Promise<FileManagementReport> {
  if (!config.enabled) {
    return {
      trigger: options.trigger,
      startedAt: Date.now(),
      finishedAt: Date.now(),
      localStorage: emptySlice(),
      sessionStorage: emptySlice(),
      caches: emptySlice(),
      blobUrls: emptySlice(),
      inMemory: emptySlice(),
    };
  }

  if (cycleInFlight) return cycleInFlight;

  cycleInFlight = (async () => {
    const startedAt = Date.now();
    logSystemEvent('file_mgmt.cycle_start', { trigger: options.trigger });

    const localStorage = pruneLocalStorage();
    const sessionStorage = pruneSessionStorage();
    const caches = await pruneCaches();
    const blobUrls = revokeTrackedBlobUrls();
    const inMemory = trimInMemoryBuffers();
    const chronicle = await pruneChronicleEvents(options.syndicateId);

    if (options.releaseLlmCache) {
      resetMediaPipeCache();
    }

    const report: FileManagementReport = {
      trigger: options.trigger,
      startedAt,
      finishedAt: Date.now(),
      localStorage,
      sessionStorage,
      caches,
      blobUrls,
      inMemory,
      chronicle,
    };

    const totalRemoved =
      localStorage.removed +
      sessionStorage.removed +
      caches.removed +
      blobUrls.removed +
      (chronicle?.removed ?? 0);

    logDataEvent('file_mgmt.cycle_complete', {
      trigger: options.trigger,
      totalRemoved,
      bytesEstimate:
        localStorage.bytesReclaimedEstimate +
        sessionStorage.bytesReclaimedEstimate +
        inMemory.bytesReclaimedEstimate,
      errors: [
        ...localStorage.errors,
        ...sessionStorage.errors,
        ...caches.errors,
        ...blobUrls.errors,
        ...inMemory.errors,
        ...(chronicle?.errors ?? []),
      ].length,
    });

    return report;
  })().finally(() => {
    cycleInFlight = null;
  });

  return cycleInFlight;
}

/**
 * Writes a TTL-backed value under `lvx:ephemeral:` — safe for scratch data.
 */
export function setEphemeralLocalItem(key: string, value: unknown, ttlMs: number): void {
  if (typeof window === 'undefined') return;
  const storageKey = key.startsWith(EPHEMERAL_STORAGE_PREFIX) ? key : `${EPHEMERAL_STORAGE_PREFIX}${key}`;
  const envelope = { v: value, exp: Date.now() + ttlMs };
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(envelope));
  } catch {
    /* quota */
  }
}

export function getEphemeralLocalItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const storageKey = key.startsWith(EPHEMERAL_STORAGE_PREFIX) ? key : `${EPHEMERAL_STORAGE_PREFIX}${key}`;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const envelope = JSON.parse(raw) as { v: T; exp: number };
    if (!envelope.exp || envelope.exp < Date.now()) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return envelope.v;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function initializeFileManagement(): () => void {
  config = resolveFileManagementConfig();

  if (bootstrapInstalled || typeof window === 'undefined') {
    return () => {};
  }
  bootstrapInstalled = true;

  void runFileManagementCycle({ trigger: 'bootstrap' });

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      void runFileManagementCycle({ trigger: 'visibility_hidden' });
    }
  };

  document.addEventListener('visibilitychange', onVisibility);

  if (config.intervalMs > 0) {
    intervalHandle = setInterval(() => {
      void runFileManagementCycle({ trigger: 'interval' });
    }, config.intervalMs);
  }

  logSystemEvent('file_mgmt.initialized', {
    intervalMs: config.intervalMs,
    enabled: config.enabled,
  });

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    bootstrapInstalled = false;
  };
}

export function stopFileManagementInterval(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
