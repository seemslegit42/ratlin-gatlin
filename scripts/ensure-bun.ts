import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawn, spawnSync } from 'bun';
import { isOperatorMode, status, statusAttention } from './operator-status.js';

const BUN_BIN = join(homedir(), '.bun', 'bin', 'bun');

export function bunExecutable(): string {
  if (existsSync(BUN_BIN)) return BUN_BIN;
  const which = spawnSync(['which', 'bun']);
  if (which.exitCode === 0) {
    return new TextDecoder().decode(which.stdout).trim() || 'bun';
  }
  return BUN_BIN;
}

export function bunOnPath(): boolean {
  const exe = bunExecutable();
  if (existsSync(exe)) return true;
  return spawnSync(['which', 'bun']).exitCode === 0;
}

export async function ensureBunInstalled(): Promise<string> {
  if (bunOnPath()) return bunExecutable();

  status('working');
  const install = spawn({
    cmd: ['bash', '-lc', 'curl -fsSL https://bun.sh/install | bash'],
    stdout: isOperatorMode() ? 'pipe' : 'inherit',
    stderr: isOperatorMode() ? 'pipe' : 'inherit',
    env: process.env,
  });
  const code = await install.exited;
  if (code !== 0 || !existsSync(BUN_BIN)) {
    statusAttention();
  }
  return BUN_BIN;
}
