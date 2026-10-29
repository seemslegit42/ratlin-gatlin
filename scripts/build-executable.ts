#!/usr/bin/env bun
import { mkdirSync, chmodSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'bun';
import { ensureBunInstalled } from './ensure-bun.js';
import { status, statusAttention } from './operator-status.js';

const ROOT = resolve(import.meta.dir, '..');

async function main(): Promise<void> {
  status('working');
  const bun = await ensureBunInstalled();
  const outFile = join(ROOT, 'dist', 'beep-app');
  mkdirSync(join(ROOT, 'dist'), { recursive: true });
  const r = spawnSync([
    bun,
    'build',
    '--compile',
    join(ROOT, 'scripts/run-appliance.ts'),
    '--outfile',
    outFile,
  ]);
  if (r.exitCode !== 0 || !existsSync(outFile)) statusAttention();
  chmodSync(outFile, 0o755);
  status('done');
}

main().catch(() => statusAttention());
