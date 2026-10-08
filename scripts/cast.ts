#!/usr/bin/env bun
/**
 * ΛΞV & Co. — BEEP Dominion cast spell
 * Founder entry: `bun cast` → docker compose + vite (dev) or CI deploy pipeline.
 */
import { spawn, spawnSync, type Subprocess } from 'bun';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const COMPOSE_BASE = join(ROOT, 'docker-compose.yml');
const COMPOSE_DEV = join(ROOT, 'docker-compose.dev.yml');

const PLAIN = process.env.BEEP_PLAIN === '1';
const MODE = resolveMode(process.argv.slice(2));
const IS_CI = process.env.CI === 'true' || process.env.DOKPLOY === '1';

const C = PLAIN
  ? { cyan: '', green: '', yellow: '', red: '', dim: '', bold: '', nc: '' }
  : {
      cyan: '\x1b[0;36m',
      green: '\x1b[0;32m',
      yellow: '\x1b[1;33m',
      red: '\x1b[0;31m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
      nc: '\x1b[0m',
    };

let stepIndex = 0;
let totalSteps = MODE === 'dev' ? 5 : MODE === 'deploy' ? 7 : 2;
let composeProc: Subprocess | null = null;
let viteProc: Subprocess | null = null;
let shuttingDown = false;

function resolveMode(args: string[]): 'dev' | 'deploy' | 'status' | 'down' {
  const flag = args.find((a) => a.startsWith('--'));
  if (flag === '--deploy') return 'deploy';
  if (flag === '--status') return 'status';
  if (flag === '--down') return 'down';
  if (IS_CI) return 'deploy';
  return 'dev';
}

function banner(): void {
  if (PLAIN) {
    console.log('\n  BEEP Dominion — ΛΞV & Co.\n');
    return;
  }
  console.log(`
${C.cyan}  ╔══════════════════════════════════════╗
  ║  Λ  function  →  Ξ  unknown  →  V    ║
  ║       BEEP Dominion · cast spell       ║
  ╚══════════════════════════════════════╝${C.nc}
${C.dim}  ΛΞV & Co. — We recontextualize the past because the future needs context.${C.nc}
`);
}

function logStep(label: string): void {
  stepIndex += 1;
  const bar = PLAIN ? `[${stepIndex}/${totalSteps}]` : `━━━ [${stepIndex}/${totalSteps}]`;
  console.log(`\n${C.bold}${bar} ${label}${C.nc}`);
}

function fail(message: string, code = 1): never {
  console.error(`${C.red}✗ ${message}${C.nc}`);
  process.exit(code);
}

function ok(message: string): void {
  console.log(`${C.green}✓ ${message}${C.nc}`);
}

function requireDocker(): void {
  const which = spawnSync(['which', 'docker']);
  if (which.exitCode !== 0) {
    fail('Docker not found. Install Docker Engine or Podman with compose plugin.');
  }
  const version = spawnSync(['docker', 'compose', 'version']);
  if (version.exitCode !== 0) {
    fail('docker compose plugin not available.');
  }
}

function composeArgs(extra: string[] = []): string[] {
  return ['compose', '-f', COMPOSE_BASE, '-f', COMPOSE_DEV, ...extra];
}

async function runInherit(cmd: string[], cwd = ROOT): Promise<number> {
  const proc = spawn({
    cmd,
    cwd,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: process.env,
  });
  return proc.exited;
}

async function runCapture(cmd: string[], cwd = ROOT): Promise<{ code: number; text: string }> {
  const proc = spawn({
    cmd,
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
    env: process.env,
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, text: (stdout + stderr).trim() };
}

async function validateComposeConfig(): Promise<void> {
  const { code } = await runCapture(['docker', ...composeArgs(['config', '-q'])]);
  if (code !== 0) {
    fail('docker compose config validation failed.');
  }
  ok('Compose configuration valid');
}

async function ensureDeps(): Promise<void> {
  if (!existsSync(join(ROOT, 'node_modules'))) {
    logStep('Installing dependencies');
    const code = await runInherit(['bun', 'install'], ROOT);
    if (code !== 0) fail('bun install failed');
  }
}

function registerShutdownHandlers(): void {
  const cleanup = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${C.yellow}↯ ${signal} — tearing down Dominion…${C.nc}`);

    if (viteProc) {
      viteProc.kill();
      viteProc = null;
    }

    await runInherit(['docker', ...composeArgs(['down', '--remove-orphans'])]);
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };

  process.on('SIGINT', () => void cleanup('SIGINT'));
  process.on('SIGTERM', () => void cleanup('SIGTERM'));
}

async function waitForUrl(url: string, label: string, attempts = 30): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        ok(`${label} ready (${url})`);
        return;
      }
    } catch {
      /* retry */
    }
    await Bun.sleep(2000);
  }
  console.warn(`${C.yellow}⚠ ${label} not confirmed at ${url} — continuing${C.nc}`);
}

async function modeStatus(): Promise<void> {
  banner();
  logStep('Compose service status');
  await runInherit(['docker', ...composeArgs(['ps'])]);
  logStep('Health probes');
  await waitForUrl('http://127.0.0.1:4000/health/liveliness', 'LiteLLM', 3);
  await waitForUrl('http://127.0.0.1:3100/health', 'Postman MCP', 3);
  await waitForUrl('http://127.0.0.1:11434/api/tags', 'Ollama', 3);
}

async function modeDown(): Promise<void> {
  banner();
  logStep('Stopping BEEP Dominion stack');
  const code = await runInherit(['docker', ...composeArgs(['down', '--remove-orphans'])]);
  process.exit(code);
}

async function modeDev(): Promise<void> {
  banner();
  registerShutdownHandlers();

  logStep('Preflight — Docker & Compose');
  requireDocker();

  logStep('Validate compose manifests');
  await validateComposeConfig();

  logStep('Ensure Bun dependencies');
  await ensureDeps();

  logStep('Raise Dominion stack (ollama → mcp)');
  composeProc = spawn({
    cmd: ['docker', ...composeArgs(['up', '--build', '--wait', '--remove-orphans'])],
    cwd: ROOT,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: process.env,
  });

  const composeCode = await composeProc.exited;
  if (composeCode !== 0) {
    fail(`docker compose exited with code ${composeCode}`, composeCode);
  }
  ok('Dominion stack healthy');

  logStep('Ignite Vite command surface (:3000)');
  console.log(`${C.dim}  Proxies: /ollama → :11434 · /api/postman,/mcp → :3100${C.nc}\n`);

  viteProc = spawn({
    cmd: ['bunx', '--bun', 'vite'],
    cwd: ROOT,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: process.env,
  });

  const viteCode = await viteProc.exited;
  if (!shuttingDown && viteCode !== 0) {
    fail(`Vite exited with code ${viteCode}`, viteCode);
  }
}

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    fail(`Missing CI secrets: ${missing.join(', ')}`);
  }
}

async function appwriteClient(): Promise<void> {
  requireEnv(['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY']);
  const endpoint = process.env.APPWRITE_ENDPOINT!;
  const projectId = process.env.APPWRITE_PROJECT_ID!;
  const apiKey = process.env.APPWRITE_API_KEY!;

  const clientCode = await runInherit([
    'appwrite',
    'client',
    '--endpoint',
    endpoint,
    '--project-id',
    projectId,
    '--key',
    apiKey,
  ]);
  if (clientCode !== 0) fail('appwrite client configuration failed');
  ok('Appwrite CLI client configured');
}

async function modeDeploy(): Promise<void> {
  banner();
  totalSteps = 7;

  logStep('Run test suite');
  await ensureDeps();
  const testCode = await runInherit(['bun', 'test']);
  if (testCode !== 0) fail('bun test failed', testCode);
  ok('Tests passed');

  logStep('Production build (Appwrite Sites artifact)');
  const buildCode = await runInherit(['bun', 'run', 'build']);
  if (buildCode !== 0) fail('bun run build failed', buildCode);
  ok('dist/ ready for Sites');

  logStep('Appwrite push — tables, buckets, functions, site');
  await appwriteClient();
  for (const target of ['tables', 'buckets', 'functions', 'sites'] as const) {
    const code = await runInherit(['appwrite', 'push', target, '--force']);
    if (code !== 0) fail(`appwrite push ${target} failed`, code);
    ok(`appwrite push ${target}`);
  }

  logStep('Build & tag MCP image');
  requireDocker();
  const image = process.env.BEEP_MCP_IMAGE ?? 'beep-mcp:local';
  const dockerCode = await runInherit([
    'docker',
    'build',
    '-f',
    'Dockerfile.mcp',
    '-t',
    image,
    '.',
  ]);
  if (dockerCode !== 0) fail('docker build Dockerfile.mcp failed', dockerCode);
  ok(`Image built: ${image}`);

  if (process.env.BEEP_MCP_IMAGE?.includes('/')) {
    logStep('Push MCP image to registry');
    const pushCode = await runInherit(['docker', 'push', image]);
    if (pushCode !== 0) fail('docker push failed', pushCode);
    ok('Image pushed');
  }

  logStep('Trigger Dokploy redeploy (optional)');
  const dokployHost = process.env.DOKPLOY_HOST?.replace(/\/$/, '');
  const composeId = process.env.DOKPLOY_COMPOSE_ID;
  const dokployKey = process.env.DOKPLOY_API_KEY;
  if (dokployHost && composeId && dokployKey) {
    const res = await fetch(`${dokployHost}/api/compose.redeploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': dokployKey,
      },
      body: JSON.stringify({ composeId }),
    });
    if (!res.ok) {
      fail(`Dokploy redeploy failed: ${res.status} ${await res.text()}`);
    }
    ok('Dokploy compose redeploy triggered');
  } else {
    console.log(`${C.dim}  Skipped — set DOKPLOY_HOST, DOKPLOY_COMPOSE_ID, DOKPLOY_API_KEY in CI${C.nc}`);
  }

  logStep('Post-deploy smoke (local health URLs if stack running)');
  await waitForUrl('http://127.0.0.1:3100/health', 'MCP /health');
  console.log(`\n${C.green}Cast complete — enterprise pipeline green.${C.nc}\n`);
}

async function main(): Promise<void> {
  process.chdir(ROOT);

  switch (MODE) {
    case 'status':
      await modeStatus();
      break;
    case 'down':
      await modeDown();
      break;
    case 'deploy':
      await modeDeploy();
      break;
    default:
      await modeDev();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  fail(message);
});
