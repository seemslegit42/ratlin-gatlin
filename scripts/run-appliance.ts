#!/usr/bin/env bun
/**
 * Operator launcher — use via bun dev | bun start | bun run build | dist/beep-app
 */
import { spawn, spawnSync, type Subprocess, type SubprocessStdout } from 'bun';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ensureAppwriteStackFiles, appwriteComposeReady } from './ensure-appwrite-stack.js';
import { ensureBunInstalled, bunExecutable } from './ensure-bun.js';
import { isOperatorMode, status, statusAttention } from './operator-status.js';

const ROOT = resolve(import.meta.dir, '..');
const COMPOSE_SOVEREIGN = join(ROOT, 'docker-compose.sovereign.yml');
const COMPOSE_BASE = join(ROOT, 'docker-compose.yml');
const COMPOSE_DEV = join(ROOT, 'docker-compose.dev.yml');
const APP_URL = process.env.BEEP_APP_URL ?? 'http://127.0.0.1:3000';

const MODE = (process.argv[2] ?? 'start') as 'dev' | 'start' | 'build';

function io(): { stdout: SubprocessStdout; stderr: SubprocessStdout } {
  return isOperatorMode()
    ? { stdout: 'pipe', stderr: 'pipe' }
    : { stdout: 'inherit', stderr: 'inherit' };
}

function dockerAvailable(): boolean {
  return spawnSync(['docker', 'compose', 'version']).exitCode === 0;
}

async function runCmd(cmd: string[], cwd = ROOT): Promise<number> {
  const proc = spawn({
    cmd,
    cwd,
    stdin: 'inherit',
    ...io(),
    env: { ...process.env, BEEP_OPERATOR: '1', BEEP_APPLIANCE: '1' },
  });
  return proc.exited;
}

async function ensureDependencies(bun: string): Promise<void> {
  status('working');
  if ((await runCmd([bun, 'install'], ROOT)) !== 0) statusAttention();
}

async function ensureEnvFile(bun: string): Promise<void> {
  const code = await runCmd([bun, 'run', 'scripts/env-automator.ts'], ROOT);
  if (code !== 0) statusAttention();
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === 'darwin'
      ? ['open', url]
      : platform === 'win32'
        ? ['cmd', '/c', 'start', '', url]
        : ['xdg-open', url];
  spawnSync({ cmd, stdout: 'ignore', stderr: 'ignore' });
}

async function waitForUrl(url: string, attempts = 60): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok || res.status < 500) return true;
    } catch {
      /* retry */
    }
    await Bun.sleep(2000);
  }
  return false;
}

function composeFileArgs(): string[] {
  return existsSync(COMPOSE_SOVEREIGN)
    ? ['-f', COMPOSE_SOVEREIGN]
    : ['-f', COMPOSE_BASE, '-f', COMPOSE_DEV];
}

async function raiseDockerStack(): Promise<void> {
  if (!dockerAvailable()) return;

  status('working');
  try {
    await ensureAppwriteStackFiles();
  } catch {
    statusAttention();
  }
  if (!appwriteComposeReady()) statusAttention();

  const composeFiles = composeFileArgs();
  if ((await runCmd(['docker', 'compose', ...composeFiles, 'config', '-q'])) !== 0) {
    statusAttention();
  }
  if (
    (await runCmd([
      'docker',
      'compose',
      ...composeFiles,
      'up',
      '-d',
      '--remove-orphans',
      '--build',
    ])) !== 0
  ) {
    statusAttention();
  }

  await waitForUrl('http://127.0.0.1/v1/health', 90);
  await waitForUrl('http://127.0.0.1:3100/health', 20);
}

let childProc: Subprocess | null = null;
let shuttingDown = false;

function registerShutdown(composeFiles: string[]): void {
  const down = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    childProc?.kill();
    if (dockerAvailable()) {
      await runCmd(['docker', 'compose', ...composeFiles, 'down', '--remove-orphans']);
    }
    process.exit(0);
  };
  process.on('SIGINT', () => void down());
  process.on('SIGTERM', () => void down());
}

async function modeBuild(bun: string): Promise<void> {
  status('working');
  await ensureDependencies(bun);
  if ((await runCmd([bun, 'x', '--bun', 'vite', 'build'], ROOT)) !== 0) statusAttention();
  status('done');
}

async function launchServer(bun: string, preview: boolean): Promise<void> {
  const cmd = preview
    ? [bun, 'x', '--bun', 'vite', 'preview', '--host', '0.0.0.0', '--port', '3000']
    : [bun, 'x', '--bun', 'vite'];

  childProc = spawn({
    cmd,
    cwd: ROOT,
    stdin: 'inherit',
    ...io(),
    env: { ...process.env, BEEP_OPERATOR: '1', BEEP_APPLIANCE: '1' },
  });

  if (await waitForUrl(APP_URL, preview ? 30 : 45)) {
    status('ready');
    openBrowser(APP_URL);
  }

  await childProc.exited;
}

async function modeStart(bun: string): Promise<void> {
  status('working');
  await ensureDependencies(bun);
  await ensureEnvFile(bun);
  await raiseDockerStack();

  if (!existsSync(join(ROOT, 'dist'))) {
    if ((await runCmd([bun, 'x', '--bun', 'vite', 'build'], ROOT)) !== 0) statusAttention();
  }

  await launchServer(bun, true);
}

async function modeDev(bun: string): Promise<void> {
  status('working');
  await ensureDependencies(bun);
  await ensureEnvFile(bun);
  await raiseDockerStack();
  registerShutdown(composeFileArgs());
  await launchServer(bun, false);
}

async function main(): Promise<void> {
  process.chdir(ROOT);
  const bun = await ensureBunInstalled();

  switch (MODE) {
    case 'build':
      await modeBuild(bun);
      break;
    case 'dev':
      await modeDev(bun);
      break;
    default:
      await modeStart(bun);
  }
}

main().catch(() => statusAttention());
