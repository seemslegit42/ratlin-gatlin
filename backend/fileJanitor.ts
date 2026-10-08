/**
 * @file backend/fileJanitor.ts
 * @description Server-side janitor for temporary build/runtime artifacts.
 * Run: `bun run backend/fileJanitor.ts`
 */

import { readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_PATHS = [
  join(process.cwd(), 'tmp'),
  join(process.cwd(), '.cache'),
  join(process.cwd(), 'backend', 'tmp'),
  join(process.cwd(), 'backend', '.cache'),
];

const MAX_AGE_MS = Number(process.env.FILE_JANITOR_MAX_AGE_MS ?? 24 * 60 * 60 * 1000);

async function purgeDirectory(dir: string, cutoff: number): Promise<{ removed: number; bytes: number }> {
  let removed = 0;
  let bytes = 0;

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const info = await stat(full);
      const age = Date.now() - info.mtimeMs;
      if (age < cutoff) continue;

      if (entry.isDirectory()) {
        const nested = await purgeDirectory(full, cutoff);
        removed += nested.removed;
        bytes += nested.bytes;
        try {
          await rm(full, { recursive: true, force: true });
          removed++;
        } catch {
          /* non-empty dir */
        }
      } else {
        await rm(full, { force: true });
        removed++;
        bytes += info.size;
      }
    }
  } catch {
    /* missing dir */
  }

  return { removed, bytes };
}

async function main(): Promise<void> {
  const extra = process.env.FILE_JANITOR_PATHS?.split(',').map((p) => p.trim()).filter(Boolean) ?? [];
  const targets = [...DEFAULT_PATHS, ...extra];
  const cutoff = MAX_AGE_MS;

  console.log('[fileJanitor] Starting purge; max age ms:', cutoff);

  let totalRemoved = 0;
  let totalBytes = 0;

  for (const dir of targets) {
    const result = await purgeDirectory(dir, cutoff);
    totalRemoved += result.removed;
    totalBytes += result.bytes;
    if (result.removed > 0) {
      console.log(`[fileJanitor] ${dir}: removed ${result.removed} entries (~${result.bytes} bytes)`);
    }
  }

  console.log(`[fileJanitor] Done. Removed ${totalRemoved} entries (~${totalBytes} bytes).`);
}

main().catch((err) => {
  console.error('[fileJanitor] Fatal:', err);
  process.exit(1);
});
