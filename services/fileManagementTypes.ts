/**
 * @file services/fileManagementTypes.ts
 * @description Shared types for the client file-management and storage hygiene subsystem.
 */

export type FileManagementTrigger =
  | 'bootstrap'
  | 'interval'
  | 'workflow_complete'
  | 'logout'
  | 'session_expired'
  | 'visibility_hidden'
  | 'manual';

export interface FileManagementSliceResult {
  removed: number;
  trimmed: number;
  bytesReclaimedEstimate: number;
  errors: string[];
}

export interface FileManagementReport {
  trigger: FileManagementTrigger;
  startedAt: number;
  finishedAt: number;
  localStorage: FileManagementSliceResult;
  sessionStorage: FileManagementSliceResult;
  caches: FileManagementSliceResult;
  blobUrls: FileManagementSliceResult;
  inMemory: FileManagementSliceResult;
  chronicle?: FileManagementSliceResult;
}

export interface FileManagementConfig {
  enabled: boolean;
  intervalMs: number;
  commandHistoryMax: number;
  chronicleRetentionDays: number;
  chronicleMaxPerCycle: number;
  ephemeralMaxAgeMs: number;
  cacheMaxAgeMs: number;
}

export const DEFAULT_FILE_MANAGEMENT_CONFIG: FileManagementConfig = {
  enabled: true,
  intervalMs: 15 * 60 * 1000,
  commandHistoryMax: 50,
  chronicleRetentionDays: 90,
  chronicleMaxPerCycle: 40,
  ephemeralMaxAgeMs: 24 * 60 * 60 * 1000,
  cacheMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
};
